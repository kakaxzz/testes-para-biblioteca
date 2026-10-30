// Classificação indicativa dos livros (mesma lógica da classificação indicativa brasileira)

export const CLASSIFICACOES = ["L", "10", "12", "14", "16", "18"] as const
export type Classificacao = (typeof CLASSIFICACOES)[number]

export const CLASSIFICACAO_INFO: Record<
  Classificacao,
  { rotulo: string; descricao: string; cor: string; fundo: string }
> = {
  L: { rotulo: "L", descricao: "Livre para todos os públicos", cor: "#166534", fundo: "#e8f7ee" },
  "10": { rotulo: "10", descricao: "Não recomendado para menores de 10 anos", cor: "#1d4ed8", fundo: "#e8f0fe" },
  "12": { rotulo: "12", descricao: "Não recomendado para menores de 12 anos", cor: "#854d0e", fundo: "#fdf3d6" },
  "14": { rotulo: "14", descricao: "Não recomendado para menores de 14 anos", cor: "#9a3412", fundo: "#ffe9d6" },
  "16": { rotulo: "16", descricao: "Não recomendado para menores de 16 anos", cor: "#991b1b", fundo: "#fde2e2" },
  "18": { rotulo: "18", descricao: "Não recomendado para menores de 18 anos", cor: "#f5f5f5", fundo: "#1f1f1f" },
}

export function normalizarClassificacao(valor: unknown): Classificacao | null {
  if (valor === null || valor === undefined || valor === "") return null
  const v = String(valor).trim().toUpperCase()
  return (CLASSIFICACOES as readonly string[]).includes(v) ? (v as Classificacao) : null
}

// true quando o livro tem restrição de idade (qualquer coisa diferente de livre / não informada)
export function temRestricaoDeIdade(valor: unknown): boolean {
  const c = normalizarClassificacao(valor)
  return c !== null && c !== "L"
}
