import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  try {
    const { isbn } = await params

    const livro = await prisma.livro.findUnique({
      where: {
        isbn: isbn.trim(),
      },
    })

    if (!livro) {
      return Response.json(
        { error: "Livro não encontrado" },
        { status: 404 }
      )
    }

    return Response.json(livro)

  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "Erro no servidor" },
      { status: 500 }
    )
  }
}