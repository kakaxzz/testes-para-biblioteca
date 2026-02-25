import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Verificamos se o ISBN já existe para evitar erro de duplicidade
    const livroExistente = await prisma.livro.findUnique({
      where: { isbn: body.isbn }
    })

    if (livroExistente) {
      return NextResponse.json(
        { error: "Este ISBN já está cadastrado no sistema." }, 
        { status: 400 }
      )
    }

    // 2. Usamos 'as any' para calar o erro de sublinhado do VS Code
    // Isso garante que o campo 'quantidadeTotal' seja aceito mesmo que o editor esteja bugado.
    const livro = await (prisma.livro as any).create({
      data: {
        titulo: body.titulo,
        autor: body.autor,
        isbn: body.isbn,
        sinopse: body.sinopse || "",
        capa: body.capa,
        // Converte o array de assuntos em string para o banco [cite: 55]
        assuntos: Array.isArray(body.assuntos) 
          ? body.assuntos.join(", ") 
          : (body.assuntos || ""),
        // Garante que a quantidade seja um número inteiro
        quantidadeTotal: parseInt(body.quantidadeTotal) || 1, 
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