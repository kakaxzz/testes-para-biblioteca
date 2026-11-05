import { NextResponse } from "next/server"
import { executarVirada, planejarVirada } from "@/lib/virada"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  try {
    return NextResponse.json(await planejarVirada())
  } catch (error) {
    console.error("Erro ao montar a prévia da virada:", error)
    return NextResponse.json({ error: "Erro ao montar a prévia." }, { status: 500 })
  }
}

export async function POST() {
  try {
    const resultado = await executarVirada()
    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 409 })
  } catch (error) {
    console.error("Erro na virada de ano:", error)
    return NextResponse.json({ ok: false, motivo: "Erro ao executar a virada." }, { status: 500 })
  }
}
