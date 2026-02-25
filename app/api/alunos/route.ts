import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verificamos se os campos obrigatórios chegaram
    if (!body.nome || !body.matricula) {
      return NextResponse.json({ error: "Nome e Matrícula são obrigatórios" }, { status: 400 })
    }

    const aluno = await (prisma.aluno as any).create({
      data: {
        nome: body.nome,
        matricula: body.matricula,
        whatsapp: body.whatsapp || "Não informado", // Evita erro de campo vazio
      },
    })

    return NextResponse.json(aluno)
  } catch (error: any) {
    console.error("ERRO NO BANCO:", error)
    return NextResponse.json(
      { error: "Erro interno", detalhe: error.message },
      { status: 500 }
    )
  }
}