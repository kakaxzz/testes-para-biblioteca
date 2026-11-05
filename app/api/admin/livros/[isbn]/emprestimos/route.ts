import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const ULTIMOS = 10

export async function GET(
  _request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  try {
    const livro = await prisma.livro.findUnique({ where: { isbn }, select: { id: true } })
    if (!livro) return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })

    const where = { exemplar: { livroId: livro.id } }
    const [total, emAberto, ultimos] = await Promise.all([
      prisma.emprestimo.count({ where }),
      prisma.emprestimo.count({ where: { ...where, dataDevolucao: null } }),
      prisma.emprestimo.findMany({
        where,
        orderBy: { dataEmprestimo: "desc" },
        take: ULTIMOS,
        select: {
          id: true,
          dataEmprestimo: true,
          dataDevolucao: true,
          exemplar: { select: { tombo: true } },
          usuario: { select: { nome: true, turma: true, tipo: true } },
        },
      }),
    ])

    return NextResponse.json({ total, emAberto, ultimos })
  } catch {
    return NextResponse.json({ error: "Erro ao buscar empréstimos do livro." }, { status: 500 })
  }
}
