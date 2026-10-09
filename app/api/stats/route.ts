import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const LIMITE_TOP = 5

export async function GET() {
  try {
    const [livros, usuarios, emprestimos, emaberto] = await Promise.all([
      prisma.exemplar.count(),
      prisma.usuario.count(),
      prisma.emprestimo.count(),
      prisma.emprestimo.count({ where: { dataDevolucao: null } }),
    ])

    // Top livros: soma os empréstimos de todos os exemplares do mesmo livro
    // (antes cada exemplar contava separado e o mesmo livro podia aparecer várias vezes)
    const topLivros = (
      await prisma.$queryRaw<
        { id: number; titulo: string; autor: string; isbn: string; count: number }[]
      >`
        SELECT l."id", l."titulo", l."autor", l."isbn", COUNT(*)::int AS "count"
        FROM "Emprestimo" e
        JOIN "Exemplar" x ON x."id" = e."exemplarId"
        JOIN "Livro" l ON l."id" = x."livroId"
        GROUP BY l."id", l."titulo", l."autor", l."isbn"
        ORDER BY "count" DESC, l."titulo" ASC
        LIMIT ${LIMITE_TOP}
      `
    ).map((l) => ({ ...l, count: Number(l.count) }))

    const topUsuariosGroups = await prisma.emprestimo.groupBy({
      by: ["usuarioId"],
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

    return NextResponse.json({ livros, usuarios, emprestimos, emaberto, topLivros, topUsuarios })
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
    return NextResponse.json({
      livros: 0,
      usuarios: 0,
      emprestimos: 0,
      emaberto: 0,
      topLivros: [],
      topUsuarios: [],
    })
  }
}
