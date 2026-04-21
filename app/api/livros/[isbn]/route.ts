import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { Exemplar, Emprestimo } from "@prisma/client"

export async function GET(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  const livro = await prisma.livro.findUnique({
    where: { isbn },
    include: {
      exemplares: { orderBy: { tombo: "asc" } },
    },
  })
  if (!livro) return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })

  return NextResponse.json({
    ...livro,
    quantidadeTotal: livro.exemplares.length,
    quantidadeDisponivel: livro.exemplares.filter((e: Exemplar) => e.status === "disponivel").length,
    tombo: livro.exemplares[0]?.tombo ?? null,
  })
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
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar livro." }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await context.params
  try {
    const livro = await prisma.livro.findUnique({
      where: { isbn },
      include: {
        exemplares: {
          include: {
            emprestimos: { where: { dataDevolucao: null } },
          },
        },
      },
    })

    if (!livro) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 })

    // Verifica se algum exemplar tem empréstimo ativo
    const temEmprestimoAtivo = livro.exemplares.some((e: Exemplar & { emprestimos: Emprestimo[] }) => e.emprestimos.length > 0)
    if (temEmprestimoAtivo) {
      return NextResponse.json(
        { error: "Não é possível remover um livro com empréstimo ativo." },
        { status: 400 }
      )
    }

    await prisma.livro.delete({ where: { isbn } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao remover livro." }, { status: 500 })
  }
}