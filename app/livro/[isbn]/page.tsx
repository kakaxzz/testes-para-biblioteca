"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function LivroDetalhe() {
  const { isbn } = useParams()
  const router = useRouter()
  const [livro, setLivro] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/livros/${isbn}`)
      .then(r => r.json())
      .then(data => { setLivro(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isbn])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f6f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, color: "#8b6b6b" }}>
      Carregando...
    </div>
  )

  if (!livro || livro.error) return (
    <div style={{ minHeight: "100vh", background: "#f6f1ea", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Source Sans 3', sans-serif" }}>
      <div style={{ fontSize: 48 }}>📚</div>
      <div style={{ fontSize: 18, color: "#5e3a3a", fontWeight: 700 }}>Livro não encontrado</div>
      <Link href="/" style={{ color: "#8b1e1e", fontWeight: 700, textDecoration: "none" }}>← Voltar ao catálogo</Link>
    </div>
  )

  const disponivel = livro.quantidadeDisponivel > 0
  const classificacao: string = livro.classificacaoIndicativa || ""
  const classificacaoInfo = CLASSIFICACOES[classificacao] || CLASSIFICACOES[""]

  return (
    <div style={{ minHeight: "100vh", background: "#f6f1ea", fontFamily: "'Source Sans 3', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Topbar */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 100, background: "rgba(120,26,26,0.96)", backdropFilter: "blur(12px)", padding: "14px 42px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff7f0", textDecoration: "none" }}>
          Biblioteca <span style={{ color: "#f4c58c" }}>Emerson Teixeira</span>
        </Link>
        <Link href="/#catalogo" style={{ color: "#fff2ea", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
          ← Voltar ao catálogo
        </Link>
      </header>

      {/* Conteúdo */}
      <main style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Capa */}
          <div style={{ flexShrink: 0 }}>
            {livro.capa ? (
              <img src={livro.capa} alt={livro.titulo} style={{ width: 180, borderRadius: 12, boxShadow: "0 16px 40px rgba(55,18,18,0.18)" }} />
            ) : (
              <div style={{ width: 180, height: 260, background: "#ede5db", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#7a3434" }}>📚</div>
            )}
          </div>

          {/* Detalhes */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#2d1414", lineHeight: 1.1, marginBottom: 8 }}>
              {livro.titulo}
            </h1>
            <p style={{ fontSize: 16, color: "#7a5e5e", fontWeight: 700, marginBottom: 20 }}>{livro.autor}</p>

            {/* Badge de disponibilidade */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, marginBottom: 24, background: disponivel ? "rgba(240,250,244,0.95)" : "rgba(253,242,242,0.95)", color: disponivel ? "#166534" : "#8b1e1e", fontWeight: 800, fontSize: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: disponivel ? "#16a34a" : "#8b1e1e", display: "inline-block" }} />
              {disponivel
                ? `${livro.quantidadeDisponivel} de ${livro.quantidadeTotal} exemplar${livro.quantidadeTotal > 1 ? "es" : ""} disponível${livro.quantidadeDisponivel > 1 ? "is" : ""}`
                : "Nenhum exemplar disponível"}
            </div>

            {/* Classificação indicativa */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, marginBottom: 24, background: classificacaoInfo.bg, border: `1px solid ${classificacaoInfo.border}` }}>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: classificacao ? 15 : 11,
                background: classificacaoInfo.badgeBg, color: "#fff",
              }}>
                {classificacao ? `+${classificacao}` : "LIVRE"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: classificacaoInfo.text, marginBottom: 2 }}>
                  {classificacaoInfo.titulo}
                </div>
                <div style={{ fontSize: 13, color: classificacaoInfo.text, lineHeight: 1.5, opacity: 0.9 }}>
                  {classificacaoInfo.mensagem}
                </div>
              </div>
            </div>

            {/* Metadados */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              {livro.editora && <MetaItem label="Editora" value={livro.editora} />}
              {livro.edicao && <MetaItem label="Edição" value={`${livro.edicao}ª edição`} />}
              {livro.volume && <MetaItem label="Volume" value={`Vol. ${livro.volume}`} />}
              {livro.cdd && <MetaItem label="CDD" value={livro.cdd} />}
              <MetaItem label="ISBN" value={livro.isbn} />
            </div>

            {/* Assuntos */}
            {livro.assuntos && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9c8d8d", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Assuntos</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {livro.assuntos.split(",").map((a: string) => a.trim()).filter(Boolean).map((a: string) => (
                    <span key={a} style={{ fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "rgba(139,30,30,0.08)", color: "#8b1e1e" }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sinopse */}
            {livro.sinopse && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9c8d8d", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sinopse</div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "#4a3535" }}>{livro.sinopse}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const CLASSIFICACOES: Record<string, { titulo: string; mensagem: string; bg: string; border: string; badgeBg: string; text: string }> = {
  "": {
    titulo: "Classificação livre",
    mensagem: "Este livro pode ser retirado por leitores de qualquer idade.",
    bg: "rgba(240,250,244,0.6)",
    border: "rgba(22,163,74,0.15)",
    badgeBg: "#16a34a",
    text: "#166534",
  },
  "12": {
    titulo: "Classificação indicativa: +12 anos",
    mensagem: "Recomendado para leitores a partir de 12 anos. Se você tiver menos que isso, é necessário solicitar autorização do seu responsável na biblioteca para retirar este livro.",
    bg: "rgba(255,247,232,0.7)",
    border: "rgba(217,119,6,0.18)",
    badgeBg: "#d97706",
    text: "#92400e",
  },
  "14": {
    titulo: "Classificação indicativa: +14 anos",
    mensagem: "Recomendado para leitores a partir de 14 anos. Se você tiver menos que isso, é necessário solicitar autorização do seu responsável na biblioteca para retirar este livro.",
    bg: "rgba(255,247,232,0.7)",
    border: "rgba(217,119,6,0.18)",
    badgeBg: "#d97706",
    text: "#92400e",
  },
  "16": {
    titulo: "Classificação indicativa: +16 anos",
    mensagem: "Recomendado para leitores a partir de 16 anos. Se você tiver menos que isso, é necessário solicitar autorização do seu responsável na biblioteca para retirar este livro.",
    bg: "rgba(253,242,242,0.75)",
    border: "rgba(139,30,30,0.18)",
    badgeBg: "#8b1e1e",
    text: "#8b1e1e",
  },
  "18": {
    titulo: "Classificação indicativa: +18 anos",
    mensagem: "Recomendado exclusivamente para leitores a partir de 18 anos. Se você tiver menos que isso, é necessário solicitar autorização do seu responsável na biblioteca para retirar este livro.",
    bg: "rgba(253,242,242,0.75)",
    border: "rgba(139,30,30,0.18)",
    badgeBg: "#8b1e1e",
    text: "#8b1e1e",
  },
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(120,32,32,0.08)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9c8d8d", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#3a1e1e" }}>{value}</div>
    </div>
  )
}