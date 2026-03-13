import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // O ID do aluno e do livro que vamos receber da tela
    const { alunoId, livroId } = body

    // Isso cria o registro de que o livro saiu
    const novoEmprestimo = await (prisma.emprestimo as any).create({
      data: {
        alunoId: Number(alunoId),
        livroId: Number(livroId),
        dataEmprestimo: new Date(),
      }
    })

    return NextResponse.json(novoEmprestimo)
  } catch (error: any) {
    console.error("ERRO:", error)
    return NextResponse.json({ error: "Erro ao salvar empréstimo" }, { status: 500 })
  }
}