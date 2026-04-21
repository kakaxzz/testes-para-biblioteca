"use client"

import { useState, useRef, useEffect } from "react"

export const CATEGORIAS = [
  "Literatura brasileira", "Literatura estrangeira", "Poesia", "Romance", "Ficcção científica", "fantasia", "Mistério / Suspense", "Terror", "Aventura", "Infantojuvenil", "Clássicos", "Política", "Economia", "Administração", "Culinária", "HQs / Mangás",
  "História do Brasil", "História geral", "Geografia", "Filosofia",
  "Sociologia", "Psicologia", "Educação", "Ciências naturais",
  "Biologia", "Química", "Física", "Matemática", "Astronomia",
  "Língua portuguesa / Gramática", "Língua inglesa", "Língua espanhola",
  "Redação", "Artes", "Tecnologia e informática", "Autoajuda",
  "Biografias", "Religião", "Referência / Dicionários", "Outro",
]

interface CategoriasSelectProps {
  value: string[]
  onChange: (novas: string[]) => void
}

export function CategoriasSelect({ value, onChange }: CategoriasSelectProps) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
        setBusca("")
      }
    }
    document.addEventListener("mousedown", handleClickFora)
    return () => document.removeEventListener("mousedown", handleClickFora)
  }, [])

  useEffect(() => {
    if (aberto) buscaRef.current?.focus()
  }, [aberto])

  // Fecha com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setAberto(false); setBusca("") }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  function toggle(categoria: string) {
    if (value.includes(categoria)) onChange(value.filter(c => c !== categoria))
    else onChange([...value, categoria])
  }

  const opcoesFiltradas = CATEGORIAS.filter(c =>
    c.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => setAberto(v => !v)}
        className="input-field"
        style={{
          display: "flex", flexWrap: "wrap", gap: 6,
          minHeight: 42, cursor: "pointer",
          alignItems: "center", padding: "6px 10px"
        }}
      >
        {value.length === 0 && (
          <span style={{ color: "#aaa", fontSize: 14, userSelect: "none" }}>
            Selecione as categorias...
          </span>
        )}
        {value.map(cat => (
          <span
            key={cat}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#fdf0f0", border: "1px solid rgba(139,30,30,0.2)",
              color: "#8b1e1e", borderRadius: 20, padding: "2px 10px",
              fontSize: 12, fontWeight: 500
            }}
          >
            {cat}
            <button
              onClick={e => { e.stopPropagation(); onChange(value.filter(c => c !== cat)) }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#8b1e1e", padding: 0, fontSize: 14, lineHeight: 1, opacity: 0.6
              }}
            >×</button>
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#aaa", userSelect: "none" }}>
          {aberto ? "▲" : "▼"}
        </span>
      </div>

      {aberto && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, overflow: "hidden"
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>
            <input
              ref={buscaRef}
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar categoria..."
              style={{
                width: "100%", border: "none", outline: "none",
                fontSize: 13, background: "transparent", color: "#333"
              }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {opcoesFiltradas.length === 0 && (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>
                Nenhuma categoria encontrada
              </div>
            )}
            {opcoesFiltradas.map(cat => {
              const sel = value.includes(cat)
              return (
                <div
                  key={cat}
                  onClick={() => toggle(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", cursor: "pointer", fontSize: 13,
                    background: sel ? "#fdf6f6" : "transparent",
                    color: sel ? "#8b1e1e" : "#333",
                    fontWeight: sel ? 500 : 400,
                    borderBottom: "0.5px solid #f5f5f5"
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: sel ? "2px solid #8b1e1e" : "1.5px solid #ccc",
                    background: sel ? "#8b1e1e" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {sel && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {cat}
                </div>
              )
            })}
          </div>
          {value.length > 0 && (
            <div style={{
              padding: "8px 14px", borderTop: "1px solid #f0f0f0",
              display: "flex", justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                {value.length} selecionada{value.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => onChange([])}
                style={{
                  background: "none", border: "none", fontSize: 12,
                  color: "#8b1e1e", cursor: "pointer", padding: 0
                }}
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}