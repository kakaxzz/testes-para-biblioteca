import { prisma } from "@/lib/prisma"
import { anoAtual, calcularEstatisticas } from "@/lib/estatisticas"
import { destinoDaTurma, ORDEM_DA_PROMOCAO } from "@/lib/virada-regras"

// A primeira virada é a de 2026 -> 2027. Antes disso nada roda (evita virar a turma por acidente).
export const PRIMEIRO_ANO_DA_VIRADA = 2026

export type LinhaDoPlano = {
  turma: string
  destino: "promover" | "remover" | "manter"
  novaTurma: string | null
  alunos: number
  comLivroEmAberto: number
}

export type Plano = {
  ano: number // ano que está acabando (o que será resumido)
  executavel: boolean
  motivo: string | null // por que ainda não dá para executar
  executadaEm: string | null
  totais: { promover: number; remover: number; bloqueados: number; semMudanca: number }
  turmas: LinhaDoPlano[]
}

async function lerAlunos() {
  const alunos = await prisma.usuario.findMany({
    where: { tipo: "ALUNO" },
    select: { id: true, turma: true, emprestimos: { where: { dataDevolucao: null }, select: { id: true } } },
  })
  return alunos.map((a) => ({ id: a.id, turma: a.turma, temLivroEmAberto: a.emprestimos.length > 0 }))
}

export async function planejarVirada(): Promise<Plano> {
  const ano = anoAtual() - 1
  const feita = ano >= PRIMEIRO_ANO_DA_VIRADA ? await prisma.virada.findUnique({ where: { ano } }) : null

  let motivo: string | null = null
  if (ano < PRIMEIRO_ANO_DA_VIRADA) motivo = `A virada só pode rodar a partir de 01/01/${PRIMEIRO_ANO_DA_VIRADA + 1}.`
  else if (feita) motivo = `A virada de ${ano} para ${ano + 1} já foi executada.`

  const alunos = await lerAlunos()
  const porTurma = new Map<string, LinhaDoPlano>()
  const totais = { promover: 0, remover: 0, bloqueados: 0, semMudanca: 0 }

  for (const a of alunos) {
    const chave = a.turma?.trim() || "(sem turma)"
    const destino = destinoDaTurma(a.turma)
    let linha = porTurma.get(chave)
    if (!linha) {
      linha = {
        turma: chave,
        destino: destino.tipo,
        novaTurma: destino.tipo === "promover" ? destino.turma : null,
        alunos: 0,
        comLivroEmAberto: 0,
      }
      porTurma.set(chave, linha)
    }
    linha.alunos++
    if (a.temLivroEmAberto) linha.comLivroEmAberto++

    if (destino.tipo === "promover") totais.promover++
    else if (destino.tipo === "manter") totais.semMudanca++
    else if (a.temLivroEmAberto) totais.bloqueados++
    else totais.remover++
  }

  const turmas = [...porTurma.values()].sort((x, y) => x.turma.localeCompare(y.turma, "pt-BR", { numeric: true }))

  return {
    ano,
    executavel: motivo === null,
    motivo,
    executadaEm: feita ? feita.executadoEm.toISOString() : null,
    totais,
    turmas,
  }
}

export type ResultadoDaVirada =
  | { ok: true; ano: number; promovidos: number; removidos: number; pendentes: number }
  | { ok: false; motivo: string }

// Executa a virada do ano que acabou. Seguro para rodar mais de uma vez: a linha em "Virada"
// (chave = ano) é criada dentro da mesma transação, então a segunda tentativa é barrada.
export async function executarVirada(): Promise<ResultadoDaVirada> {
  const ano = anoAtual() - 1
  if (ano < PRIMEIRO_ANO_DA_VIRADA) {
    return { ok: false, motivo: `A virada só pode rodar a partir de 01/01/${PRIMEIRO_ANO_DA_VIRADA + 1}.` }
  }
  if (await prisma.virada.findUnique({ where: { ano } })) {
    return { ok: false, motivo: `A virada de ${ano} para ${ano + 1} já foi executada.` }
  }

  // 1) guarda o resumo do ano ANTES de apagar qualquer aluno
  const estatisticas = await calcularEstatisticas(ano)
  const alunos = await lerAlunos()

  const idsParaRemover: number[] = []
  let pendentes = 0
  for (const a of alunos) {
    if (destinoDaTurma(a.turma).tipo !== "remover") continue
    if (a.temLivroEmAberto) pendentes++ // com livro na mão: fica, a bibliotecária resolve
    else idsParaRemover.push(a.id)
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        await tx.virada.create({ data: { ano, estatisticas: estatisticas as object } })

        // 2) apaga quem saiu (histórico de empréstimos junto, como na remoção manual de usuário)
        if (idsParaRemover.length > 0) {
          await tx.emprestimo.deleteMany({ where: { usuarioId: { in: idsParaRemover } } })
          await tx.usuario.deleteMany({ where: { id: { in: idsParaRemover } } })
        }

        // 3) promove, da turma mais alta para a mais baixa
        let promovidos = 0
        for (const { de, para } of ORDEM_DA_PROMOCAO) {
          const r = await tx.usuario.updateMany({ where: { tipo: "ALUNO", turma: de }, data: { turma: para } })
          promovidos += r.count
        }

        await tx.virada.update({
          where: { ano },
          data: { promovidos, removidos: idsParaRemover.length, pendentes },
        })
        return { ok: true as const, ano, promovidos, removidos: idsParaRemover.length, pendentes }
      },
      { timeout: 60_000, maxWait: 10_000 }
    )
  } catch (erro: any) {
    // P2002 = outra execução criou a linha do ano primeiro
    if (erro?.code === "P2002") return { ok: false, motivo: `A virada de ${ano} para ${ano + 1} já foi executada.` }
    throw erro
  }
}
