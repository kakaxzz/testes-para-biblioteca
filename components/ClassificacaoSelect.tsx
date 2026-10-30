"use client"

import { CLASSIFICACOES, CLASSIFICACAO_INFO, normalizarClassificacao } from "@/lib/classificacao"

interface Props {
  value: string | null | undefined
  onChange: (valor: string) => void
}

export function ClassificacaoSelect({ value, onChange }: Props) {
  const atual = normalizarClassificacao(value)
  const info = atual ? CLASSIFICACAO_INFO[atual] : null

  return (
    <div>
      <select
        className="input-field"
        value={atual ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Não informada</option>
        {CLASSIFICACOES.map((c) => (
          <option key={c} value={c}>
            {c === "L" ? "L — Livre" : `${c} anos`}
          </option>
        ))}
      </select>
      {info && (
        <div style={{ fontSize: 12, color: "#7a6a6a", marginTop: 6 }}>{info.descricao}</div>
      )}
    </div>
  )
}
