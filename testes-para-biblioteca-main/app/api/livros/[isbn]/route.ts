import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  try {
    const { isbn } = await params
    const isbnLimpo = isbn.trim()

    const livro = await prisma.livro.findUnique({
      where: { isbn: isbnLimpo },
      include: {
        _count: {
          select: { 
            emprestimos: { 
              where: { dataDevolucao: null } 
            } 
          }
        }
      }
    })

    if (!livro) {
      return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })
    }

    const total = (livro as any).quantidadeTotal || 0
    const emprestados = (livro as any)._count?.emprestimos || 0
    const disponiveis = total - emprestados

    // Se o status manual for 'reservado', mostra isso independente da quantidade
    const statusManual = (livro as any).status || 'disponivel'

    let statusTexto: string
    if (statusManual === 'reservado') {
      statusTexto = "Reservado"
    } else if (disponiveis > 0) {
      statusTexto = `Na biblioteca (${disponiveis} Disponíveis)`
    } else {
      statusTexto = "Indisponível (Todos emprestados)"
    }

    return NextResponse.json({
      ...livro,
      quantidadeDisponivel: disponiveis,
      statusTexto: statusTexto,
      status: statusManual,
    })

  } catch (error: any) {
    console.error("Erro na busca por ISBN:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  try {
    const { isbn } = await params
    const isbnLimpo = isbn.trim()
    const body = await request.json()

    const { status } = body

    // Valida os valores permitidos
    const statusPermitidos = ['disponivel', 'reservado']
    if (!statusPermitidos.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${statusPermitidos.join(', ')}` },
        { status: 400 }
      )
    }

    const livroAtualizado = await (prisma.livro as any).update({
      where: { isbn: isbnLimpo },
      data: { status },
    })

    return NextResponse.json(livroAtualizado)

  } catch (error: any) {
    console.error("Erro ao atualizar status:", error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}
