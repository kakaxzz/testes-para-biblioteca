import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ehAdmin, temAcessoAoTcc } from "@/lib/acesso-tcc"
import { ehFalha, lerDadosTcc, lerId, lerPdf } from "@/lib/tcc"

export const dynamic = "force-dynamic"

// Dados do trabalho sem o PDF (o PDF tem rota própria: /api/tcc/[id]/arquivo)
const CAMPOS = {
  id: true,
  titulo: true,
  autor: true,
  ano: true,
  tipo: true,
  resumo: true,
  arquivoNome: true,
  criadoEm: true,
} as const

// Erro do Prisma quando o registro não existe (já foi excluído, por exemplo)
function naoEncontrado(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2025"
}

type Contexto = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: Contexto) {
  if (!(await temAcessoAoTcc())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 })
  }

  const id = lerId((await context.params).id)
  if (id === null) {
    return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
  }

  const tcc = await prisma.tcc.findUnique({ where: { id }, select: CAMPOS })
  if (!tcc) {
    return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
  }
  return NextResponse.json(tcc)
}

// Editar: título, autor, ano, tipo e resumo. O PDF só é trocado se um novo arquivo for enviado.
export async function PUT(request: Request, context: Contexto) {
  if (!(await ehAdmin())) {
    return NextResponse.json({ error: "Não autorizado. Faça login como admin." }, { status: 401 })
  }

  const id = lerId((await context.params).id)
  if (id === null) {
    return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
  }

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

    const tcc = await prisma.tcc.update({
      where: { id },
      data: {
        ...lido.dados,
        ...(arquivo.pdf && {
          arquivoNome: arquivo.pdf.nome,
          arquivoTipo: "application/pdf",
          arquivoDados: arquivo.pdf.dados,
        }),
      },
      select: CAMPOS,
    })

    return NextResponse.json(tcc)
  } catch (error) {
    if (naoEncontrado(error)) {
      return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
    }
    console.error("Erro ao editar TCC:", error)
    return NextResponse.json({ error: "Erro ao salvar as alterações." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: Contexto) {
  if (!(await ehAdmin())) {
    return NextResponse.json({ error: "Não autorizado. Faça login como admin." }, { status: 401 })
  }

  const id = lerId((await context.params).id)
  if (id === null) {
    return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
  }

  try {
    // O PDF fica na própria linha do trabalho, então sai junto
    await prisma.tcc.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (naoEncontrado(error)) {
      return NextResponse.json({ error: "Trabalho não encontrado." }, { status: 404 })
    }
    console.error("Erro ao excluir TCC:", error)
    return NextResponse.json({ error: "Erro ao excluir o trabalho." }, { status: 500 })
  }
}
