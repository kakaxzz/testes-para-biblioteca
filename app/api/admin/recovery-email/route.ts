import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"
import { adminDaSessao, emailValido, mascararEmail } from "@/lib/recuperacao"

// Devolve o e-mail de recuperação cadastrado (mascarado).
export async function GET() {
  const admin = await adminDaSessao()
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  return NextResponse.json({
    email: admin.emailRecuperacao ? mascararEmail(admin.emailRecuperacao) : null,
  })
}

// Cadastra ou troca o e-mail de recuperação. Exige a senha atual do admin.
export async function POST(request: NextRequest) {
  try {
    const admin = await adminDaSessao()
    if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { email, currentPassword } = await request.json()

    if (typeof email !== "string" || typeof currentPassword !== "string" || !currentPassword) {
      return NextResponse.json({ error: "Preencha o e-mail e a senha de admin" }, { status: 400 })
    }

    const novoEmail = email.trim().toLowerCase()
    if (!emailValido(novoEmail)) {
      return NextResponse.json({ error: "Digite um e-mail válido" }, { status: 400 })
    }

    const senhaValida = await verifyPassword(currentPassword, admin.senha)
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha de admin incorreta" }, { status: 401 })
    }

    await prisma.$transaction([
      prisma.admin.update({ where: { id: admin.id }, data: { emailRecuperacao: novoEmail } }),
      // Links pendentes enviados para o e-mail antigo deixam de valer.
      prisma.senhaResetToken.deleteMany({ where: { adminId: admin.id } }),
    ])

    return NextResponse.json({
      success: true,
      message: "E-mail de recuperação salvo com sucesso",
      email: mascararEmail(novoEmail),
    })
  } catch (error) {
    console.error("Erro ao salvar e-mail de recuperação:", error)
    return NextResponse.json({ error: "Erro interno ao salvar o e-mail" }, { status: 500 })
  }
}
