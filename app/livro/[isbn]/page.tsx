"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function DetalheLivroPage() {
  const { isbn } = useParams()
  const [livro, setLivro] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/livros/${isbn}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setLivro(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isbn])

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Source Sans 3', sans-serif", color: "#aaa" }}>
      Carregando...
    </div>
  )

  if (!livro) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Source Sans 3', sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <p style={{ color: "#aaa", marginBottom: 20 }}>Livro não encontrado.</p>
      <Link href="/" style={{ color: "#8b1e1e", textDecoration: "none", fontWeight: 600 }}>← Voltar ao catálogo</Link>
    </div>
  )

  const assuntos = livro.assuntos ? livro.assuntos.split(",").map((a: string) => a.trim()).filter(Boolean) : []

  const metadados = [
    livro.editora && { label: "Editora", value: livro.editora },
    livro.edicao && { label: "Edição", value: `${livro.edicao}ª edição` },
    livro.volume && { label: "Volume", value: `Vol. ${livro.volume}` },
    livro.cdd && { label: "CDD", value: livro.cdd },
    { label: "ISBN", value: livro.isbn },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", minHeight: "100vh", background: "#f6f1ea" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* HEADER */}
      <header style={{
        background: "rgba(120, 26, 26, 0.96)",
        backdropFilter: "blur(12px)",
        padding: "14px 42px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
      }}>
        <Link href="/" style={{ textDecoration: "none", color: "#fff2ea", fontWeight: 700, fontSize: 14 }}>← Voltar ao catálogo</Link>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 900, color: "#fff7f0" }}>
          Biblioteca <span style={{ color: "#f4c58c" }}>Emerson Teixeira</span>
        </span>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ display: "flex", gap: 52, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* COLUNA ESQUERDA — capa + status */}
          <div style={{ 
            flexShrink: 0, 
            width: 280,
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.06)",
            display: "flex", 
            flexDirection: "column", 
            gap: "16px"
          }}>
            {livro.capa ? (
              <img
                src={livro.capa}
                alt={livro.titulo}
                style={{ width: "100%", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              />
            ) : (
              <div style={{
                width: "100%", height: 320, background: "#ede5db", borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64
              }}>📖</div>
            )}

            {/* STATUS */}
            <div style={{
              padding: "12px", borderRadius: 8, textAlign: "center",
              background: livro.status === "disponivel" ? "#15803d" : "#b91c1c",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#ffffff", letterSpacing: "0.02em" }}>
                {livro.status === "disponivel" ? "Disponível" : "Emprestado"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                {livro.status === "disponivel" ? "Pode ser retirado" : "Indisponível no momento"}
              </div>
            </div>

            {/* QUANTIDADE */}
            {livro.quantidadeTotal > 1 && (
              <div style={{
                padding: "12px 16px", borderRadius: 12, textAlign: "center",
                background: "rgba(139,30,30,0.04)", border: "1px solid rgba(139,30,30,0.1)"
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#8b1e1e" }}>
                  {livro.quantidadeTotal} cópias no acervo
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA — info */}
          <div style={{ 
            flex: 1, 
            minWidth: 320,
            background: "#ffffff",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.06)"
          }}>

            {/* SÉRIE / VOLUME */}
            {livro.volume && (
              <p style={{ fontSize: 13, color: "#8b1e1e", fontWeight: 700, marginBottom: 6, letterSpacing: "0.04em" }}>
                Volume {livro.volume}
              </p>
            )}

            {/* TÍTULO */}
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38, fontWeight: 900,
              color: "#1a1010", lineHeight: 1.15, marginBottom: 8
            }}>
              {livro.titulo}
            </h1>

            {/* AUTOR */}
            <p style={{ fontSize: 17, color: "#7a5c5c", marginBottom: 24, fontWeight: 500 }}>
              de <span style={{ color: "#8b1e1e", fontWeight: 700 }}>{livro.autor}</span>
            </p>

            {/* ASSUNTOS */}
            {assuntos.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {assuntos.map((a: string) => (
                  <span key={a} style={{
                    padding: "5px 14px",
                    background: "rgba(139,30,30,0.08)",
                    color: "#8b1e1e",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            )}

            {/* SINOPSE */}
            {livro.sinopse && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18, marginBottom: 10, color: "#1a1010"
                }}>Sinopse</h3>
                <p style={{ color: "#554545", fontSize: 15, lineHeight: 1.85 }}>{livro.sinopse}</p>
              </div>
            )}

            {/* CARDS DE METADADOS */}
            {metadados.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 16, marginBottom: 12, color: "#1a1010"
                }}>Detalhes</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {metadados.map((m) => (
                    <div key={m.label} style={{
                      padding: "14px 16px",
                      background: "#faf7f5",
                      borderRadius: 12,
                      border: "1px solid rgba(139,30,30,0.08)"
                    }}>
                      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2d1414" }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
