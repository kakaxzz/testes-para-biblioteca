import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { emprestimoId } = await request.json()

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: Number(emprestimoId) }
    })

    if (!emprestimo) {
      return NextResponse.json({ error: "Empréstimo não encontrado." }, { status: 404 })
    }

    if (emprestimo.dataDevolucao) {
      return NextResponse.json({ error: "Este empréstimo já foi devolvido." }, { status: 400 })
    }

    // Reseta a data de empréstimo para hoje (novo prazo de 10 dias)
    await prisma.emprestimo.update({
      where: { id: Number(emprestimoId) },
      data: { dataEmprestimo: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao renovar empréstimo." }, { status: 500 })
  }
}
