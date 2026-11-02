"use client"

import { useState } from "react"

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Classes do <input> (padrão: mesmo visual do .input-field do painel) */
  inputClassName?: string
}

const PADRAO =
  "w-full min-w-0 rounded-[14px] border border-[#8b1e1e]/15 bg-white/80 py-3 pl-3.5 text-[0.95rem] text-[#261111] outline-none transition focus:border-[#8b1e1e] focus:bg-white focus:ring-4 focus:ring-[#8b1e1e]/10"

const icone = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-5",
  "aria-hidden": true,
}

// Campo de senha com o "olhinho" que mostra/esconde o que foi digitado
export function PasswordInput({ inputClassName = PADRAO, className = "", ...props }: Props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input {...props} type={visivel ? "text" : "password"} className={`${inputClassName} pr-12`} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        // evita tirar o foco do campo quando clica no olhinho com o mouse/dedo
        onMouseDown={(e) => e.preventDefault()}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        title={visivel ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-[14px] text-[#8b1e1e]/55 transition hover:text-[#8b1e1e] focus-visible:text-[#8b1e1e] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#8b1e1e]/40"
      >
        {visivel ? (
          <svg {...icone}>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.9 10.9 0 0112 5c6.4 0 10 7 10 7a17.6 17.6 0 01-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1" />
            <path d="M9.9 9.9a3 3 0 004.2 4.2" />
          </svg>
        ) : (
          <svg {...icone}>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
