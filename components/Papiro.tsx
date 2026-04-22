"use client"

import { useState, useRef, useEffect } from "react"

type Mensagem = {
  role: "user" | "assistant"
  content: string
}

interface PapiroProps {
  acervo: { titulo?: string; autor?: string; assuntos?: string; quantidadeDisponivel?: number }[]
}

export function Papiro({ acervo }: PapiroProps) {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: "assistant",
      content: "Olá! Eu sou o Papiro 🐢 o mascote da Biblioteca Emerson Teixeira! Me conta o que você gosta de ler e eu te indico um livro do nosso acervo!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto) fimRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens, aberto])

  async function enviar() {
    const texto = input.trim()
    if (!texto || loading) return

    const novasMensagens: Mensagem[] = [...mensagens, { role: "user", content: texto }]
    setMensagens(novasMensagens)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/papiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: novasMensagens,
          acervo,
        }),
      })
      const data = await res.json()
      setMensagens(prev => [...prev, { role: "assistant", content: data.resposta }])
    } catch {
      setMensagens(prev => [...prev, { role: "assistant", content: "Ops, tive um problema aqui. Tenta de novo!" }])
    }

    setLoading(false)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 200,
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(180deg, #8b1e1e 0%, #6d1414 100%)",
          border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(139,30,30,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.08)"
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(139,30,30,0.45)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = ""
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,30,30,0.35)"
        }}
        title="Falar com o Papiro"
      >
        🐢
      </button>

      {/* Janela do chat */}
      {aberto && (
        <div style={{
          position: "fixed", bottom: 104, right: 28, zIndex: 200,
          width: 340, maxHeight: 500,
          background: "#fffdf9",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(55,18,18,0.18)",
          border: "1px solid rgba(139,30,30,0.12)",
          display: "flex", flexDirection: "column",
          fontFamily: "'Source Sans 3', sans-serif",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(90deg, #8b1e1e 0%, #6d1414 100%)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🐢</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Papiro</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Mascote da Biblioteca</div>
            </div>
            <button
              onClick={() => setAberto(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer" }}
            >✕</button>
          </div>

          {/* Mensagens */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {mensagens.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                {m.role === "assistant" && (
                  <span style={{ fontSize: 18, marginRight: 6, flexShrink: 0, alignSelf: "flex-end" }}>🐢</span>
                )}
                <div style={{
                  maxWidth: "78%",
                  padding: "9px 13px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user"
                    ? "linear-gradient(135deg, #8b1e1e, #6d1414)"
                    : "rgba(139,30,30,0.07)",
                  color: m.role === "user" ? "#fff" : "#2d1414",
                  fontSize: 13, lineHeight: 1.55,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>🐢</span>
                <div style={{ padding: "9px 13px", borderRadius: "18px 18px 18px 4px", background: "rgba(139,30,30,0.07)", fontSize: 13, color: "#8b1e1e" }}>
                  Pensando...
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px 14px", borderTop: "1px solid rgba(139,30,30,0.08)", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && enviar()}
              placeholder="Ex: gosto de aventura..."
              style={{
                flex: 1, border: "1px solid rgba(139,30,30,0.18)", borderRadius: 999,
                padding: "9px 14px", fontSize: 13, outline: "none",
                background: "#fff", color: "#2d1414",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
              disabled={loading}
            />
            <button
              onClick={enviar}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                background: input.trim() ? "linear-gradient(180deg, #8b1e1e, #6d1414)" : "#e0d8d8",
                color: "white", cursor: input.trim() ? "pointer" : "default",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.2s",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}