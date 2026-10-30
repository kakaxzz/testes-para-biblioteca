import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { temAcessoAoTcc } from "@/lib/acesso-tcc"

export const dynamic = "force-dynamic"

// A Vercel limita o corpo de uma requisição a ~4,5 MB
const TAMANHO_MAXIMO = 4 * 1024 * 1024

export async function GET() {
  if (!(await temAcessoAoTcc())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 })
  }
  try {
    const tccs = await prisma.tcc.findMany({
      orderBy: [{ ano: "desc" }, { id: "desc" }],
      // não carrega o PDF na listagem
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
    const titulo = String(form.get("titulo") ?? "").trim()
    const autor = String(form.get("autor") ?? "").trim()
    const ano = parseInt(String(form.get("ano") ?? ""), 10)
    const tipo = String(form.get("tipo") ?? "tcc") === "artigo" ? "artigo" : "tcc"
    const resumo = String(form.get("resumo") ?? "").trim()
    const arquivo = form.get("arquivo")

    if (!titulo || !autor || Number.isNaN(ano)) {
      return NextResponse.json({ error: "Título, autor e ano são obrigatórios." }, { status: 400 })
    }

    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ error: "Arquivo PDF obrigatório." }, { status: 400 })
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { error: "O PDF é grande demais (máximo de 4 MB). Comprima o arquivo e tente de novo." },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer())

    // Confere se é mesmo um PDF (todo PDF começa com "%PDF")
    if (buffer.subarray(0, 4).toString("latin1") !== "%PDF") {
      return NextResponse.json({ error: "O arquivo enviado não é um PDF válido." }, { status: 400 })
    }

    const tcc = await prisma.tcc.create({
      data: {
        titulo,
        autor,
        ano,
        tipo,
        resumo,
        arquivoNome: arquivo.name,
        arquivoTipo: "application/pdf",
        arquivoDados: buffer,
      },
      select: { id: true, titulo: true, autor: true, ano: true, tipo: true },
    })

    return NextResponse.json(tcc)
  } catch (error) {
    console.error("Erro ao salvar TCC:", error)
    return NextResponse.json({ error: "Erro ao salvar trabalho." }, { status: 500 })
  }
}
