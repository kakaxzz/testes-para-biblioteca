import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { usuario, senha } = await request.json()

  const ADMIN_USUARIO = process.env.ADMIN_USUARIO
  const ADMIN_SENHA = process.env.ADMIN_SENHA

  if (!ADMIN_USUARIO || !ADMIN_SENHA) {
    return NextResponse.json({ error: "Credenciais não configuradas no servidor." }, { status: 500 })
  }

  if (usuario === ADMIN_USUARIO && senha === ADMIN_SENHA) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 })
}
