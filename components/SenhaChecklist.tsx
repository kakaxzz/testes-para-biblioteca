"use client"

import { avaliarSenha } from "@/lib/senha-forte"

// Checklist ao vivo + barra de força. Fica escondido até a pessoa começar a digitar.
export function SenhaChecklist({ senha }: { senha: string }) {
  if (!senha) return null
  const { resultados, atendidas, total, forte } = avaliarSenha(senha)

  const fracao = atendidas / total
  const nivel = forte ? "Forte" : fracao >= 0.66 ? "Média" : "Fraca"
  const cor = forte ? "#166534" : fracao >= 0.66 ? "#b45309" : "#8b1e1e"

  return (
    <div className="mt-2 rounded-xl border border-black/5 bg-white/60 p-3 text-left" aria-live="polite">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${fracao * 100}%`, background: cor }} />
        </div>
        <span className="text-xs font-bold" style={{ color: cor }}>{nivel}</span>
      </div>
      <ul className="grid gap-1 text-[13px]">
        {resultados.map((r) => (
          <li key={r.id} className="flex items-center gap-2" style={{ color: r.atendida ? "#166534" : "#7b5d5d" }}>
            <span aria-hidden className="w-4 text-center font-bold">{r.atendida ? "✓" : "○"}</span>
            <span>{r.rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
