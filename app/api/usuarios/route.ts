import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matricula = searchParams.get("matricula")
  const cpf = searchParams.get("cpf")

  if (matricula) {
    const usuario = await prisma.usuario.findUnique({ where: { matricula } })
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json(usuario)
  }

  if (cpf) {
    const usuario = await prisma.usuario.findUnique({ where: { cpf } })
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json(usuario)
  }

  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } })
  return NextResponse.json(usuarios)
}

export async function POST(request: Request) {
  try {
    const { nome, tipo, matricula, cpf, whatsapp } = await request.json()

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios." }, { status: 400 })
    }

    if (!["ALUNO", "FUNCIONARIO", "RESPONSAVEL"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 })
    }

    if (tipo === "ALUNO") {
      if (!matricula) {
        return NextResponse.json({ error: "Matrícula é obrigatória para alunos." }, { status: 400 })
      }
      const existe = await prisma.usuario.findUnique({ where: { matricula } })
      if (existe) return NextResponse.json({ error: "Matrícula já cadastrada." }, { status: 400 })
    } else {
      if (!cpf) {
        return NextResponse.json({ error: "CPF é obrigatório para funcionários e responsáveis." }, { status: 400 })
      }
      const existe = await prisma.usuario.findUnique({ where: { cpf } })
      if (existe) return NextResponse.json({ error: "CPF já cadastrado." }, { status: 400 })
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        tipo,
        matricula: tipo === "ALUNO" ? matricula : null,
        cpf: tipo !== "ALUNO" ? cpf : null,
        whatsapp: whatsapp || "",
      },
    })

    return NextResponse.json(usuario)
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao cadastrar usuário." }, { status: 500 })
  }
}
