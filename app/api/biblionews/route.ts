import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type AvisoInput = {
  id?: unknown
  titulo?: unknown
  mensagem?: unknown
  tag?: unknown
  data?: unknown // "AAAA-MM-DD" (vazio = usa a data de criação)
  imagem?: unknown // data URL de uma imagem nova (substitui a atual)
  removerImagem?: unknown // true = apaga a imagem atual
}

const LIMITE_IMAGEM = 3 * 1024 * 1024 // 3 MB (o painel já comprime antes de enviar)
const DATA_URL_IMAGEM = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

class ImagemInvalidaError extends Error {}

function lerImagem(valor: unknown) {
  if (typeof valor !== "string" || valor === "") return null
  const partes = DATA_URL_IMAGEM.exec(valor)
  if (!partes) throw new ImagemInvalidaError("Formato de imagem não suportado. Use JPG, PNG ou WebP.")
  const dados = Buffer.from(partes[2], "base64")
  if (dados.length === 0 || dados.length > LIMITE_IMAGEM) {
    throw new ImagemInvalidaError("Imagem grande demais (máximo de 3 MB).")
  }
  return { tipo: partes[1], dados }
}

function lerData(valor: unknown): Date | null {
  if (typeof valor !== "string" || !DATA_ISO.test(valor)) return null
  // meio-dia em UTC: o dia escolhido não "escorrega" por causa do fuso horário
  const data = new Date(`${valor}T12:00:00.000Z`)
  return isNaN(data.getTime()) ? null : data
}

// Sempre devolvemos a data como "AAAA-MM-DD"
function dataParaTexto(aviso: { data: Date | null; criadoEm: Date }) {
  if (aviso.data) return aviso.data.toISOString().slice(0, 10)
  return aviso.criadoEm.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
}

export async function GET() {
  try {
    const avisos = await prisma.aviso.findMany({
      orderBy: [{ ordem: "asc" }, { id: "asc" }],
      select: {
        id: true,
        titulo: true,
        mensagem: true,
        tag: true,
        data: true,
        criadoEm: true,
        imagem: { select: { atualizadoEm: true } }, // só a data: os bytes ficam de fora
      },
    })

    return NextResponse.json(
      avisos.map((a) => ({
        id: a.id,
        titulo: a.titulo,
        mensagem: a.mensagem,
        tag: a.tag,
        data: dataParaTexto(a),
        // o ?v= muda quando a imagem é trocada, então o navegador pode guardar em cache
        imagemUrl: a.imagem ? `/api/biblionews/${a.id}/imagem?v=${a.imagem.atualizadoEm.getTime()}` : null,
      }))
    )
  } catch (error) {
    console.error("Erro ao carregar avisos:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// Salva a lista inteira: a ordem do array vira a ordem de exibição (o 1º é o destaque).
// Avisos com "id" existente são atualizados (e mantêm a imagem, a não ser que venha
// uma nova ou removerImagem); sem "id" são criados; os que sumiram da lista são apagados.
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as AvisoInput[]
    if (!Array.isArray(body)) {
      return NextResponse.json({ message: "O corpo deve ser uma lista de avisos." }, { status: 400 })
    }

    const itens = body
      .map((n) => ({
        id: Number.isInteger(n.id) ? (n.id as number) : null,
        titulo: String(n.titulo ?? "").trim().slice(0, 150),
        mensagem: String(n.mensagem ?? "").trim().slice(0, 2000),
        tag: String(n.tag ?? "").trim().slice(0, 40),
        data: lerData(n.data),
        imagem: lerImagem(n.imagem),
        removerImagem: n.removerImagem === true,
      }))
      // descarta avisos totalmente em branco
      .filter((n) => n.titulo || n.mensagem)

    const existentes = new Set((await prisma.aviso.findMany({ select: { id: true } })).map((a) => a.id))
    const mantidos: number[] = []
    const operacoes: Prisma.PrismaPromise<unknown>[] = []

    itens.forEach((item, ordem) => {
      const base = { titulo: item.titulo, mensagem: item.mensagem, tag: item.tag, data: item.data, ordem }
      const id = item.id

      if (id !== null && existentes.has(id) && !mantidos.includes(id)) {
        mantidos.push(id)
        operacoes.push(prisma.aviso.update({ where: { id }, data: base }))
        if (item.imagem) {
          operacoes.push(
            prisma.avisoImagem.upsert({
              where: { avisoId: id },
              create: { avisoId: id, ...item.imagem },
              update: item.imagem,
            })
          )
        } else if (item.removerImagem) {
          operacoes.push(prisma.avisoImagem.deleteMany({ where: { avisoId: id } }))
        }
      } else {
        operacoes.push(
          prisma.aviso.create({
            data: { ...base, ...(item.imagem ? { imagem: { create: item.imagem } } : {}) },
          })
        )
      }
    })

    await prisma.$transaction([
      // apaga os avisos que não estão mais na lista (a imagem vai junto, por cascata)
      prisma.aviso.deleteMany({ where: { id: { notIn: mantidos } } }),
      ...operacoes,
    ])

    return NextResponse.json({ success: true, total: itens.length })
  } catch (error) {
    if (error instanceof ImagemInvalidaError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error("Erro ao salvar avisos:", error)
    return NextResponse.json({ message: "Não foi possível salvar os avisos." }, { status: 500 })
  }
}
