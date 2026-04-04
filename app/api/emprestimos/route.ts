import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apenasAbertos = searchParams.get("abertos") === "true"

  const emprestimos = await prisma.emprestimo.findMany({
    where: apenasAbertos ? { dataDevolucao: null } : {},
    include: { aluno: true, livro: true },
    orderBy: { dataEmprestimo: "desc" },
  })

  return NextResponse.json(emprestimos)
}

export async function POST(request: Request) {
  try {
    const { alunoId, livroId } = await request.json()

    const novoEmprestimo = await prisma.emprestimo.create({
      data: {
        alunoId: Number(alunoId),
        livroId: Number(livroId),
        dataEmprestimo: new Date(),
      },
    })

    // Marca livro como reservado
    await prisma.livro.update({
      where: { id: Number(livroId) },
      data: { status: "reservado" },
    })

    return NextResponse.json(novoEmprestimo)
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao salvar empréstimo" }, { status: 500 })
  }
}
