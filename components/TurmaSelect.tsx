"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { TURMAS } from "@/lib/turmas"

interface Props {
  value: string | null | undefined
  onChange: (valor: string) => void
  required?: boolean
  className?: string
  style?: CSSProperties
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

export function TurmaSelect({ value, onChange, required, className, style }: Props) {
  const atual = value ?? ""
  const [texto, setTexto] = useState(atual)
  const [aberto, setAberto] = useState(false)
  const [destaque, setDestaque] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setTexto(atual) }, [atual])

  const opcoes = useMemo(() => {
    const busca = normalizar(texto)
    if (!busca || (TURMAS as readonly string[]).includes(texto)) return [...TURMAS]
    const comecam = TURMAS.filter((t) => normalizar(t).startsWith(busca))
    const contem = TURMAS.filter((t) => !normalizar(t).startsWith(busca) && normalizar(t).includes(busca))
    return [...comecam, ...contem]
  }, [texto])

  useEffect(() => { setDestaque(0) }, [texto])

  useEffect(() => {
    if (!aberto) return
    const el = listaRef.current?.children[destaque] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [destaque, aberto])

  function escolher(turma: string) {
    setTexto(turma)
    onChange(turma)
    setAberto(false)
  }

  function confirmar() {
    setAberto(false)
    if (texto.trim() === "") {
      setTexto("")
      onChange("")
      return
    }
    const exata = TURMAS.find((t) => normalizar(t) === normalizar(texto))
    if (exata) {
      setTexto(exata)
      onChange(exata)
    } else {
      setTexto(atual)
    }
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setAberto(true)
      setDestaque((d) => Math.min(d + 1, opcoes.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setDestaque((d) => Math.max(d - 1, 0))
    } else if (e.key === "Enter") {
      if (aberto && opcoes[destaque]) {
        e.preventDefault()
        escolher(opcoes[destaque])
      }
    } else if (e.key === "Escape") {
      setAberto(false)
      setTexto(atual)
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        className={className}
        style={{ width: "100%", boxSizing: "border-box", ...style }}
        value={texto}
        required={required}
        placeholder="Digite a turma (ex: 2AFM)"
        autoComplete="off"
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
        maxLength={30}
        onChange={(e) => { setTexto(e.target.value.toUpperCase()); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onBlur={confirmar}
        onKeyDown={aoTeclar}
      />

      {aberto && (
        <div
          ref={listaRef}
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
            maxHeight: 220, overflowY: "auto", background: "#fff",
            border: "1px solid #e0e0e0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          }}
        >
          {opcoes.length === 0 && (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>Nenhuma turma encontrada</div>
          )}
          {opcoes.map((t, i) => (
            <div
              key={t}
              role="option"
              aria-selected={t === atual}
              onMouseDown={(e) => { e.preventDefault(); escolher(t) }}
              onMouseEnter={() => setDestaque(i)}
              style={{
                padding: "9px 14px", fontSize: 14, cursor: "pointer", color: "#2d1414",
                background: i === destaque ? "#fdf0f0" : "transparent",
                fontWeight: t === atual ? 700 : 400,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
