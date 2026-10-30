import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Imagem do aviso (pública, como o próprio BiblioNews). A URL carrega um ?v=
// que muda quando a imagem é trocada, por isso o cache pode ser longo.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const avisoId = Number(id)
  if (!Number.isInteger(avisoId)) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 })
  }

  const imagem = await prisma.avisoImagem.findUnique({
    where: { avisoId },
    select: { dados: true, tipo: true },
  })
  if (!imagem) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(imagem.dados), {
    headers: {
      "Content-Type": imagem.tipo,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
