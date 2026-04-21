import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const de = searchParams.get("de")
    const ate = searchParams.get("ate")

    const where: any = {}
    if (de || ate) {
      where.criadoEm = {}
      if (de) where.criadoEm.gte = new Date(de)
      if (ate) {
        const fimDia = new Date(ate)
        fimDia.setHours(23, 59, 59, 999)
        where.criadoEm.lte = fimDia
      }
    }

    const livros = await prisma.livro.findMany({
      where,
      orderBy: { criadoEm: "asc" },
      include: {
        exemplares: {
          orderBy: { tombo: "asc" },
        },
      },
    })

    // Adiciona quantidadeTotal e quantidadeDisponivel em cada livro
   const livrosComContagem = livros.map((l: any) => ({
  ...l,
     quantidadeTotal: l.exemplares.length,
  quantidadeDisponivel: l.exemplares.filter((e: any) => e.status === "disponivel").length,
      // Tombo do primeiro exemplar (para exibir na tabela)
      tombo: l.exemplares[0]?.tombo ?? null,
    }))

    return NextResponse.json(livrosComContagem)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Gera próximo tombo (global, independente do livro)
    const ultimoExemplar = await prisma.exemplar.findFirst({
      orderBy: { tombo: "desc" },
    })
    const proximoTombo = (ultimoExemplar?.tombo ?? 0) + 1

    // Verifica se o livro já existe pelo ISBN
    const livroExistente = await prisma.livro.findUnique({
      where: { isbn: body.isbn },
    })

    if (livroExistente) {
      // Livro já existe — só adiciona um novo exemplar
      const novoExemplar = await prisma.exemplar.create({
        data: {
          livroId: livroExistente.id,
          tombo: proximoTombo,
          status: "disponivel",
        },
      })
      return NextResponse.json({ tombo: novoExemplar.tombo, novoExemplar: true })
    }

    // Livro novo — cria o livro e o primeiro exemplar
    const livro = await prisma.livro.create({
      data: {
        titulo: body.titulo,
        autor: body.autor,
        isbn: body.isbn,
        sinopse: body.sinopse || "",
        capa: body.capa || null,
        assuntos: Array.isArray(body.assuntos)
          ? body.assuntos.join(", ")
          : (body.assuntos || ""),
        editora: body.editora || null,
        edicao: body.edicao || null,
        cdd: body.cdd || null,
        cutter: body.cutter || null,
        volume: body.volume || null,
      },
    })

    const exemplar = await prisma.exemplar.create({
      data: {
        livroId: livro.id,
        tombo: proximoTombo,
        status: "disponivel",
      },
    })

    return NextResponse.json({ tombo: exemplar.tombo, novoExemplar: false })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao salvar livro.", detalhe: error.message },
      { status: 500 }
    )
  }
}