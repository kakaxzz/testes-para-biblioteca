import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { temAcessoAoTcc } from "@/lib/acesso-tcc"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await temAcessoAoTcc())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 })
  }

  const { id } = await context.params
  const tccId = Number(id)
  if (!Number.isInteger(tccId)) {
    return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
  }

  const registro = await prisma.tcc.findUnique({
    where: { id: tccId },
    select: { arquivoDados: true, arquivoNome: true },
  })

  if (!registro) {
    return NextResponse.json({ error: "PDF não encontrado." }, { status: 404 })
  }

  const nome = registro.arquivoNome.replace(/[^\w.\-]+/g, "_") || "trabalho.pdf"

  return new NextResponse(new Uint8Array(registro.arquivoDados), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nome}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
