
const TURMAS_QUE_SAEM = new Set(["3001INFO1", "3001INFO2", "3003ADM-ENF", "3ANO PRÉ MILITAR"])

const PROXIMA_TECNICO: Record<string, string> = {
  "1001INFO1": "2001INFO1",
  "1001INFO2": "2001INFO2",
  "1003ADM-ENF": "2003ADM-ENF",
  "1ANO PRÉ MILITAR": "2ANO PRÉ MILITAR",
  "2001INFO1": "3001INFO1",
  "2001INFO2": "3001INFO2",
  "2003ADM-ENF": "3003ADM-ENF",
  "2ANO PRÉ MILITAR": "3ANO PRÉ MILITAR",
}

export type Destino =
  | { tipo: "promover"; turma: string }
  | { tipo: "remover" }
  | { tipo: "manter" }

export function destinoDaTurma(turma: string | null | undefined): Destino {
  const t = (turma ?? "").trim()
  if (!t) return { tipo: "manter" }
  if (TURMAS_QUE_SAEM.has(t)) return { tipo: "remover" }
  if (PROXIMA_TECNICO[t]) return { tipo: "promover", turma: PROXIMA_TECNICO[t] }

  const m = /^([2-9])([AB]F[MT])$/.exec(t)
  if (m) {
    const serie = Number(m[1])
    if (serie === 9) return { tipo: "remover" }
    return { tipo: "promover", turma: `${serie + 1}${m[2]}` }
  }
  return { tipo: "manter" }
}

export const ORDEM_DA_PROMOCAO: { de: string; para: string }[] = (() => {
  const lista: { de: string; para: string }[] = []
  for (let serie = 8; serie >= 2; serie--) {
    for (const sufixo of ["AFM", "BFM", "AFT", "BFT"]) {
      lista.push({ de: `${serie}${sufixo}`, para: `${serie + 1}${sufixo}` })
    }
  }
  for (const [de, para] of Object.entries(PROXIMA_TECNICO)) {
    if (de.startsWith("2")) lista.push({ de, para })
  }
  for (const [de, para] of Object.entries(PROXIMA_TECNICO)) {
    if (de.startsWith("1")) lista.push({ de, para })
  }
  return lista
})()
