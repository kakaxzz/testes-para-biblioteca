"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CLASSIFICACAO_INFO, normalizarClassificacao, temRestricaoDeIdade } from "@/lib/classificacao"

type Relacionado = {
  id: number | string
  isbn: string
  titulo: string
  capa?: string | null
  assuntos?: string | null
  quantidadeDisponivel: number
}

// Cores suaves usadas quando o livro ainda não tem capa cadastrada
const CORES_CAPA = ["#e8a9bb", "#a3b8c9", "#c9b48c", "#b5c7a8", "#c9a9d6", "#e0b48f"]

function corDaCapa(texto: string) {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return CORES_CAPA[h % CORES_CAPA.length]
}

function listaAssuntos(assuntos?: string | null) {
  return (assuntos ?? "").split(",").map((a) => a.trim()).filter(Boolean)
}

// Converte a data ISO em "15 de outubro" e avisa se essa data já passou
function formatarPrevisao(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return {
    texto: d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }),
    passou: d.getTime() < hoje.getTime(),
  }
}

export default function LivroDetalhe() {
  const { isbn } = useParams()
  const [livro, setLivro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<Relacionado[]>([])

  useEffect(() => {
    fetch(`/api/livros/${isbn}`)
      .then((r) => r.json())
      .then((data) => { setLivro(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isbn])

  // Lista do acervo, usada só para sugerir "Mais como este"
  useEffect(() => {
    fetch("/api/livros")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTodos(data) })
      .catch(() => {})
  }, [])

  const relacionados = useMemo<Relacionado[]>(() => {
    if (!livro || livro.error) return []
    const meus = listaAssuntos(livro.assuntos).map((a) => a.toLowerCase())
    if (meus.length === 0) return []
    return todos
      .filter((l: Relacionado) => l.isbn !== livro.isbn && listaAssuntos(l.assuntos).some((a) => meus.includes(a.toLowerCase())))
      .slice(0, 3)
  }, [livro, todos])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f3ebe3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, color: "#8b6b6b" }}>
      Carregando...
    </div>
  )

  if (!livro || livro.error) return (
    <div style={{ minHeight: "100vh", background: "#f3ebe3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Source Sans 3', sans-serif" }}>
      <div style={{ fontSize: 48 }}>📚</div>
      <div style={{ fontSize: 18, color: "#5e3a3a", fontWeight: 700 }}>Livro não encontrado</div>
      <Link href="/" style={{ color: "#8b1e1e", fontWeight: 700, textDecoration: "none" }}>← Voltar ao catálogo</Link>
    </div>
  )

  const total: number = livro.quantidadeTotal ?? 0
  const disp: number = livro.quantidadeDisponivel ?? 0
  const disponivel = disp > 0
  const classificacao = normalizarClassificacao(livro.classificacaoIndicativa)
  const infoClass = classificacao ? CLASSIFICACAO_INFO[classificacao] : null
  const assuntos = listaAssuntos(livro.assuntos)
  const categoria = assuntos[0]
  const outrosAssuntos = assuntos.slice(1)
  const previsao = !disponivel ? formatarPrevisao(livro.previsaoDevolucao) : null

  const metas: { label: string; value: string }[] = []
  if (livro.editora) metas.push({ label: "Editora", value: livro.editora })
  metas.push({ label: "ISBN", value: livro.isbn })
  metas.push({ label: "Exemplares", value: `${disp} de ${total}` })
  if (livro.edicao) metas.push({ label: "Edição", value: `${livro.edicao}ª edição` })
  if (livro.volume) metas.push({ label: "Volume", value: `Vol. ${livro.volume}` })
  if (livro.cdd) metas.push({ label: "CDD", value: livro.cdd })

  return (
    <div className="ld-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ld-page { min-height: 100vh; background: #f3ebe3; font-family: 'Source Sans 3', sans-serif; color: #3a1e1e; }

        .ld-header {
          position: fixed; top: 0; width: 100%; z-index: 100; background: rgba(120,26,26,0.96);
          backdrop-filter: blur(12px); padding: 14px 42px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .ld-brand { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #fff7f0; text-decoration: none; }
        .ld-brand span { color: #f4c58c; }
        .ld-back {
          color: #fff2ea; font-weight: 700; font-size: 0.95rem; text-decoration: none;
          padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.1);
          transition: background 0.2s ease;
        }
        .ld-back:hover { background: rgba(255,255,255,0.2); }

        .ld-main { max-width: 1040px; margin: 0 auto; padding: 108px 28px 80px; }
        .ld-grid { display: grid; grid-template-columns: 228px minmax(0, 1fr); gap: 36px; align-items: start; }

        .ld-cover img { width: 100%; height: auto; display: block; border-radius: 16px; box-shadow: 0 16px 40px rgba(55,18,18,0.18); }
        .ld-cover-ph {
          width: 100%; aspect-ratio: 228 / 336; border-radius: 16px; display: flex; align-items: flex-end;
          padding: 16px; font-size: 0.95rem; font-weight: 600; color: rgba(70,30,40,0.78);
        }

        .ld-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; min-height: 30px; }
        .ld-age {
          display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 30px;
          padding: 0 10px; border-radius: 8px; font-size: 1rem; font-weight: 800;
        }
        .ld-cat { font-size: 0.86rem; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: #8b7a74; }
        .ld-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.1; color: #2d1414; margin-bottom: 8px; }
        .ld-author { font-size: 1.05rem; font-weight: 600; color: #8b7a74; margin-bottom: 22px; }

        .ld-status {
          display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 16px;
          margin-bottom: 18px; border: 1px solid;
        }
        .ld-status.off { background: #fbe7e3; border-color: #f1c8c2; }
        .ld-status.ok { background: #e8f5ec; border-color: #bfe0cb; }
        .ld-status-icon { flex-shrink: 0; display: inline-flex; }
        .ld-status-title { font-size: 1.05rem; font-weight: 700; }
        .ld-status.off .ld-status-title { color: #a32424; }
        .ld-status.ok .ld-status-title { color: #166534; }
        .ld-status-sub { font-size: 0.92rem; color: #8b7a74; margin-top: 2px; }

        .ld-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 26px; }
        .ld-meta-item { background: #fffdfa; border: 1px solid #eadfd4; border-radius: 16px; padding: 14px 18px; min-width: 0; }
        .ld-meta-label { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8b7a74; margin-bottom: 2px; }
        .ld-meta-value { font-size: 1rem; font-weight: 700; color: #2d1414; overflow-wrap: anywhere; }

        .ld-section-label { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8b7a74; margin-bottom: 8px; }
        .ld-synopsis { font-size: 1.05rem; line-height: 1.65; color: #3a1e1e; margin-bottom: 18px; }
        .ld-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .ld-tag { font-size: 0.82rem; font-weight: 700; padding: 4px 11px; border-radius: 999px; background: rgba(139,30,30,0.08); color: #8b1e1e; }
        .ld-note { display: flex; align-items: flex-start; gap: 8px; font-size: 0.92rem; line-height: 1.5; color: #8b7a74; }
        .ld-note svg { flex-shrink: 0; margin-top: 2px; }

        .ld-more { margin-top: 36px; padding-top: 30px; border-top: 1px solid #e3d6ca; }
        .ld-more h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #2d1414; margin-bottom: 18px; font-weight: 700; }
        .ld-more-row { display: flex; flex-wrap: wrap; gap: 26px 40px; }
        .ld-mini { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; max-width: 300px; transition: transform 0.2s ease; }
        .ld-mini:hover { transform: translateY(-3px); }
        .ld-mini-cover { flex-shrink: 0; width: 94px; height: 134px; border-radius: 10px; overflow: hidden; display: block; border: 1px solid rgba(120,32,32,0.08); }
        .ld-mini-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ld-mini-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .ld-mini-info strong { font-size: 1.05rem; color: #2d1414; line-height: 1.25; }
        .ld-mini-info em { font-style: normal; font-size: 0.92rem; color: #8b7a74; }

        @media (max-width: 760px) {
          .ld-header { padding: 12px 18px; }
          .ld-brand { font-size: 1.2rem; }
          .ld-main { padding: 96px 18px 60px; }
          .ld-grid { grid-template-columns: 1fr; gap: 24px; }
          .ld-cover { max-width: 220px; margin: 0 auto; width: 100%; }
        }
      `}</style>

      <header className="ld-header">
        <Link href="/" className="ld-brand">Biblioteca <span>Emerson Teixeira</span></Link>
        <Link href="/#catalogo" className="ld-back">← Voltar ao catálogo</Link>
      </header>

      <main className="ld-main">
        <div className="ld-grid">
          {/* Capa */}
          <div className="ld-cover">
            {livro.capa ? (
              <img src={livro.capa} alt={livro.titulo} />
            ) : (
              <div className="ld-cover-ph" style={{ background: corDaCapa(livro.titulo ?? "") }}>
                Capa do livro
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div>
            {(classificacao || categoria) && (
              <div className="ld-eyebrow">
                {classificacao && infoClass && (
                  <span className="ld-age" style={{ background: infoClass.fundo, color: infoClass.cor }} title={infoClass.descricao}>
                    {infoClass.rotulo}
                  </span>
                )}
                {categoria && <span className="ld-cat">{categoria}</span>}
              </div>
            )}

            <h1 className="ld-title">{livro.titulo}</h1>
            <p className="ld-author">{livro.autor}</p>

            {/* Disponibilidade */}
            <div className={`ld-status ${disponivel ? "ok" : "off"}`}>
              <span className="ld-status-icon">
                {disponivel ? (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M7.5 12.5l3 3 6-6.5" />
                  </svg>
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a32424" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
                  </svg>
                )}
              </span>
              <div>
                <div className="ld-status-title">
                  {disponivel ? "Disponível para empréstimo" : "Nenhum exemplar disponível"}
                </div>
                {disponivel && (
                  <div className="ld-status-sub">
                    {`${disp} de ${total} exemplar${total > 1 ? "es" : ""} disponível${disp > 1 ? "is" : ""}`}
                  </div>
                )}
                {previsao && (
                  <div className="ld-status-sub">
                    {previsao.passou
                      ? "A devolução prevista já passou. Fale com a bibliotecária."
                      : `Previsão de devolução: ${previsao.texto}`}
                  </div>
                )}
              </div>
            </div>

            {/* Editora / ISBN / Exemplares */}
            <div className="ld-meta">
              {metas.map((m) => (
                <div key={m.label} className="ld-meta-item">
                  <div className="ld-meta-label">{m.label}</div>
                  <div className="ld-meta-value">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Sinopse */}
            {livro.sinopse && (
              <div>
                <div className="ld-section-label">Sinopse</div>
                <p className="ld-synopsis">{livro.sinopse}</p>
              </div>
            )}

            {/* Demais assuntos (o primeiro já aparece ao lado da classificação) */}
            {outrosAssuntos.length > 0 && (
              <div className="ld-tags">
                {outrosAssuntos.map((a) => (
                  <span key={a} className="ld-tag">{a}</span>
                ))}
              </div>
            )}

            {/* Aviso de idade */}
            {classificacao && temRestricaoDeIdade(classificacao) && (
              <p className="ld-note" role="note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7a74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 11v5M12 7.5h.01" />
                </svg>
                <span>Menores de {classificacao} podem retirar com autorização do responsável. Fale com a bibliotecária.</span>
              </p>
            )}
          </div>
        </div>

        {/* Mais como este */}
        {relacionados.length > 0 && (
          <section className="ld-more">
            <h2>Mais como este</h2>
            <div className="ld-more-row">
              {relacionados.map((r: Relacionado) => (
                <Link key={r.id} href={`/livro/${r.isbn}`} className="ld-mini">
                  <span className="ld-mini-cover" style={r.capa ? undefined : { background: corDaCapa(r.titulo ?? "") }}>
                    {r.capa && <img src={r.capa} alt="" />}
                  </span>
                  <span className="ld-mini-info">
                    <strong>{r.titulo}</strong>
                    <em>{r.quantidadeDisponivel > 0 ? "Disponível" : "Emprestado"}</em>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
