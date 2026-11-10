import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarEmailRecuperacao } from "@/lib/email"
import {
  RESET_INTERVALO_SEGUNDOS,
  RESET_VALIDADE_MINUTOS,
  gerarToken,
  hashToken,
  mascararEmail,
} from "@/lib/recuperacao"

// Rota pública: envia o link de redefinição para o e-mail de recuperação cadastrado.
export async function POST(request: NextRequest) {
  try {
    const admin = await prisma.admin.findFirst({
      where: { emailRecuperacao: { not: null } },
      orderBy: { id: "asc" },
    })

    if (!admin?.emailRecuperacao) {
      return NextResponse.json(
        {
          error:
            "Nenhum e-mail de recuperação cadastrado. Entre com a sua senha e cadastre um em Configurações.",
        },
        { status: 400 }
      )
    }

    // Evita que a tela de login seja usada para disparar e-mails em sequência.
    const recente = await prisma.senhaResetToken.findFirst({
      where: {
        adminId: admin.id,
        createdAt: { gt: new Date(Date.now() - RESET_INTERVALO_SEGUNDOS * 1000) },
      },
    })
    if (recente) {
      return NextResponse.json(
        { error: "Um e-mail já foi enviado agora há pouco. Aguarde 2 minutos para pedir outro." },
        { status: 429 }
      )
    }

    const token = gerarToken()
    await prisma.$transaction([
      prisma.senhaResetToken.deleteMany({ where: { adminId: admin.id } }),
      prisma.senhaResetToken.create({
        data: {
          adminId: admin.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_VALIDADE_MINUTOS * 60 * 1000),
        },
      }),
    ])

    const base = (process.env.APP_URL || request.nextUrl.origin).replace(/\/$/, "")
    const link = `${base}/admin/redefinir-senha?token=${token}`

    try {
      await enviarEmailRecuperacao(admin.emailRecuperacao, link, RESET_VALIDADE_MINUTOS)
    } catch (erroEnvio) {
      console.error("Erro ao enviar e-mail de recuperação:", erroEnvio)
      await prisma.senhaResetToken.deleteMany({ where: { adminId: admin.id } })
      return NextResponse.json(
        { error: "Não foi possível enviar o e-mail agora. Tente novamente em instantes." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, email: mascararEmail(admin.emailRecuperacao) })
  } catch (error) {
    console.error("Erro em esqueci-senha:", error)
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 })
  }
}
