import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { temAcessoAoTcc } from "@/lib/acesso-tcc"
import { ehFalha, lerDadosTcc, lerPdf } from "@/lib/tcc"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await temAcessoAoTcc())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 })
  }
  try {
    const tccs = await prisma.tcc.findMany({
      orderBy: [{ ano: "desc" }, { id: "desc" }],
      select: { id: true, titulo: true, autor: true, ano: true, tipo: true, resumo: true, arquivoNome: true, criadoEm: true },
    })
    return NextResponse.json(tccs)
  } catch (error) {
    console.error("Erro ao listar TCCs:", error)
    return NextResponse.json({ error: "Erro ao carregar trabalhos." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()

    const lido = lerDadosTcc(form)
    if (ehFalha(lido)) {
      return NextResponse.json({ error: lido.erro }, { status: lido.status })
    }

    const arquivo = await lerPdf(form.get("arquivo"))
    if (ehFalha(arquivo)) {
      return NextResponse.json({ error: arquivo.erro }, { status: arquivo.status })
    }
    if (!arquivo.pdf) {
      return NextResponse.json({ error: "Arquivo PDF obrigatório." }, { status: 400 })
    }

    const tcc = await prisma.tcc.create({
      data: {
        ...lido.dados,
        arquivoNome: arquivo.pdf.nome,
        arquivoTipo: "application/pdf",
        arquivoDados: arquivo.pdf.dados,
      },
      select: { id: true, titulo: true, autor: true, ano: true, tipo: true },
    })

    return NextResponse.json(tcc)
  } catch (error) {
    console.error("Erro ao salvar TCC:", error)
    return NextResponse.json({ error: "Erro ao salvar trabalho." }, { status: 500 })
  }
}
