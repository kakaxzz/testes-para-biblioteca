import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { emprestimoId } = await request.json()

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: Number(emprestimoId) },
      include: { exemplar: true },
    })

    if (!emprestimo) {
      return NextResponse.json({ error: "Empréstimo não encontrado." }, { status: 404 })
    }

    if (emprestimo.dataDevolucao) {
      return NextResponse.json({ error: "Este empréstimo já foi devolvido." }, { status: 409 })
    }

    // Registra devolução e libera o exemplar
    await prisma.emprestimo.update({
      where: { id: Number(emprestimoId) },
      data: { dataDevolucao: new Date() },
    })

    await prisma.exemplar.update({
      where: { id: emprestimo.exemplar.id },
      data: { status: "disponivel" },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao registrar devolução.", detalhe: error.message },
      { status: 500 }
    )
  }
}