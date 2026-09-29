import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [livros, usuarios, emprestimos, emaberto] = await Promise.all([
      prisma.exemplar.count(),
      prisma.usuario.count(),
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

    const topUsuariosGroups = await prisma.emprestimo.groupBy({
      by: ["usuarioId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })

    const topLivros = await Promise.all(
      topExemplarGroups.map(async (group: { exemplarId: number; _count: { id: number } }) => {
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

    const topUsuarios = await Promise.all(
      topUsuariosGroups.map(async (group: { usuarioId: number; _count: { id: number } }) => {
        const usuario = await prisma.usuario.findUnique({ where: { id: group.usuarioId } })
        return {
          id: group.usuarioId,
          nome: usuario?.nome ?? "Desconhecido",
          tipo: usuario?.tipo ?? "ALUNO",
          matricula: usuario?.matricula ?? null,
          cpf: usuario?.cpf ?? null,
          count: group._count?.id ?? 0,
        }
      })
    )

    return NextResponse.json({
      livros,
      usuarios,
      emprestimos,
      emaberto,
      topLivros,
      topUsuarios,
    })
  } catch {
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
