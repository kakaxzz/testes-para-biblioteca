"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type Livro = {
  id: number | string
  isbn: string
  titulo?: string
  autor?: string
  assuntos?: string
  capa?: string
  status?: string
  volume?: string
  quantidadeTotal?: number
}

export default function Home() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [busca, setBusca] = useState("")
  const [genero, setGenero] = useState("todos")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/livros")
      .then((r) => r.json())
      .then((data) => {
        setLivros(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const generos = useMemo(() => {
    const set = new Set<string>()

    livros.forEach((l) => {
      if (l.assuntos) {
        l.assuntos.split(",").forEach((a: string) => {
          const g = a.trim()
          if (g) set.add(g)
        })
      }
    })

    return Array.from(set).sort()
  }, [livros])

  const filtrados = livros.filter((l) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      l.titulo?.toLowerCase().includes(termo) ||
      l.autor?.toLowerCase().includes(termo) ||
      l.assuntos?.toLowerCase().includes(termo)

    const matchGenero =
      genero === "todos" || l.assuntos?.toLowerCase().includes(genero.toLowerCase())

    return matchBusca && matchGenero
  })

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
          }
        })
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [filtrados.length, generos.length, loading])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f1ea",
        color: "#241616",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #f6f1ea;
        }

        a {
          color: inherit;
        }

        .home-shell {
          min-height: 100vh;
          background: #f4ede3;
        }

        .topbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 100;
          background: rgba(120, 26, 26, 0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 26px rgba(36, 10, 10, 0.12);
        }

        .topbar-inner {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 14px 38px 14px 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          font-family: 'Playfair Display', serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #fff7f0;
          text-decoration: none;
          letter-spacing: 0.01em;
        }

        .brand span {
          color: #f4c58c;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nav-link {
          text-decoration: none;
          color: #fff2ea;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.98rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          transition: transform 0.25s ease, background 0.25s ease, opacity 0.25s ease;
        }

        .nav-link:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.2);
        }

        .hero {
          margin-top: 76px;
          background:
            linear-gradient(90deg, #6d1414 0%, #8b1e1e 44%, #9a2424 72%, #8f2222 100%);
          position: relative;
          overflow: hidden;
          animation: fadeInSoft 0.7s ease-out;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(72, 10, 10, 0.24), rgba(72, 10, 10, 0.08) 36%, rgba(255,255,255,0) 72%),
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
          opacity: 1;
          pointer-events: none;
        }

        .hero::after {
          display: none;
        }

        .hero-inner {
          width: 100%;
          max-width: none;
          margin: 0;
          min-height: 290px;
          padding: 0 28px 0 0;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 0;
          align-items: stretch;
        }

        .hero-copy {
          max-width: 480px;
          color: white;
          animation: fadeInSoft 0.9s ease-out;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 30px 0 30px 42px;
        }

        .hero-kicker {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.78);
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.9rem, 5.1vw, 4.3rem);
          line-height: 1.05;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.04em;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .hero-title-line {
          display: block;
          white-space: nowrap;
        }

        .hero-title-highlight {
          color: #fff2e4;
          font-style: normal;
          text-shadow: 0 8px 22px rgba(70, 10, 10, 0.2);
        }

        .hero-text {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.9rem;
          line-height: 1.35;
          color: rgba(255,255,255,0.82);
          max-width: 250px;
        }

        .hero-logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeInSoft 1s ease-out;
          background: transparent;
          padding-right: 6px;
        }

        .hero-logo-card {
          width: min(100%, 330px);
          aspect-ratio: 1 / 1;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .hero-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.23;
          filter: sepia(0.08) saturate(0.75) brightness(1.08) contrast(0.9);
          mix-blend-mode: screen;
        }

        .search-shell {
          width: 100%;
          max-width: none;
          margin: -24px 0 0;
          padding: 0 56px 0 42px;
          position: relative;
          z-index: 5;
        }

        .search-box {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
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

        .search-input::placeholder {
          color: #6d5f5f;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #7c5b5b;
          font-size: 1rem;
        }

        .catalog-section {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 52px 56px 86px 42px;
        }

        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .catalog-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .catalog-accent {
          width: 16px;
          height: 42px;
          border-radius: 999px;
          background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%);
          box-shadow: 0 8px 18px rgba(95, 18, 18, 0.22);
        }

        .catalog-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3vw, 2.5rem);
          font-weight: 700;
          color: #2d1414;
        }

        .catalog-count {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.92rem;
          color: #9c8d8d;
          font-weight: 700;
        }

        .genre-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }

        .genre-button {
          border: none;
          cursor: pointer;
          padding: 10px 18px;
          border-radius: 999px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.92rem;
          font-weight: 800;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, color 0.22s ease;
        }

        .genre-button.active {
          background: linear-gradient(180deg, #8d2525 0%, #6a1717 100%);
          color: white;
          box-shadow: 0 10px 22px rgba(122, 24, 24, 0.16);
        }

        .genre-button.inactive {
          background: rgba(255,255,255,0.72);
          color: #6a2a2a;
          box-shadow: 0 6px 18px rgba(88, 33, 33, 0.05);
        }

        .genre-button:hover {
          transform: translateY(-2px);
        }

        .feedback-box {
          text-align: center;
          padding: 64px 20px;
          color: #8f7e7e;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 700;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 28px;
        }

        .book-card {
          display: block;
          text-decoration: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,245,0.9) 100%);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(55, 18, 18, 0.06);
          border: 1px solid rgba(120, 32, 32, 0.04);
          transition: transform 0.28s ease, box-shadow 0.28s ease, opacity 0.35s ease;
        }

        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(79, 20, 20, 0.12);
        }

        .book-cover {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(122, 36, 36, 0.12), rgba(58, 18, 18, 0.18)),
            #ede5db;
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .book-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #7a3434;
        }

        .book-status {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          backdrop-filter: blur(8px);
        }

        .book-status.available {
          background: rgba(240, 250, 244, 0.92);
          color: #166534;
        }

        .book-status.borrowed {
          background: rgba(253, 242, 242, 0.95);
          color: #8b1e1e;
        }

        .book-content {
          padding: 14px 14px 16px;
          border-top: 2px solid rgba(125, 29, 29, 0.32);
        }

        .book-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          line-height: 1.1;
          color: #261111;
          margin-bottom: 4px;
          min-height: 2.9rem;
        }

        .book-author {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.92rem;
          color: #8a7474;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .book-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .book-meta-tag {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(139, 30, 30, 0.08);
          color: #8b1e1e;
        }

        .about-section {
          background: linear-gradient(180deg, #fffdf9 0%, #f3ece2 100%);
          position: relative;
        }

        .about-inner {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 68px 56px 68px 42px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
          gap: 32px;
          align-items: center;
        }

        .about-title {
          font-family: 'Lora', serif;
          font-size: clamp(2.2rem, 3.2vw, 3rem);
          color: #6c1a1a;
          margin-bottom: 12px;
        }

        .about-text {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1rem;
          line-height: 1.85;
          color: #554545;
          max-width: 560px;
          margin-bottom: 18px;
        }

        .about-list {
          list-style: none;
          display: grid;
          gap: 10px;
          font-family: 'Source Sans 3', sans-serif;
          color: #5b4747;
          font-weight: 700;
        }

        .about-card {
          background: linear-gradient(180deg, #7d1c1c 0%, #5b1313 100%);
          border-radius: 24px;
          min-height: 220px;
          padding: 28px;
          color: #fff7ef;
          box-shadow: 0 20px 40px rgba(77, 19, 19, 0.14);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .about-card-title {
          font-family: 'Lora', serif;
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .about-card-text {
          font-family: 'Source Sans 3', sans-serif;
          line-height: 1.7;
          color: rgba(255,255,255,0.82);
        }

        .footer {
          min-height: 72px;
          padding: 18px 24px;
          background: #3a1212;
          color: rgba(255,255,255,0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Source Sans 3', sans-serif;
          text-align: center;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-top: 6px solid rgba(255,255,255,0.08);
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s ease;
          will-change: opacity, transform;
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .search-shell[data-reveal] {
          transition-duration: 0.4s;
        }

        .catalog-section[data-reveal],
        .about-section[data-reveal] {
          transition-duration: 0.5s;
        }

        .book-card[data-reveal] {
          transition-duration: 0.4s;
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

        @media (max-width: 860px) {
          .topbar-inner {
            padding: 14px 18px;
          }

          .hero-inner {
            grid-template-columns: 1fr;
            min-height: auto;
            padding: 0;
          }

          .hero-copy {
            max-width: none;
            padding: 28px 18px 12px;
          }

          .hero-logo-card {
            width: min(100%, 300px);
          }

          .hero-logo-wrap {
            min-height: 210px;
          }

          .search-shell,
          .catalog-section,
          .about-inner {
            padding-left: 18px;
            padding-right: 18px;
          }

          .search-box {
            margin: 0;
          }

          .about-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="home-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              Biblioteca <span>Emerson Teixeira</span>
            </div>

            <nav className="nav-links">
              <a href="#catalogo" className="nav-link">Catalogo</a>
              <Link href="/tcc" className="nav-link">TCC</Link>
              <a href="#sobre" className="nav-link">Sobre</a>
              <Link href="/admin/login" className="nav-link">Admin</Link>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker">Escola Joao Paulo I</p>
              <h1 className="hero-title">
                <span className="hero-title-line">Descubra seu</span>
                <span className="hero-title-line">
                  proximo <span className="hero-title-highlight">LIVRO</span>
                </span>
              </h1>
              <p className="hero-text">
                Explore nosso acervo virtual, consulte a disponibilidade dos livros
                e acesse os TCCs e artigos da nossa comunidade escolar.
              </p>
            </div>

            <div className="hero-logo-wrap">
              <div className="hero-logo-card">
                <img
                  src="/logo-jpi.png"
                  alt="Logo da Biblioteca Emerson Teixeira"
                  className="hero-logo"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="search-shell" data-reveal>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite aqui o livro que procura!"
              className="search-input"
            />
          </div>
        </section>

        <section id="catalogo" className="catalog-section" data-reveal>
          <div className="catalog-header">
            <div className="catalog-title-row">
              <div className="catalog-accent" />
              <h2 className="catalog-title">Catalogo Completo</h2>
              <span className="catalog-count">
                {loading ? "carregando..." : `${filtrados.length} livros`}
              </span>
            </div>
          </div>

          {generos.length > 0 && (
            <div className="genre-row">
              <button
                onClick={() => setGenero("todos")}
                className={`genre-button ${genero === "todos" ? "active" : "inactive"}`}
              >
                Todos
              </button>

              {generos.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenero(g === genero ? "todos" : g)}
                  className={`genre-button ${genero === g ? "active" : "inactive"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="feedback-box">Carregando acervo...</div>}

          {!loading && filtrados.length === 0 && (
            <div className="feedback-box">
              {busca || genero !== "todos"
                ? "Nenhum livro encontrado para esse filtro."
                : "Nenhum livro cadastrado ainda."}
            </div>
          )}

          <div className="books-grid">
            {filtrados.map((livro) => (
              <Link key={livro.id} href={`/livro/${livro.isbn}`} className="book-card" data-reveal>
                <div className="book-cover">
                  {livro.capa ? (
                    <img src={livro.capa} alt={livro.titulo || "Capa do livro"} />
                  ) : (
                    <div className="book-fallback">📚</div>
                  )}

                  <div
                    className={`book-status ${
                      livro.status === "disponivel" ? "available" : "borrowed"
                    }`}
                  >
                    {livro.status === "disponivel" ? "Disponivel" : "Emprestado"}
                  </div>
                </div>

                <div className="book-content">
                  <h3 className="book-title">{livro.titulo}</h3>
                  <p className="book-author">{livro.autor}</p>
                  <div className="book-meta">
                    {livro.volume && (
                      <span className="book-meta-tag">Vol. {livro.volume}</span>
                    )}
                    {livro.quantidadeTotal && livro.quantidadeTotal > 1 && (
                      <span className="book-meta-tag">{livro.quantidadeTotal} cópias</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="sobre" className="about-section" data-reveal>
          <div className="about-inner">
            <div>
              <h2 className="about-title">Um espaco para leitura, estudo e pesquisa</h2>
              <p className="about-text">
                A Biblioteca Emerson Teixeira foi pensada como um ambiente acolhedor
                para os alunos da Escola Joao Paulo I. O site segue a mesma ideia:
                consulta simples, visual organizado e destaque para o acervo.
              </p>

              <ul className="about-list">
                <li>Horario de atendimento de segunda a sexta</li>
                <li>Consulta rapida ao acervo por busca e genero</li>
                <li>Espaco dedicado para TCCs, artigos e producoes escolares</li>
              </ul>
            </div>

            <div className="about-card">
              <div className="about-card-title">Biblioteca Escolar</div>
              <p className="about-card-text">
                Organizacao visual inspirada em acervo fisico, com tons quentes,
                leitura confortavel e foco nos livros cadastrados.
              </p>
            </div>
          </div>
        </section>

        <footer className="footer">
          Biblioteca Emerson Teixeira • Escola Joao Paulo I
        </footer>
      </div>
    </div>
  )
}
