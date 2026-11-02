// Recomendação de livros parecidos ("Mais como este").
//
// Cada candidato recebe uma pontuação de semelhança com o livro aberto, somando:
//   - mesmo autor e mesma série (mesmo autor + início do título igual)
//   - assuntos em comum (assunto raro no acervo vale mais que um muito comum)
//   - CDD em comum (quanto mais dígitos iguais, mais parecido)
//   - palavras em comum na sinopse e no título (também ponderadas pela raridade)
//   - mesma editora (peso pequeno, só complementa)
//   - classificação indicativa próxima (faixas muito distantes nunca se recomendam)
// Só aparece quem passa da PONTUACAO_MINIMA. O resultado é sempre o mesmo para os
// mesmos dados: nada aqui é sorteado.

import { CLASSIFICACOES, normalizarClassificacao } from "@/lib/classificacao"

export type LivroParaRecomendar = {
  id: number | string
  isbn: string
  titulo: string
  autor?: string | null
  editora?: string | null
  assuntos?: string | null
  cdd?: string | null
  sinopse?: string | null
  classificacaoIndicativa?: string | null
  quantidadeDisponivel?: number
}

export type Recomendacao<T extends LivroParaRecomendar> = {
  livro: T
  pontos: number
  // Por que o livro foi sugerido, do motivo mais forte para o mais fraco
  motivos: string[]
}

// Abaixo disso o livro não é parecido o bastante para ser sugerido
export const PONTUACAO_MINIMA = 3

const PESO = {
  autor: 6,
  serie: 3.5,
  assunto: 6, // multiplicado pela raridade do assunto (0 a 1)
  assuntoTeto: 10,
  editora: 1.2,
  cddPorDigitosEmComum: [0, 0.3, 1, 2, 3, 3.5], // índice = dígitos iguais no começo
  palavra: 0.6, // multiplicado pela raridade da palavra (0 a 1)
  palavrasTeto: 4,
  mesmaClassificacao: 1.5,
  classificacaoVizinha: 0.5,
  classificacaoDistante: -1.5,
  disponivel: 0.4, // só desempata
}

// A partir de 3 faixas de diferença (ex.: livre e 14) o livro nem é considerado
const DISTANCIA_MAXIMA_CLASSIFICACAO = 3

const AUTORES_GENERICOS = new Set([
  "varios", "varios autores", "diversos", "diversos autores",
  "anonimo", "desconhecido", "autor desconhecido",
])

const ARTIGOS_DO_TITULO = new Set(["o", "a", "os", "as", "um", "uma", "de", "do", "da"])

const PALAVRAS_COMUNS = new Set([
  "para", "como", "mais", "muito", "pelo", "pela", "com", "uma", "que", "por", "sobre",
  "entre", "depois", "antes", "quando", "onde", "qual", "isso", "esta", "este", "esse",
  "essa", "estao", "tambem", "mas", "seu", "sua", "dele", "dela", "eles", "elas", "foi",
  "ser", "tem", "tinha", "sao", "era", "ate", "sem", "ainda", "assim", "apos", "cada",
  "tudo", "todo", "toda", "nova", "novo", "nas", "nos", "num", "numa", "dos", "das",
  "quem", "porem", "sendo", "fazer", "pode", "aqui", "nessa", "nesse", "desse", "dessa",
  "aquele", "aquela", "mesmo", "outro", "outra", "livro", "historia", "obra", "autor",
])

type Perfil = {
  assuntos: Map<string, string> // chave sem acento -> texto como foi cadastrado
  autores: Set<string>
  editora: string
  cdd: string // só os dígitos
  palavras: Set<string>
  abertura: string // as duas primeiras palavras do título (sem artigos)
  nivel: number | null // posição da classificação indicativa (L = 0 ... 18 = 5)
}

type Frequencias = {
  total: number
  assuntos: Map<string, number>
  palavras: Map<string, number>
}

function limpar(texto?: string | null): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function lerAssuntos(texto?: string | null): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const parte of (texto ?? "").split(/[,;|]/)) {
    const rotulo = parte.trim()
    const chave = limpar(rotulo).replace(/[.\s]+$/, "")
    if (chave && !mapa.has(chave)) mapa.set(chave, rotulo)
  }
  return mapa
}

// "Rowling, J. K." e "J. K. Rowling" viram a mesma chave
function lerAutores(texto?: string | null): Set<string> {
  const autores = new Set<string>()
  for (const parte of (texto ?? "").split(/;|\/|&| e /i)) {
    const nome = limpar(parte)
    if (!nome || AUTORES_GENERICOS.has(nome)) continue
    const chave = nome.split(/[^a-z0-9]+/).filter(Boolean).sort().join(" ")
    if (chave) autores.add(chave)
  }
  return autores
}

function lerEditora(texto?: string | null): string {
  return limpar(texto)
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(editora|editoras|edicoes|ed|ltda|sa|grupo|livraria|cia)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Tira o plural simples para "dragão"/"dragões" e "livro"/"livros" contarem como a mesma palavra
function raiz(palavra: string): string {
  return palavra.length > 4 && palavra.endsWith("s") ? palavra.slice(0, -1) : palavra
}

function lerPalavras(...textos: (string | null | undefined)[]): Set<string> {
  const palavras = new Set<string>()
  for (const texto of textos) {
    for (const bruta of limpar(texto).split(/[^a-z0-9]+/)) {
      const p = raiz(bruta)
      if (p.length >= 4 && !/^\d+$/.test(p) && !PALAVRAS_COMUNS.has(p)) palavras.add(p)
    }
  }
  return palavras
}

function lerAbertura(titulo?: string | null): string {
  const palavras = limpar(titulo)
    .split(/[^a-z0-9]+/)
    .filter((p) => p && !ARTIGOS_DO_TITULO.has(p))
  return palavras.length >= 2 ? palavras.slice(0, 2).join(" ") : ""
}

function criarPerfil(livro: LivroParaRecomendar): Perfil {
  const classificacao = normalizarClassificacao(livro.classificacaoIndicativa)
  return {
    assuntos: lerAssuntos(livro.assuntos),
    autores: lerAutores(livro.autor),
    editora: lerEditora(livro.editora),
    cdd: limpar(livro.cdd).replace(/\D/g, ""),
    palavras: lerPalavras(livro.titulo, livro.sinopse),
    abertura: lerAbertura(livro.titulo),
    nivel: classificacao ? CLASSIFICACOES.indexOf(classificacao) : null,
  }
}

function contarFrequencias(perfis: Perfil[]): Frequencias {
  const assuntos = new Map<string, number>()
  const palavras = new Map<string, number>()
  for (const perfil of perfis) {
    for (const chave of perfil.assuntos.keys()) assuntos.set(chave, (assuntos.get(chave) ?? 0) + 1)
    for (const palavra of perfil.palavras) palavras.set(palavra, (palavras.get(palavra) ?? 0) + 1)
  }
  return { total: perfis.length, assuntos, palavras }
}

// Raridade de 0 a 1: 1 quando só estes dois livros têm o termo, perto de 0 quando quase todo o acervo tem
function raridade(livrosComOTermo: number, total: number): number {
  if (total <= 1) return 0
  const n = Math.max(1, livrosComOTermo)
  return Math.max(0, Math.log(total / n) / Math.log(total))
}

function digitosEmComum(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

function pontuar(
  a: Perfil,
  b: Perfil,
  freq: Frequencias
): { pontos: number; motivos: string[] } | null {
  let pontos = 0
  const motivos: string[] = []

  // Classificação indicativa: faixas muito distantes eliminam o livro
  if (a.nivel !== null && b.nivel !== null) {
    const distancia = Math.abs(a.nivel - b.nivel)
    if (distancia >= DISTANCIA_MAXIMA_CLASSIFICACAO) return null
    if (distancia === 0) pontos += PESO.mesmaClassificacao
    else if (distancia === 1) pontos += PESO.classificacaoVizinha
    else pontos += PESO.classificacaoDistante
  }

  // Autor e série
  const mesmoAutor = [...a.autores].some((autor) => b.autores.has(autor))
  if (mesmoAutor) {
    pontos += PESO.autor
    motivos.push("Mesmo autor")
    if (a.abertura && a.abertura === b.abertura) {
      pontos += PESO.serie
      motivos.push("Mesma série")
    }
  }

  // Assuntos em comum, os mais raros pesam mais
  let pontosAssunto = 0
  let melhorAssunto: { rotulo: string; raridade: number } | null = null
  for (const [chave] of a.assuntos) {
    const rotulo = b.assuntos.get(chave)
    if (rotulo === undefined) continue
    const r = raridade(freq.assuntos.get(chave) ?? 2, freq.total)
    pontosAssunto += PESO.assunto * r
    if (!melhorAssunto || r > melhorAssunto.raridade) melhorAssunto = { rotulo, raridade: r }
  }
  pontosAssunto = Math.min(pontosAssunto, PESO.assuntoTeto)
  pontos += pontosAssunto
  if (melhorAssunto && pontosAssunto >= 0.5) motivos.push(`Assunto: ${melhorAssunto.rotulo}`)

  // CDD: quantos dígitos do começo são iguais (869 = literatura portuguesa, 869.3 = romance...)
  let pontosCdd = 0
  if (a.cdd && b.cdd) {
    const iguais = digitosEmComum(a.cdd, b.cdd)
    pontosCdd = PESO.cddPorDigitosEmComum[Math.min(iguais, PESO.cddPorDigitosEmComum.length - 1)]
    pontos += pontosCdd
  }

  // Editora (só complementa)
  if (a.editora && a.editora === b.editora) {
    pontos += PESO.editora
    motivos.push("Mesma editora")
  }

  // Palavras em comum no título e na sinopse
  let pontosPalavras = 0
  for (const palavra of a.palavras) {
    if (!b.palavras.has(palavra)) continue
    pontosPalavras += PESO.palavra * raridade(freq.palavras.get(palavra) ?? 2, freq.total)
  }
  pontosPalavras = Math.min(pontosPalavras, PESO.palavrasTeto)
  pontos += pontosPalavras

  // Quando nada acima explicou, diz pelo menos o que foi que aproximou os dois
  if (motivos.length === 0) {
    if (pontosPalavras >= 1.5) motivos.push("Tema parecido")
    else if (pontosCdd >= PESO.cddPorDigitosEmComum[3]) motivos.push("Mesma área")
  }

  return { pontos, motivos }
}

/**
 * Livros do acervo mais parecidos com `atual`, do mais ao menos parecido.
 * `todos` pode incluir o próprio livro (ele é ignorado).
 */
export function recomendarLivros<T extends LivroParaRecomendar>(
  atual: T,
  todos: T[],
  limite = 3
): Recomendacao<T>[] {
  const candidatos = todos.filter((l) => l.isbn !== atual.isbn)
  if (candidatos.length === 0) return []

  const perfilAtual = criarPerfil(atual)
  const itens = candidatos.map((livro) => ({ livro, perfil: criarPerfil(livro) }))
  const freq = contarFrequencias([perfilAtual, ...itens.map((i) => i.perfil)])

  const resultados: { livro: T; pontos: number; motivos: string[]; ordem: number }[] = []
  for (const { livro, perfil } of itens) {
    const r = pontuar(perfilAtual, perfil, freq)
    if (!r || r.pontos < PONTUACAO_MINIMA) continue
    const bonus = (livro.quantidadeDisponivel ?? 0) > 0 ? PESO.disponivel : 0
    resultados.push({
      livro,
      pontos: Math.round(r.pontos * 100) / 100,
      motivos: r.motivos,
      ordem: r.pontos + bonus,
    })
  }

  resultados.sort(
    (x, y) =>
      y.ordem - x.ordem ||
      x.livro.titulo.localeCompare(y.livro.titulo, "pt-BR") ||
      x.livro.isbn.localeCompare(y.livro.isbn)
  )

  return resultados.slice(0, limite).map(({ livro, pontos, motivos }) => ({ livro, pontos, motivos }))
}
