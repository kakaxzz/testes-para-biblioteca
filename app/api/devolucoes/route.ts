import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { emprestimoId } = await request.json()

    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: Number(emprestimoId) },
      include: { livro: true },
    })

    if (!emprestimo) {
      return NextResponse.json({ error: "Empréstimo não encontrado." }, { status: 404 })
    }

    if (emprestimo.dataDevolucao) {
      return NextResponse.json({ error: "Este livro já foi devolvido." }, { status: 400 })
    }

    // Registra a devolução
    await prisma.emprestimo.update({
      where: { id: Number(emprestimoId) },
      data: { dataDevolucao: new Date() },
    })

    // Atualiza status do livro para disponível
    await prisma.livro.update({
      where: { id: emprestimo.livroId },
      data: { status: "disponivel" },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Erro ao registrar devolução:", error)
    return NextResponse.json({ error: "Erro ao registrar devolução." }, { status: 500 })
  }
}
