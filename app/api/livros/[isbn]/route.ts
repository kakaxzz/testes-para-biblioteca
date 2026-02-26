import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  try {
    const { isbn } = await params
    const isbnLimpo = isbn.trim()

    // Buscamos o livro tentando incluir os empréstimos
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

    // Pegamos a quantidade total (usando 'as any' para evitar erro de sublinhado)
    const total = (livro as any).quantidadeTotal || 0
    // O count traz quantos empréstimos ativos existem
    const emprestados = (livro as any)._count?.emprestimos || 0
    const disponiveis = total - emprestados

    const statusTexto = disponiveis > 0 
      ? `Na biblioteca (${disponiveis} Disponíveis)` 
      : "Indisponível (Todos emprestados)"

    return NextResponse.json({
      ...livro,
      quantidadeDisponivel: disponiveis,
      statusTexto: statusTexto
    })

  } catch (error: any) {
    console.error("Erro na busca por ISBN:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}