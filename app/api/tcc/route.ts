import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const tccs = await (prisma as any).tcc.findMany({ orderBy: { ano: "desc" } })
    return NextResponse.json(tccs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const titulo = form.get("titulo") as string
    const autor = form.get("autor") as string
    const ano = parseInt(form.get("ano") as string)
    const tipo = form.get("tipo") as string
    const resumo = form.get("resumo") as string
    const arquivo = form.get("arquivo") as File

    if (!arquivo || arquivo.size === 0) {
      return NextResponse.json({ error: "Arquivo PDF obrigatório." }, { status: 400 })
    }

    // Salva o PDF na pasta public/uploads
    const bytes = await arquivo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const nomeArquivo = `${Date.now()}-${arquivo.name.replace(/\s+/g, "-")}`
    const uploadDir = join(process.cwd(), "public", "uploads")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, nomeArquivo), buffer)

    const tcc = await (prisma as any).tcc.create({
      data: { titulo, autor, ano, tipo, resumo: resumo || "", arquivo: nomeArquivo },
    })

    return NextResponse.json(tcc)
  } catch (error: any) {
    console.error("Erro ao salvar TCC:", error)
    return NextResponse.json({ error: "Erro ao salvar trabalho." }, { status: 500 })
  }
}
