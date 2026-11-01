import { prisma } from "@/lib/prisma"

const LIMITE_TOP = 5

export type EstatisticasDoAno = {
  livros: number
  usuarios: number
  emprestimos: number
  emaberto: number
  topLivros: { id: number; titulo: string; autor: string; isbn: string; count: number }[]
  topUsuarios: {
    id: number
    nome: string
    tipo: string
    matricula: string | null
    cpf: string | null
    turma: string | null
    count: number
  }[]
}

// Ano de hoje no horário de Brasília (a virada acontece à meia-noite daqui, não da Vercel)
export function anoAtual(): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(new Date())
  )
}

// 01/jan 00:00 em Brasília (UTC-3) até 01/jan do ano seguinte
export function periodoDoAno(ano: number) {
  return { inicio: new Date(Date.UTC(ano, 0, 1, 3)), fim: new Date(Date.UTC(ano + 1, 0, 1, 3)) }
}

// Empréstimos e tops contam só o ano pedido; livros, usuários e "em aberto" são a situação de agora
export async function calcularEstatisticas(ano: number): Promise<EstatisticasDoAno> {
  const { inicio, fim } = periodoDoAno(ano)
  const doAno = { dataEmprestimo: { gte: inicio, lt: fim } }

  const [livros, usuarios, emprestimos, emaberto] = await Promise.all([
    prisma.exemplar.count(),
    prisma.usuario.count(),
    prisma.emprestimo.count({ where: doAno }),
    prisma.emprestimo.count({ where: { dataDevolucao: null } }),
  ])

  // Top livros: soma os empréstimos de todos os exemplares do mesmo livro
  const topLivros = (
    await prisma.$queryRaw<
      { id: number; titulo: string; autor: string; isbn: string; count: number }[]
    >`
      SELECT l."id", l."titulo", l."autor", l."isbn", COUNT(*)::int AS "count"
      FROM "Emprestimo" e
      JOIN "Exemplar" x ON x."id" = e."exemplarId"
      JOIN "Livro" l ON l."id" = x."livroId"
      WHERE e."dataEmprestimo" >= ${inicio} AND e."dataEmprestimo" < ${fim}
      GROUP BY l."id", l."titulo", l."autor", l."isbn"
      ORDER BY "count" DESC, l."titulo" ASC
      LIMIT ${LIMITE_TOP}
    `
  ).map((l) => ({ ...l, count: Number(l.count) }))

  const topUsuariosGroups = await prisma.emprestimo.groupBy({
    by: ["usuarioId"],
    where: doAno,
    _count: { id: true },
    orderBy: [{ _count: { id: "desc" } }, { usuarioId: "asc" }],
    take: LIMITE_TOP,
  })

  const usuariosTop = await prisma.usuario.findMany({
    where: { id: { in: topUsuariosGroups.map((g) => g.usuarioId) } },
  })

  const topUsuarios = topUsuariosGroups.map((group) => {
    const usuario = usuariosTop.find((u) => u.id === group.usuarioId)
    return {
      id: group.usuarioId,
      nome: usuario?.nome ?? "Desconhecido",
      tipo: usuario?.tipo ?? "ALUNO",
      matricula: usuario?.matricula ?? null,
      cpf: usuario?.cpf ?? null,
      turma: usuario?.turma ?? null,
      count: group._count?.id ?? 0,
    }
  })

  return { livros, usuarios, emprestimos, emaberto, topLivros, topUsuarios }
}
