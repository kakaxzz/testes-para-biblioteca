"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Trabalho = {
  id: number | string
  titulo?: string
  autor?: string
  resumo?: string
  tipo?: "tcc" | "artigo" | string
  ano?: string | number
  arquivo?: string
}

export default function TccPage() {
  const [tccs, setTccs] = useState<Trabalho[]>([])
  const [busca, setBusca] = useState("")
  const [tipo, setTipo] = useState<"todos" | "tcc" | "artigo">("todos")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tcc")
      .then((r) => r.json())
      .then((data) => {
        setTccs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = tccs.filter((t) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      t.titulo?.toLowerCase().includes(termo) ||
      t.autor?.toLowerCase().includes(termo)
    const matchTipo = tipo === "todos" || t.tipo === tipo

    return matchBusca && matchTipo
  })

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4ede3",
        color: "#241616",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #f4ede3;
        }

        a {
          color: inherit;
        }

        .tcc-shell {
          min-height: 100vh;
          background: #f4ede3;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: rgba(120, 26, 26, 0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 26px rgba(36, 10, 10, 0.12);
        }

        .topbar-inner {
          width: 100%;
          padding: 14px 38px 14px 42px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .back-link {
          text-decoration: none;
          color: #fff3eb;
          font-size: 0.96rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          transition: background 0.25s ease, transform 0.25s ease;
        }

        .back-link:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .brand {
          font-family: 'Lora', serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #fff7f0;
        }

        .brand span {
          color: #f4c58c;
        }

        .hero {
          background: #8a1f1f;
          position: relative;
          overflow: hidden;
          animation: fadeInSoft 0.7s ease-out;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(102, 18, 18, 0.18), rgba(102, 18, 18, 0) 42%);
          pointer-events: none;
        }

        .hero-inner {
          width: 100%;
          min-height: 280px;
          padding: 0 42px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          align-items: center;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .hero-copy {
          max-width: 560px;
          color: white;
          padding: 34px 0;
          animation: fadeInSoft 0.85s ease-out;
        }

        .hero-kicker {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.76);
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: 'Lora', serif;
          font-size: clamp(2.8rem, 5vw, 4.3rem);
          line-height: 0.94;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }

        .hero-title span {
          color: #f4c58c;
        }

        .hero-text {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.84);
          max-width: 440px;
        }

        .hero-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          animation: fadeInSoft 1s ease-out;
        }

        .hero-mark-card {
          width: min(100%, 280px);
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.18;
          font-family: 'Lora', serif;
          font-size: 6rem;
          font-weight: 700;
          color: #fff3eb;
          border: 2px solid rgba(255,255,255,0.18);
          border-radius: 50%;
        }

        .search-shell {
          width: 100%;
          margin: -24px 0 0;
          padding: 0 56px 0 42px;
          position: relative;
          z-index: 5;
          animation: fadeInSoft 0.95s ease-out;
        }

        .filters-row {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #7c5b5b;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          border: none;
          outline: none;
          border-radius: 999px;
          padding: 18px 24px 18px 52px;
          font-size: 0.98rem;
          font-family: 'Source Sans 3', sans-serif;
          background: rgba(231, 221, 210, 0.96);
          color: #321515;
          box-shadow: 0 10px 30px rgba(68, 27, 27, 0.08);
          transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease;
        }

        .search-input:focus {
          background: rgba(242, 237, 232, 0.98);
          box-shadow: 0 14px 34px rgba(68, 27, 27, 0.12);
          transform: translateY(-1px);
        }

        .chip-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          border: none;
          cursor: pointer;
          padding: 11px 20px;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 800;
          font-family: 'Source Sans 3', sans-serif;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, color 0.22s ease;
        }

        .chip.active {
          background: linear-gradient(180deg, #8d2525 0%, #6a1717 100%);
          color: white;
          box-shadow: 0 10px 22px rgba(122, 24, 24, 0.16);
        }

        .chip.inactive {
          background: rgba(255,255,255,0.72);
          color: #6a2a2a;
          box-shadow: 0 6px 18px rgba(88, 33, 33, 0.05);
        }

        .chip:hover {
          transform: translateY(-2px);
        }

        .content {
          padding: 46px 56px 86px 42px;
          animation: fadeInSoft 1.05s ease-out;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .section-accent {
          width: 16px;
          height: 42px;
          border-radius: 999px;
          background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%);
          box-shadow: 0 8px 18px rgba(95, 18, 18, 0.22);
        }

        .section-title {
          font-family: 'Lora', serif;
          font-size: clamp(2rem, 3vw, 2.5rem);
          font-weight: 700;
          color: #2d1414;
        }

        .section-count {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.92rem;
          color: #9c8d8d;
          font-weight: 700;
        }

        .feedback-box {
          font-family: 'Source Sans 3', sans-serif;
          text-align: center;
          padding: 80px 20px;
          color: #8f7e7e;
          font-weight: 700;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
          opacity: 0.8;
        }

        .work-list {
          display: grid;
          gap: 20px;
        }

        .work-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,245,0.9) 100%);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(55, 18, 18, 0.06);
          border: 1px solid rgba(120, 32, 32, 0.04);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .work-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(79, 20, 20, 0.12);
        }

        .work-card-inner {
          padding: 24px 28px;
          border-top: 2px solid rgba(125, 29, 29, 0.32);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .work-main {
          flex: 1;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .type-badge {
          font-family: 'Source Sans 3', sans-serif;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f7e3e3;
          color: #8b1e1e;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .year-text {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.85rem;
          color: #9c8d8d;
          font-weight: 700;
        }

        .work-title {
          font-family: 'Lora', serif;
          font-size: 1.55rem;
          color: #261111;
          margin-bottom: 6px;
          line-height: 1.12;
        }

        .work-author {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.98rem;
          color: #8a7474;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .work-summary {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.98rem;
          color: #5e4a4a;
          line-height: 1.7;
          max-width: 820px;
        }

        .pdf-link {
          flex-shrink: 0;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 12px;
          background: linear-gradient(180deg, #8d2525 0%, #6a1717 100%);
          color: white;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.92rem;
          font-weight: 800;
          align-self: center;
          box-shadow: 0 10px 22px rgba(122, 24, 24, 0.16);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .pdf-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 28px rgba(122, 24, 24, 0.2);
        }

        .footer {
          min-height: 72px;
          padding: 18px 24px;
          background: #3a1212;
          color: rgba(255,255,255,0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-top: 6px solid rgba(255,255,255,0.08);
        }

        @keyframes fadeInSoft {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .topbar-inner,
          .hero-inner,
          .search-shell,
          .content {
            padding-left: 18px;
            padding-right: 18px;
          }

          .hero-inner {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .hero-copy {
            padding: 22px 0 8px;
          }

          .hero-mark {
            min-height: 180px;
          }

          .hero-mark-card {
            width: min(100%, 220px);
            font-size: 4.6rem;
          }

          .filters-row,
          .work-card-inner {
            flex-direction: column;
          }

          .pdf-link {
            align-self: flex-start;
          }
        }
      `}</style>

      <div className="tcc-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand-row">
              <Link href="/" className="back-link">
                Voltar
              </Link>
              <div className="brand">
                Biblioteca <span>Emerson Teixeira</span>
              </div>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker">Escola Joao Paulo I</p>
              <h1 className="hero-title">
                TCCs <span>&</span> Artigos
              </h1>
              <p className="hero-text">
                Consulte as producoes academicas da comunidade escolar em um
                ambiente visual alinhado ao restante da biblioteca.
              </p>
            </div>

            <div className="hero-mark">
              <div className="hero-mark-card">T</div>
            </div>
          </div>
        </section>

        <section className="search-shell">
          <div className="filters-row">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por titulo ou autor..."
                className="search-input"
              />
            </div>

            <div className="chip-row">
              {(["todos", "tcc", "artigo"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`chip ${tipo === t ? "active" : "inactive"}`}
                >
                  {t === "todos" ? "Todos" : t === "tcc" ? "TCCs" : "Artigos"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="content">
          <div className="section-head">
            <div className="section-accent" />
            <h2 className="section-title">Coleção Academica</h2>
            <span className="section-count">
              {loading ? "carregando..." : `${filtrados.length} trabalhos`}
            </span>
          </div>

          {loading && <div className="feedback-box">Carregando producoes...</div>}

          {!loading && filtrados.length === 0 && (
            <div className="feedback-box">
              <div className="empty-icon">✦</div>
              <p>
                {busca
                  ? "Nenhum resultado encontrado."
                  : "Nenhum trabalho cadastrado ainda."}
              </p>
            </div>
          )}

          <div className="work-list">
            {filtrados.map((t) => (
              <article key={t.id} className="work-card">
                <div className="work-card-inner">
                  <div className="work-main">
                    <div className="meta-row">
                      <span className="type-badge">{t.tipo}</span>
                      <span className="year-text">{t.ano}</span>
                    </div>

                    <h3 className="work-title">{t.titulo}</h3>
                    <p className="work-author">{t.autor}</p>
                    {t.resumo && <p className="work-summary">{t.resumo}</p>}
                  </div>

                  {t.arquivo && (
                    <a
                      href={`/uploads/${t.arquivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      Ver PDF
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>

        <footer className="footer">
          Biblioteca Emerson Teixeira • Escola Joao Paulo I
        </footer>
      </div>
    </div>
  )
}
