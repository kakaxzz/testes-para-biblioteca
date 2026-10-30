import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { emprestimoId } = await request.json()

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: Number(emprestimoId) },
    })

    if (!emprestimo) {
      return NextResponse.json({ error: "Empréstimo não encontrado." }, { status: 404 })
    }

    if (emprestimo.dataDevolucao) {
      return NextResponse.json({ error: "Este empréstimo já foi devolvido." }, { status: 409 })
    }

    const novaData = new Date(emprestimo.dataEmprestimo)
    novaData.setDate(novaData.getDate() + 10)

    await prisma.emprestimo.update({
      where: { id: Number(emprestimoId) },
      data: { dataEmprestimo: novaData },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao renovar empréstimo.", detalhe: error.message },
      { status: 500 }
    )
  }
}