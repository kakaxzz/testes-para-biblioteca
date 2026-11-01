import { NextResponse } from "next/server"
import { executarVirada } from "@/lib/virada"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Chamada pela Vercel todo 01/01 (ver vercel.json). A Vercel envia "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const resultado = await executarVirada()
    // 200 mesmo quando já tinha rodado, para a Vercel não ficar tentando de novo
    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Erro na virada de ano:", error)
    return NextResponse.json({ ok: false, motivo: "Erro ao executar a virada." }, { status: 500 })
  }
}
