import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1️⃣ Verifica se o ISBN já existe
    const livroExistente = await prisma.livro.findUnique({
      where: { isbn: body.isbn }
    })

    if (livroExistente) {
      return NextResponse.json(
        { error: "Este ISBN já está cadastrado no sistema." },
        { status: 400 }
      )
    }

    // 2️⃣ Cria o livro no banco (SEM quantidadeTotal)
    const livro = await prisma.livro.create({
      data: {
        titulo: body.titulo,
        autor: body.autor,
        isbn: body.isbn,
        sinopse: body.sinopse || "",
        capa: body.capa || "",
        assuntos: Array.isArray(body.assuntos)
          ? body.assuntos.join(", ")
          : (body.assuntos || ""),
        cdd: body.cdd || ""
      },
    })

    console.log("✅ LIVRO SALVO COM SUCESSO:", livro)

    return NextResponse.json(livro)

  } catch (error: any) {
    console.error("❌ ERRO NO SERVIDOR:", error)

    return NextResponse.json(
      {
        error: "Erro ao salvar livro.",
        detalhe: error.message
      },
      { status: 500 }
    )
  }
}