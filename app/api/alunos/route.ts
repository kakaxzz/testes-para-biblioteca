import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matricula = searchParams.get("matricula")

  if (matricula) {
    const aluno = await prisma.aluno.findUnique({ where: { matricula } })
    if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    return NextResponse.json(aluno)
  }

  const alunos = await prisma.aluno.findMany({ orderBy: { nome: "asc" } })
  return NextResponse.json(alunos)
}

export async function POST(request: Request) {
  try {
    const { nome, matricula, whatsapp } = await request.json()

    const existe = await prisma.aluno.findUnique({ where: { matricula } })
    if (existe) return NextResponse.json({ error: "Matrícula já cadastrada." }, { status: 400 })

    const aluno = await prisma.aluno.create({ data: { nome, matricula, whatsapp: whatsapp || "" } })
    return NextResponse.json(aluno)
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao cadastrar aluno." }, { status: 500 })
  }
}
