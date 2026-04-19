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

export default function Catalogo() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [busca, setBusca] = useState("")
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
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

  const toggleGenero = (g: string) => {
    setSelectedGeneros((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    )
  }

  const clearFiltros = () => {
    setSelectedGeneros([])
    setBusca("")
  }

  const filtrados = livros.filter((l) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      l.titulo?.toLowerCase().includes(termo) ||
      l.autor?.toLowerCase().includes(termo) ||
      l.assuntos?.toLowerCase().includes(termo)
    const matchGenero =
      selectedGeneros.length === 0 ||
      selectedGeneros.some((g) =>
        l.assuntos?.toLowerCase().includes(g.toLowerCase())
      )
    return matchBusca && matchGenero
  })

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Sans+3:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f5ede4;
          font-family: 'Source Sans 3', sans-serif;
        }

        .page-wrap {
          min-height: 100vh;
          background: #f5ede4;
        }

        .topbar {
          background: linear-gradient(135deg, #5f1212 0%, #8b2020 60%, #a02828 100%);
          width: 100%;
          padding: 14px 42px;
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

        .brand span { color: #f4c58c; }

        .back-link {
          text-decoration: none;
          color: #fff2ea;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.98rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          transition: transform 0.25s ease, background 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .back-link:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.2);
        }

        .catalog-section {
          width: 100%;
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

        .search-wrap {
          margin-bottom: 28px;
          max-width: 520px;
          position: relative;
        }

        .search-input {
          width: 100%;
          border: none;
          outline: none;
          border-radius: 999px;
          padding: 14px 24px 14px 48px;
          font-size: 0.98rem;
          font-family: 'Source Sans 3', sans-serif;
          background: rgba(231, 221, 210, 0.96);
          color: #321515;
          box-shadow: 0 10px 30px rgba(68, 27, 27, 0.08);
          transition: box-shadow 0.25s ease, background 0.25s ease;
        }

        .search-input:focus {
          background: rgba(242, 237, 232, 0.98);
          box-shadow: 0 14px 34px rgba(68, 27, 27, 0.12);
        }

        .search-input::placeholder { color: #6d5f5f; }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #7c5b5b;
          font-size: 1rem;
        }

        .filters-panel {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(140, 92, 92, 0.16);
          border-radius: 18px;
          padding: 14px 18px 14px;
          margin-bottom: 24px;
          box-shadow: 0 10px 22px rgba(102, 47, 47, 0.05);
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .filters-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: #3b1616;
          margin-bottom: 6px;
        }

        .filters-note {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.9rem;
          color: #6f5e5e;
          line-height: 1.4;
        }

        .selected-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .filter-chip {
          border: none;
          cursor: pointer;
          background: #f4e6df;
          color: #6a2a2a;
          border-radius: 999px;
          padding: 8px 12px;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .filter-chip:hover {
          transform: translateY(-1px);
          background: #e9d2c8;
        }

        .filter-clear {
          border: none;
          cursor: pointer;
          color: #8b1e1e;
          background: rgba(255, 230, 226, 0.95);
          padding: 10px 16px;
          border-radius: 999px;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 700;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .filter-clear:hover {
          transform: translateY(-1px);
          background: rgba(255, 215, 208, 0.96);
        }

        .filters-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .filters-toggle {
          border: 1px solid rgba(139, 30, 30, 0.18);
          background: white;
          color: #6a2a2a;
          border-radius: 999px;
          padding: 10px 18px;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .filters-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(101, 33, 33, 0.09);
        }

        .filters-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.28s ease;
        }

        .filters-body.open {
          max-height: 220px;
        }

        .filter-box {
          background: #fffdfa;
          border: 1px solid rgba(139, 30, 30, 0.12);
          border-radius: 18px;
          padding: 14px 14px 12px;
          box-shadow: 0 10px 18px rgba(111, 40, 40, 0.05);
        }

        .filter-box-title {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.98rem;
          font-weight: 700;
          color: #3c1818;
          margin-bottom: 12px;
        }

        .filters-empty {
          font-family: 'Source Sans 3', sans-serif;
          color: #8c7474;
          font-size: 0.94rem;
          padding: 14px 0;
        }

        .genre-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 0;
          max-height: 140px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .genre-row::-webkit-scrollbar {
          width: 8px;
        }

        .genre-row::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 30, 0.22);
          border-radius: 999px;
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

        .genre-button:hover { transform: translateY(-2px); }

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
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(79, 20, 20, 0.12);
        }

        .book-cover {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(122, 36, 36, 0.12), rgba(58, 18, 18, 0.18)), #ede5db;
        }

        .book-cover img { width: 100%; height: 100%; object-fit: cover; }

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

        .book-status.available { background: rgba(240, 250, 244, 0.92); color: #166534; }
        .book-status.borrowed  { background: rgba(253, 242, 242, 0.95); color: #8b1e1e; }

        .book-content { padding: 14px 14px 16px; }

        .book-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #2d1414;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-author {
          font-size: 0.82rem;
          color: #7a5c5c;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .book-meta { display: flex; flex-wrap: wrap; gap: 6px; }

        .book-meta-tag {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(139, 30, 30, 0.07);
          color: #8b1e1e;
          padding: 3px 8px;
          border-radius: 999px;
        }

        @media (max-width: 640px) {
          .topbar { padding: 14px 20px; }
          .catalog-section { padding: 32px 20px 60px; }
          .books-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
        }
      `}</style>

      <div className="page-wrap">
        <header className="topbar">
          <Link href="/" className="brand">
            Biblio<span>teca</span>
          </Link>
          <Link href="/" className="back-link">
            ← Voltar ao início
          </Link>
        </header>

        <section className="catalog-section">
          <div className="catalog-header">
            <div className="catalog-title-row">
              <div className="catalog-accent" />
              <h2 className="catalog-title">Catálogo Completo</h2>
              <span className="catalog-count">
                {loading ? "carregando..." : `${filtrados.length} livros`}
              </span>
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, autor ou assunto..."
            />
          </div>

          <div className="filters-panel">
            <div className="filters-header">
              <div>
                <div className="filters-title">Filtros</div>
                <div className="filters-note">
                  Selecione assuntos para refinar a busca ou limpe os filtros.
                </div>
              </div>
              <div className="filters-actions">
                <button
                  type="button"
                  className="filters-toggle"
                  onClick={() => setFiltrosAbertos((prev) => !prev)}
                >
                  {filtrosAbertos ? "Ocultar filtros" : "Mostrar filtros"}
                </button>
                {(selectedGeneros.length > 0 || busca) && (
                  <button type="button" onClick={clearFiltros} className="filter-clear">
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {selectedGeneros.length > 0 && (
              <div className="selected-filters">
                {selectedGeneros.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGeneros((prev) => prev.filter((item) => item !== g))}
                    className="filter-chip"
                  >
                    {g} ×
                  </button>
                ))}
              </div>
            )}

            <div className={`filters-body ${filtrosAbertos ? "open" : ""}`}>
              <div className="filter-box">
                <div className="filter-box-title">Assuntos disponíveis</div>
                {generos.length > 0 ? (
                  <div className="genre-row">
                    {generos.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenero(g)}
                        className={`genre-button ${selectedGeneros.includes(g) ? "active" : "inactive"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="filters-empty">Nenhum assunto encontrado.</div>
                )}
              </div>
            </div>
          </div>

          {loading && <div className="feedback-box">Carregando acervo...</div>}

          {!loading && filtrados.length === 0 && (
            <div className="feedback-box">
              {busca || selectedGeneros.length > 0
                ? "Nenhum livro encontrado para esse filtro."
                : "Nenhum livro cadastrado ainda."}
            </div>
          )}

          <div className="books-grid">
            {filtrados.map((livro) => (
              <Link key={livro.id} href={`/livro/${livro.isbn}`} className="book-card">
                <div className="book-cover">
                  {livro.capa ? (
                    <img src={livro.capa} alt={livro.titulo || "Capa do livro"} />
                  ) : (
                    <div className="book-fallback">📚</div>
                  )}
                  <div className={`book-status ${livro.status === "disponivel" ? "available" : "borrowed"}`}>
                    {livro.status === "disponivel" ? "Disponivel" : "Emprestado"}
                  </div>
                </div>
                <div className="book-content">
                  <h3 className="book-title">{livro.titulo}</h3>
                  <p className="book-author">{livro.autor}</p>
                  <div className="book-meta">
                    {livro.volume && <span className="book-meta-tag">Vol. {livro.volume}</span>}
                    {livro.quantidadeTotal && livro.quantidadeTotal > 1 && (
                      <span className="book-meta-tag">{livro.quantidadeTotal} cópias</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
