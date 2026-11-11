import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { hashToken } from "@/lib/recuperacao"
import { erroSenhaFraca } from "@/lib/senha-forte"

async function buscarTokenValido(token: unknown) {
  if (typeof token !== "string" || token.length < 20) return null
  const registro = await prisma.senhaResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  })
  if (!registro || registro.expiresAt.getTime() < Date.now()) return null
  return registro
}

// Usado pela tela para saber, antes de mostrar o formulário, se o link ainda vale.
export async function GET(request: NextRequest) {
  const registro = await buscarTokenValido(request.nextUrl.searchParams.get("token"))
  return NextResponse.json({ valido: !!registro })
}

export async function POST(request: NextRequest) {
  try {
    const { token, novaSenha } = await request.json()

    const erroForca = erroSenhaFraca(novaSenha)
    if (erroForca) {
      return NextResponse.json({ error: erroForca }, { status: 400 })
    }

    const registro = await buscarTokenValido(token)
    if (!registro) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Peça um novo em “Esqueci a senha”." },
        { status: 400 }
      )
    }

    const novoHash = await hashPassword(novaSenha)

    await prisma.$transaction([
      prisma.admin.update({ where: { id: registro.adminId }, data: { senha: novoHash } }),
      // Uso único: apaga este e qualquer outro link pendente do admin.
      prisma.senhaResetToken.deleteMany({ where: { adminId: registro.adminId } }),
    ])

    return NextResponse.json({ success: true, message: "Senha redefinida com sucesso" })
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json({ error: "Erro interno ao redefinir a senha" }, { status: 500 })
  }
}
