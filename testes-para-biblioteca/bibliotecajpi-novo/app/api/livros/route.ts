import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const livro = await prisma.livro.create({
      data: {
        titulo: body.titulo,
        autor: body.autor,
        isbn: body.isbn,
        sinopse: body.sinopse || "",
        capa: body.capa,
        assuntos: body.assuntos?.join(", ") || "",
      },
    })

    console.log("SALVO NO BANCO:", livro)

    return Response.json(livro)

  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "Erro ao salvar livro" },
      { status: 500 }
    )
  }
}