import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const emprestimo = await prisma.emprestimo.update({
      where: {
        id: Number(id)
      },
      data: {
        dataDevolucao: new Date()
      }
    })

    return NextResponse.json(emprestimo)

  } catch (error) {
    console.error("Erro ao devolver livro:", error)

    return NextResponse.json(
      { error: "Erro ao devolver livro" },
      { status: 500 }
    )
  }
}