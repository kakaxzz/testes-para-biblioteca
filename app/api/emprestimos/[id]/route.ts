import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id: Number(id) },
    include: {
      usuario: true,
      exemplar: {
        include: { livro: true },
      },
    },
  })

  if (!emprestimo) {
    return NextResponse.json({ error: "Empréstimo não encontrado." }, { status: 404 })
  }

  // Normaliza para manter o mesmo formato usado na listagem (e.livro, e.tomboExemplar)
  const normalizado = {
    ...emprestimo,
    livro: emprestimo.exemplar.livro,
    tomboExemplar: emprestimo.exemplar.tombo,
  }

  return NextResponse.json(normalizado)
}
