import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      include: {
        aluno: true,
        livro: true
      },
      orderBy: {
        dataEmprestimo: "desc"
      }
    })

    return NextResponse.json(emprestimos)
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar empréstimos" },
      { status: 500 }
    )
  }
}



export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { alunoId, livroId } = body

    const novoEmprestimo = await prisma.emprestimo.create({
      data: {
        alunoId: Number(alunoId),
        livroId: Number(livroId),
        dataEmprestimo: new Date(),
      }
    })

    return NextResponse.json(novoEmprestimo)

  } catch (error: any) {
    console.error("ERRO:", error)
    return NextResponse.json(
      { error: "Erro ao salvar empréstimo" },
      { status: 500 }
    )
  }
}