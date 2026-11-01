import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { anoAtual, calcularEstatisticas } from "@/lib/estatisticas"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const atual = anoAtual()
  try {
    const pedido = Number(new URL(request.url).searchParams.get("ano"))
    const ano = Number.isInteger(pedido) && pedido >= 2000 && pedido <= atual ? pedido : atual

    // Ano que já passou e teve virada: usa o resumo guardado (os formandos já foram apagados).
    // Sem resumo (ano anterior ao sistema de virada), calcula na hora com o que existe.
    let dados
    if (ano < atual) {
      // se a tabela da virada ainda não existe no banco, calcula na hora (não quebra a tela)
      const guardado = await prisma.virada.findUnique({ where: { ano } }).catch(() => null)
      dados = guardado ? (guardado.estatisticas as Awaited<ReturnType<typeof calcularEstatisticas>>) : await calcularEstatisticas(ano)
    } else {
      dados = await calcularEstatisticas(ano)
    }

    // anos para o seletor: do primeiro empréstimo até hoje + anos com resumo guardado
    const primeiro = await prisma.emprestimo.aggregate({ _min: { dataEmprestimo: true } })
    const primeiroAno = primeiro._min.dataEmprestimo
      ? Math.max(2000, Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(primeiro._min.dataEmprestimo)))
      : atual
    const guardados = (await prisma.virada.findMany({ select: { ano: true } }).catch(() => [])).map((v) => v.ano)
    const anos = new Set<number>([atual, ...guardados])
    for (let a = primeiroAno; a <= atual; a++) anos.add(a)

    return NextResponse.json({ ...dados, ano, anos: [...anos].sort((a, b) => b - a) })
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
    return NextResponse.json({
      ano: atual,
      anos: [atual],
      livros: 0,
      usuarios: 0,
      emprestimos: 0,
      emaberto: 0,
      topLivros: [],
      topUsuarios: [],
    })
  }
}
