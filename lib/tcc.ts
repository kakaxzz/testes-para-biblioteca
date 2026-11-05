
export const TAMANHO_MAXIMO_PDF = 4 * 1024 * 1024

export const CABECALHO_LEITOR = "x-leitor-tcc"

export type DadosTcc = {
  titulo: string
  autor: string
  ano: number
  tipo: "tcc" | "artigo"
  resumo: string
}

export type Falha = { erro: string; status: number }

export function lerDadosTcc(form: FormData): { dados: DadosTcc } | Falha {
  const titulo = String(form.get("titulo") ?? "").trim()
  const autor = String(form.get("autor") ?? "").trim()
  const ano = parseInt(String(form.get("ano") ?? ""), 10)
  const tipo = String(form.get("tipo") ?? "tcc") === "artigo" ? "artigo" : "tcc"
  const resumo = String(form.get("resumo") ?? "").trim()

  if (!titulo || !autor || Number.isNaN(ano)) {
    return { erro: "Título, autor e ano são obrigatórios.", status: 400 }
  }

  return { dados: { titulo, autor, ano, tipo, resumo } }
}

export async function lerPdf(
  entrada: FormDataEntryValue | null
): Promise<{ pdf: { nome: string; dados: Buffer } | null } | Falha> {
  if (!(entrada instanceof File) || entrada.size === 0) return { pdf: null }

  if (entrada.size > TAMANHO_MAXIMO_PDF) {
    return {
      erro: "O PDF é grande demais (máximo de 4 MB). Comprima o arquivo e tente de novo.",
      status: 413,
    }
  }

  const dados = Buffer.from(await entrada.arrayBuffer())

  if (dados.subarray(0, 4).toString("latin1") !== "%PDF") {
    return { erro: "O arquivo enviado não é um PDF válido.", status: 400 }
  }

  return { pdf: { nome: entrada.name, dados } }
}

export function ehFalha(resultado: object): resultado is Falha {
  return "erro" in resultado
}

export function lerId(valor: string): number | null {
  return /^\d+$/.test(valor) ? Number(valor) : null
}
