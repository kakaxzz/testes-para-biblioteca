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
 
    // Validação: aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
    })
    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      )
    }
 
    // Validação: livro existe
    const livro = await prisma.livro.findUnique({
      where: { id: Number(livroId) },
    })
    if (!livro) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      )
    }
 
    // Validação: livro está disponível
    if (livro.status !== "disponivel") {
      return NextResponse.json(
        { error: `Este livro não está disponível para empréstimo (status: ${livro.status}).` },
        { status: 409 }
      )
    }
 
    // Validação: aluno já possui empréstimo em aberto
    const emprestimoEmAberto = await prisma.emprestimo.findFirst({
      where: {
        alunoId: Number(alunoId),
        dataDevolucao: null,
      },
      include: { livro: true },
    })
    if (emprestimoEmAberto) {
      return NextResponse.json(
        {
          error: `${aluno.nome} já possui o livro "${emprestimoEmAberto.livro.titulo}" em aberto. É preciso devolvê-lo antes de fazer um novo empréstimo.`,
        },
        { status: 409 }
      )
    }
 
    // Tudo ok — cria o empréstimo e marca o livro como reservado
    const novoEmprestimo = await prisma.emprestimo.create({
      data: {
        alunoId: Number(alunoId),
        livroId: Number(livroId),
        dataEmprestimo: new Date(),
      },
    })
 
    await prisma.livro.update({
      where: { id: Number(livroId) },
      data: { status: "reservado" },
    })
 
    return NextResponse.json(novoEmprestimo)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao salvar empréstimo.", detalhe: error.message },
      { status: 500 }
    )
  }
}