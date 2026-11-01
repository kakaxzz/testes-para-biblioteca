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

// "2 afm", "2-AFM" e "2afm" valem o mesmo; ignora acento e maiúscula
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

// Campo de digitar com sugestões: conforme a pessoa escreve, a lista mostra só as turmas que combinam
export function TurmaSelect({ value, onChange, required, className, style }: Props) {
  const atual = value ?? ""
  const [texto, setTexto] = useState(atual)
  const [aberto, setAberto] = useState(false)
  const [destaque, setDestaque] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)

  // acompanha mudanças de fora (abrir a edição de outro aluno, limpar o formulário depois de salvar)
  useEffect(() => { setTexto(atual) }, [atual])

  const opcoes = useMemo(() => {
    const busca = normalizar(texto)
    // com o campo já preenchido por uma turma válida, mostra a lista inteira para poder trocar
    if (!busca || (TURMAS as readonly string[]).includes(texto)) return [...TURMAS]
    const comecam = TURMAS.filter((t) => normalizar(t).startsWith(busca))
    const contem = TURMAS.filter((t) => !normalizar(t).startsWith(busca) && normalizar(t).includes(busca))
    return [...comecam, ...contem]
  }, [texto])

  useEffect(() => { setDestaque(0) }, [texto])

  // mantém a opção destacada visível quando navega com as setas
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

  // ao sair do campo: texto que não é turma da lista volta para o último valor válido
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
      // turma antiga (fora da lista) continua como está até a pessoa trocar
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
              // mousedown (e não click) para o campo não perder o foco antes da escolha
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
