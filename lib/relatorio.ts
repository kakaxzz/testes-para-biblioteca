import { prisma } from "@/lib/prisma"
import { mascararCpf } from "@/lib/mascara"

// Prazo de devolução usado em /admin/emprestimos (10 dias).
const PRAZO_DIAS = 10
const ANO_MINIMO = 2000

export type Periodo = {
  inicioISO: string // "2026-01-01" (como o admin escolheu)
  fimISO: string // "2026-11-10" (inclusivo)
  inicio: Date // 00:00 de Brasília do dia inicial
  fim: Date // 00:00 de Brasília do dia seguinte ao final (exclusivo)
}

export type PeriodoInterpretado = ({ ok: true } & Periodo) | { ok: false; erro: string }

// Brasília é UTC-3 o ano todo (sem horário de verão), a mesma convenção de lib/estatisticas.ts.
function meiaNoiteDeBrasilia(ano: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(ano, mes - 1, dia, 3))
}

function lerData(texto: string | null): { ano: number; mes: number; dia: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto ?? "")
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  const teste = new Date(Date.UTC(ano, mes - 1, dia))
  // Rejeita datas que não existem (ex.: 31/02).
  if (teste.getUTCFullYear() !== ano || teste.getUTCMonth() !== mes - 1 || teste.getUTCDate() !== dia) return null
  return { ano, mes, dia }
}

export function interpretarPeriodo(inicioTexto: string | null, fimTexto: string | null): PeriodoInterpretado {
  const ini = lerData(inicioTexto)
  const fim = lerData(fimTexto)
  if (!ini || !fim) return { ok: false, erro: "Informe a data inicial e a data final (formato AAAA-MM-DD)." }
  if (ini.ano < ANO_MINIMO || fim.ano < ANO_MINIMO) return { ok: false, erro: `As datas devem ser a partir de ${ANO_MINIMO}.` }
  if (inicioTexto! > fimTexto!) return { ok: false, erro: "A data inicial não pode ser depois da data final." }

  return {
    ok: true,
    inicioISO: inicioTexto!,
    fimISO: fimTexto!,
    inicio: meiaNoiteDeBrasilia(ini.ano, ini.mes, ini.dia),
    fim: meiaNoiteDeBrasilia(fim.ano, fim.mes, fim.dia + 1),
  }
}

// ---------- CSV ----------

const SEPARADOR = ";" // o Excel em português espera ponto e vírgula
const QUEBRA = "\r\n"

// Escapa aspas/separadores e neutraliza "injeção de fórmula": nomes e títulos digitados
// por usuários que começam com = + - @ seriam executados como fórmula ao abrir no Excel.
export function celulaCsv(valor: unknown): string {
  let texto = valor === null || valor === undefined ? "" : String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  if (/[;"\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`
  return texto
}

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export function dataHoraBR(data: Date): string {
  const p = Object.fromEntries(formatadorDataHora.formatToParts(data).map((x) => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

const TIPO_USUARIO: Record<string, string> = {
  ALUNO: "Aluno",
  FUNCIONARIO: "Funcionário",
  RESPONSAVEL: "Responsável",
}

const CABECALHO = [
  "Data do empréstimo",
  "Data da devolução",
  "Situação",
  "Tombo",
  "Título",
  "Autor",
  "ISBN",
  "Leitor",
  "Tipo de leitor",
  "Matrícula / CPF",
  "Turma",
]

type LinhaEmprestimo = {
  dataEmprestimo: Date
  dataDevolucao: Date | null
  exemplar: { tombo: number; livro: { titulo: string; autor: string; isbn: string } }
  usuario: { nome: string; tipo: string; matricula: string | null; cpf: string | null; turma: string | null }
}

export function montarCsv(emprestimos: LinhaEmprestimo[], agora: Date = new Date()): string {
  const linhas: unknown[][] = [CABECALHO]

  for (const e of emprestimos) {
    let situacao = "Devolvido"
    if (!e.dataDevolucao) {
      const dias = Math.floor((agora.getTime() - e.dataEmprestimo.getTime()) / 86400000)
      situacao = dias > PRAZO_DIAS ? "Em atraso" : "Em aberto"
    }
    linhas.push([
      dataHoraBR(e.dataEmprestimo),
      e.dataDevolucao ? dataHoraBR(e.dataDevolucao) : "",
      situacao,
      e.exemplar.tombo,
      e.exemplar.livro.titulo,
      e.exemplar.livro.autor,
      e.exemplar.livro.isbn,
      e.usuario.nome,
      TIPO_USUARIO[e.usuario.tipo] ?? e.usuario.tipo,
      // Mesma regra da tela de usuários: matrícula aparece, CPF fica mascarado.
      e.usuario.matricula || (e.usuario.cpf ? mascararCpf(e.usuario.cpf) : ""),
      e.usuario.turma ?? "",
    ])
  }

  return linhas.map((l) => l.map(celulaCsv).join(SEPARADOR)).join(QUEBRA) + QUEBRA
}

// ---------- Consulta ----------

export type RelatorioGerado = {
  csv: string
  total: number
  aviso: string | null
}

export async function gerarRelatorioEmprestimos(periodo: Periodo): Promise<RelatorioGerado> {
  const emprestimos = await prisma.emprestimo.findMany({
    where: { dataEmprestimo: { gte: periodo.inicio, lt: periodo.fim } },
    include: { usuario: true, exemplar: { include: { livro: true } } },
    orderBy: [{ dataEmprestimo: "asc" }, { id: "asc" }],
  })

  // A virada de ano apaga os empréstimos (de todos os anos) dos alunos que saem da escola.
  // Se houve virada depois do início do período, o relatório pode estar incompleto.
  const viradas = await prisma.virada
    .findMany({
      where: { removidos: { gt: 0 }, executadoEm: { gte: periodo.inicio } },
      select: { ano: true },
      orderBy: { ano: "asc" },
    })
    .catch(() => [] as { ano: number }[])

  const aviso = viradas.length
    ? `Os empréstimos dos alunos removidos na virada de ano (${viradas.map((v) => v.ano).join(", ")}) foram apagados do sistema e não aparecem neste relatório.`
    : null

  return { csv: montarCsv(emprestimos), total: emprestimos.length, aviso }
}
