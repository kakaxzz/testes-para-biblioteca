import { NextResponse } from "next/server"
import { gerarRelatorioEmprestimos, interpretarPeriodo } from "@/lib/relatorio"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// GET /api/admin/relatorio?inicio=AAAA-MM-DD&fim=AAAA-MM-DD
// Protegida pelo middleware (exige sessão de admin): o arquivo traz dados pessoais dos leitores.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const periodo = interpretarPeriodo(searchParams.get("inicio"), searchParams.get("fim"))
  if (!periodo.ok) {
    return NextResponse.json({ error: periodo.erro }, { status: 400 })
  }

  try {
    const { csv, total, aviso } = await gerarRelatorioEmprestimos(periodo)
    const nome = `relatorio-emprestimos_${periodo.inicioISO}_a_${periodo.fimISO}.csv`

    const headers: Record<string, string> = {
      // BOM no início para o Excel reconhecer os acentos (UTF-8).
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
      "X-Relatorio-Linhas": String(total),
    }
    if (aviso) headers["X-Relatorio-Aviso"] = encodeURIComponent(aviso)

    return new NextResponse("\uFEFF" + csv, { headers })
  } catch (error) {
    console.error("Erro ao gerar o relatório:", error)
    return NextResponse.json({ error: "Erro ao gerar o relatório." }, { status: 500 })
  }
}
