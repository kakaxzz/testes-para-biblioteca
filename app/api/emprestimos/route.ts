import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apenasAbertos = searchParams.get("abertos") === "true"

  const emprestimos = await prisma.emprestimo.findMany({
    where: apenasAbertos ? { dataDevolucao: null } : {},
    include: {
      usuario: true,
      exemplar: {
        include: { livro: true },
      },
    },
    orderBy: { dataEmprestimo: "desc" },
  })

  // Normaliza para manter compatibilidade com a página (e.livro.titulo etc.)
  const normalizados = emprestimos.map((e: any) => ({
    ...e,
    livro: e.exemplar.livro,
    tomboExemplar: e.exemplar.tombo,
  }))

  return NextResponse.json(normalizados)
}

export async function POST(request: Request) {
  try {
    const { usuarioId, livroId } = await request.json()

    // Validação: usuário existe
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } })
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    // Validação: livro existe
    const livro = await prisma.livro.findUnique({ where: { id: Number(livroId) } })
    if (!livro) {
      return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 })
    }

    // Busca um exemplar disponível deste livro
    const exemplarDisponivel = await prisma.exemplar.findFirst({
      where: { livroId: Number(livroId), status: "disponivel" },
      orderBy: { tombo: "asc" },
    })

    if (!exemplarDisponivel) {
      return NextResponse.json(
        { error: "Não há exemplares disponíveis deste livro no momento." },
        { status: 409 }
      )
    }

    // Validação: usuário já possui empréstimo em aberto
    const emprestimoEmAberto = await prisma.emprestimo.findFirst({
      where: { usuarioId: Number(usuarioId), dataDevolucao: null },
      include: { exemplar: { include: { livro: true } } },
    })

    if (emprestimoEmAberto) {
      return NextResponse.json(
        {
          error: `${usuario.nome} já possui o livro "${emprestimoEmAberto.exemplar.livro.titulo}" em aberto. É preciso devolvê-lo antes de fazer um novo empréstimo.`,
        },
        { status: 409 }
      )
    }

    // Cria o empréstimo e marca o exemplar como reservado
    const novoEmprestimo = await prisma.emprestimo.create({
      data: {
        usuarioId: Number(usuarioId),
        exemplarId: exemplarDisponivel.id,
        dataEmprestimo: new Date(),
      },
    })

    await prisma.exemplar.update({
      where: { id: exemplarDisponivel.id },
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
