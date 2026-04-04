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

    const livros = await prisma.livro.findMany({ where, orderBy: { tombo: "asc" } })
    return NextResponse.json(livros)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const livroExistente = await prisma.livro.findUnique({ where: { isbn: body.isbn } })
    if (livroExistente) {
      return NextResponse.json({ error: "Este ISBN já está cadastrado no sistema." }, { status: 400 })
    }

    // Gera tombo sequencial automático
    const ultimo = await prisma.livro.findFirst({
      orderBy: { tombo: "desc" },
      where: { tombo: { not: null } },
    })
    const proximoTombo = (ultimo?.tombo ?? 0) + 1

    const livro = await prisma.livro.create({
      data: {
        titulo: body.titulo,
        autor: body.autor,
        isbn: body.isbn,
        sinopse: body.sinopse || "",
        capa: body.capa || null,
        assuntos: Array.isArray(body.assuntos) ? body.assuntos.join(", ") : (body.assuntos || ""),
        quantidadeTotal: parseInt(body.quantidadeTotal) || 1,
        tombo: proximoTombo,
        cutter: body.cutter || null,
        cdd: body.cdd || null,
        editora: body.editora || null,
        edicao: body.edicao || null,
        volume: body.volume || null,
      },
    })

    return NextResponse.json(livro)
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao salvar livro.", detalhe: error.message }, { status: 500 })
  }
}
