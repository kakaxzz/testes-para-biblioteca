import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type NoticeInput = { titulo?: unknown; mensagem?: unknown; tag?: unknown }

export async function GET() {
  try {
    const avisos = await prisma.aviso.findMany({
      orderBy: [{ ordem: "asc" }, { id: "asc" }],
      select: { id: true, titulo: true, mensagem: true, tag: true },
    })
    return NextResponse.json(avisos)
  } catch (error) {
    console.error("Erro ao carregar avisos:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// Salva a lista inteira (a ordem do array vira a ordem de exibição)
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as NoticeInput[]
    if (!Array.isArray(body)) {
      return NextResponse.json({ message: "O corpo deve ser uma lista de avisos." }, { status: 400 })
    }

    const avisos = body
      .map((n) => ({
        titulo: String(n.titulo ?? "").trim().slice(0, 150),
        mensagem: String(n.mensagem ?? "").trim().slice(0, 1000),
        tag: String(n.tag ?? "").trim().slice(0, 40),
      }))
      // descarta avisos totalmente em branco
      .filter((n) => n.titulo || n.mensagem)

    await prisma.$transaction([
      prisma.aviso.deleteMany(),
      prisma.aviso.createMany({
        data: avisos.map((n, i) => ({ ...n, ordem: i })),
      }),
    ])

    return NextResponse.json({ success: true, total: avisos.length })
  } catch (error) {
    console.error("Erro ao salvar avisos:", error)
    return NextResponse.json({ message: "Não foi possível salvar os avisos." }, { status: 500 })
  }
}
