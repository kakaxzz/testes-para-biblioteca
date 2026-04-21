import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [livros, alunos, emprestimos, emaberto] = await Promise.all([
      prisma.exemplar.count(),
      prisma.aluno.count(),
      prisma.emprestimo.count(),
      prisma.emprestimo.count({ where: { dataDevolucao: null } }),
    ])

    // Agrupa por exemplarId e depois busca o livro via exemplar
    const topExemplarGroups = await prisma.emprestimo.groupBy({
      by: ["exemplarId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })

    const topAlunosGroups = await prisma.emprestimo.groupBy({
      by: ["alunoId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })

    const topLivros = await Promise.all(
      topExemplarGroups.map(async (group) => {
        const exemplar = await prisma.exemplar.findUnique({
          where: { id: group.exemplarId },
          include: { livro: true },
        })
        return {
          id: exemplar?.livro?.id ?? group.exemplarId,
          titulo: exemplar?.livro?.titulo ?? "Desconhecido",
          autor: exemplar?.livro?.autor ?? "-",
          isbn: exemplar?.livro?.isbn ?? "-",
          count: group._count?.id ?? 0,
        }
      })
    )

    const topAlunos = await Promise.all(
      topAlunosGroups.map(async (group) => {
        const aluno = await prisma.aluno.findUnique({ where: { id: group.alunoId } })
        return {
          id: group.alunoId,
          nome: aluno?.nome ?? "Desconhecido",
          matricula: aluno?.matricula ?? "-",
          count: group._count?.id ?? 0,
        }
      })
    )

    return NextResponse.json({
      livros,
      alunos,
      emprestimos,
      emaberto,
      topLivros,
      topAlunos,
    })
  } catch {
    return NextResponse.json({
      livros: 0,
      alunos: 0,
      emprestimos: 0,
      emaberto: 0,
      topLivros: [],
      topAlunos: [],
    })
  }
}