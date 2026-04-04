import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  const livro = await prisma.livro.findUnique({ where: { isbn } })
  if (!livro) return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })
  return NextResponse.json(livro)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  try {
    const body = await request.json()
    const livro = await prisma.livro.update({
      where: { isbn },
      data: {
        titulo: body.titulo,
        autor: body.autor,
        sinopse: body.sinopse,
        capa: body.capa,
        assuntos: body.assuntos,
        editora: body.editora,
        edicao: body.edicao,
        cdd: body.cdd,
        cutter: body.cutter,
        volume: body.volume || null,
      },
    })
    return NextResponse.json(livro)
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao atualizar livro." }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  try {
    // Verifica se tem empréstimos ativos
    const livro = await prisma.livro.findUnique({
      where: { isbn },
      include: { emprestimos: { where: { dataDevolucao: null } } }
    })

    if (!livro) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 })

    if (livro.emprestimos.length > 0) {
      return NextResponse.json({ error: "Não é possível remover um livro com empréstimo ativo." }, { status: 400 })
    }

    await prisma.livro.delete({ where: { isbn } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao remover livro." }, { status: 500 })
  }
}
