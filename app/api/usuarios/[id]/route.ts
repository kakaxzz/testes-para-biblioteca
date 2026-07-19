import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } })
  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
  return NextResponse.json(usuario)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const { nome, tipo, matricula, cpf, whatsapp } = body

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios." }, { status: 400 })
    }

    if (!["ALUNO", "FUNCIONARIO", "RESPONSAVEL"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 })
    }

    if (tipo === "ALUNO" && !matricula) {
      return NextResponse.json({ error: "Matrícula é obrigatória para alunos." }, { status: 400 })
    }
    if (tipo !== "ALUNO" && !cpf) {
      return NextResponse.json({ error: "CPF é obrigatório para funcionários e responsáveis." }, { status: 400 })
    }

    // Verifica se a matrícula/cpf já pertence a outro usuário
    if (tipo === "ALUNO") {
      const existe = await prisma.usuario.findUnique({ where: { matricula } })
      if (existe && existe.id !== Number(id)) {
        return NextResponse.json({ error: "Matrícula já cadastrada para outro usuário." }, { status: 400 })
      }
    } else {
      const existe = await prisma.usuario.findUnique({ where: { cpf } })
      if (existe && existe.id !== Number(id)) {
        return NextResponse.json({ error: "CPF já cadastrado para outro usuário." }, { status: 400 })
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
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
    return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: {
        emprestimos: { where: { dataDevolucao: null } },
      },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })

    if (usuario.emprestimos.length > 0) {
      return NextResponse.json(
        { error: "Não é possível remover um usuário com empréstimo em aberto." },
        { status: 400 }
      )
    }

    // Remove o histórico de empréstimos (já devolvidos) e então o usuário
    await prisma.emprestimo.deleteMany({ where: { usuarioId: Number(id) } })
    await prisma.usuario.delete({ where: { id: Number(id) } })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao remover usuário." }, { status: 500 })
  }
}
