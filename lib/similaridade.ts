// Recomendação de livros parecidos ("Mais como este").
//
// Cada livro do acervo recebe uma pontuação de semelhança com o livro que está
// aberto. Os de maior pontuação aparecem primeiro. Livros sem nada em comum não
// aparecem (melhor mostrar menos do que sugerir algo sem relação).

import { CLASSIFICACOES, normalizarClassificacao } from "@/lib/classificacao"

export type LivroParaSimilaridade = {
  id: number | string
  isbn: string
  titulo: string
  autor?: string | null
  editora?: string | null
  assuntos?: string | null
  cdd?: string | null
  volume?: string | null
  classificacaoIndicativa?: string | null
  quantidadeDisponivel?: number
}

// Pesos. Ajuste aqui se quiser dar mais (ou menos) importância a algum critério.
export const PESOS = {
  assuntoEmComum: 8, // por assunto compartilhado
  maxAssuntosContados: 3,
  categoriaPrincipal: 4, // o primeiro assunto (categoria principal) é o mesmo
  mesmoAutor: 10,
  mesmaSerie: 8, // mesmo título-base (ex.: "Percy Jackson 1" e "Percy Jackson 2")
  cddMesmaClasse: 6, // 3 primeiros dígitos iguais (mesmo tema na biblioteca)
  cddMesmaDivisao: 3, // 2 primeiros dígitos iguais
  mesmaEditora: 3,
  classificacaoIgual: 2,
  classificacaoVizinha: 1,
  classificacaoDistante: -3, // 3 níveis ou mais de diferença (ex.: L e 14)
  disponivel: 1, // só desempata
  minimo: 6, // pontuação mínima para entrar na lista
} as const

// Assuntos genéricos que não dizem nada sobre o conteúdo do livro
const ASSUNTOS_IGNORADOS = new Set(["outro", "outros", "geral"])

// minúsculas, sem acento e sem espaços repetidos
export function normalizarTexto(texto?: string | null): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

export function assuntosNormalizados(assuntos?: string | null): string[] {
  const vistos = new Set<string>()
  for (const parte of (assuntos ?? "").split(",")) {
    const a = normalizarTexto(parte)
    if (a && !ASSUNTOS_IGNORADOS.has(a)) vistos.add(a)
  }
  return [...vistos]
}

// "Percy Jackson e o Ladrão de Raios, vol. 1" -> "percy jackson e o ladrao de raios"
// Serve para reconhecer livros de uma mesma série quando o título muda só no número.
function tituloBase(titulo?: string | null): string {
  return normalizarTexto(titulo)
    .replace(/\b(vol|volume|livro|tomo|parte|v)\b\.?\s*[\divxlc]+\b/g, "")
    .replace(/[\d]+/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function digitosCdd(cdd?: string | null): string {
  return (cdd ?? "").replace(/\D/g, "")
}

function pontuarClassificacao(a?: string | null, b?: string | null): number {
  const ca = normalizarClassificacao(a)
  const cb = normalizarClassificacao(b)
  if (!ca || !cb) return 0
  const dif = Math.abs(CLASSIFICACOES.indexOf(ca) - CLASSIFICACOES.indexOf(cb))
  if (dif === 0) return PESOS.classificacaoIgual
  if (dif === 1) return PESOS.classificacaoVizinha
  if (dif >= 3) return PESOS.classificacaoDistante
  return 0
}

export function pontuarSimilaridade(base: LivroParaSimilaridade, outro: LivroParaSimilaridade): number {
  let pontos = 0

  // Assuntos / gêneros
  const meus = assuntosNormalizados(base.assuntos)
  const deles = assuntosNormalizados(outro.assuntos)
  const emComum = meus.filter((a) => deles.includes(a)).length
  pontos += Math.min(emComum, PESOS.maxAssuntosContados) * PESOS.assuntoEmComum
  if (meus[0] && meus[0] === deles[0]) pontos += PESOS.categoriaPrincipal

  // Autor
  const autorBase = normalizarTexto(base.autor)
  if (autorBase && autorBase === normalizarTexto(outro.autor)) pontos += PESOS.mesmoAutor

  // Série
  const tb = tituloBase(base.titulo)
  if (tb.length >= 4 && tb === tituloBase(outro.titulo)) pontos += PESOS.mesmaSerie

  // CDD (classificação da biblioteca)
  const c1 = digitosCdd(base.cdd)
  const c2 = digitosCdd(outro.cdd)
  if (c1.length >= 3 && c2.length >= 3 && c1.slice(0, 3) === c2.slice(0, 3)) pontos += PESOS.cddMesmaClasse
  else if (c1.length >= 2 && c2.length >= 2 && c1.slice(0, 2) === c2.slice(0, 2)) pontos += PESOS.cddMesmaDivisao

  // Editora
  const ed = normalizarTexto(base.editora)
  if (ed && ed === normalizarTexto(outro.editora)) pontos += PESOS.mesmaEditora

  // Faixa etária parecida
  pontos += pontuarClassificacao(base.classificacaoIndicativa, outro.classificacaoIndicativa)

  return pontos
}

// Número fixo (sempre o mesmo para o mesmo par de livros) usado para desempatar.
// Assim, livros com a mesma pontuação não aparecem sempre na ordem alfabética
// (o que repetia as mesmas sugestões em todas as páginas), e o resultado não
// muda a cada vez que a página é aberta.
function desempate(a: string, b: string): number {
  const texto = a + "|" + b
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h
}

export function livrosParecidos<T extends LivroParaSimilaridade>(
  base: LivroParaSimilaridade,
  acervo: T[],
  limite = 3
): T[] {
  const candidatos = acervo
    .filter((l) => l.isbn !== base.isbn)
    .map((l) => ({
      livro: l,
      autor: normalizarTexto(l.autor),
      semelhanca: pontuarSimilaridade(base, l),
      disponivel: (l.quantidadeDisponivel ?? 0) > 0,
      sorteio: desempate(base.isbn, l.isbn),
    }))
    .filter((x) => x.semelhanca >= PESOS.minimo)
    // a disponibilidade dá só 1 ponto: serve para desempatar, não para sobrepor semelhança
    .map((x) => ({ ...x, pontos: x.semelhanca + (x.disponivel ? PESOS.disponivel : 0) }))
    .sort((a, b) => b.pontos - a.pontos || a.sorteio - b.sorteio)

  // Variedade: no máximo UM livro por autor (assim uma saga inteira não ocupa
  // todas as vagas). Se sobrarem vagas, elas são preenchidas com o que restou.
  const escolhidos: typeof candidatos = []
  const autoresUsados = new Set<string>()
  for (const c of candidatos) {
    if (escolhidos.length >= limite) break
    if (c.autor && autoresUsados.has(c.autor)) continue
    escolhidos.push(c)
    if (c.autor) autoresUsados.add(c.autor)
  }
  if (escolhidos.length < limite) {
    for (const c of candidatos) {
      if (escolhidos.length >= limite) break
      if (!escolhidos.includes(c)) escolhidos.push(c)
    }
  }

  return escolhidos.map((x) => x.livro)
}
