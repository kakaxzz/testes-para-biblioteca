import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ehAdmin, temTokenDeAcesso } from "@/lib/acesso-tcc"
import { CABECALHO_LEITOR, lerId } from "@/lib/tcc"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // O admin recebe o PDF normalmente (precisa conferir o que cadastrou e guardar o original).
  // Quem entrou com token só recebe o PDF dentro do leitor da página, que não tem botão de baixar.
  const admin = await ehAdmin()

  if (!admin) {
    if (!(await temTokenDeAcesso())) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 401 })
    }

    // Sec-Fetch-Dest vem dos navegadores atuais: "empty" é uma chamada fetch() do leitor;
    // "document", "iframe", "embed" etc. são o PDF aberto direto, o que não é permitido
    const destino = request.headers.get("sec-fetch-dest")
    if (request.headers.get(CABECALHO_LEITOR) !== "1" || (destino && destino !== "empty")) {
      return NextResponse.json(
        { error: "Este trabalho só pode ser lido na página da biblioteca." },
        { status: 403 }
      )
    }
  }

  const { id } = await context.params
  const tccId = lerId(id)
  if (tccId === null) {
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
      // Leitores não recebem nome de arquivo, para o navegador não oferecer "salvar" com o nome do trabalho
      "Content-Disposition": admin ? `inline; filename="${nome}"` : "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
