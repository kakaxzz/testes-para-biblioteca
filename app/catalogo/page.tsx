"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CLASSIFICACAO_INFO, normalizarClassificacao } from "@/lib/classificacao"
import { PublicNavbar } from "@/components/PublicNavbar"
import { FiltrosCatalogo } from "@/components/FiltrosCatalogo"
import { Icone } from "@/components/Icone"

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
  quantidadeDisponivel?: number
  classificacaoIndicativa?: string | null
}

export default function Catalogo() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [busca, setBusca] = useState("")
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])
  const [soDisponiveis, setSoDisponiveis] = useState(false)
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

  const clearFiltros = () => {
    setSelectedGeneros([])
    setSoDisponiveis(false)
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
    const matchDisponivel = !soDisponiveis || (l.quantidadeDisponivel ?? 0) > 0
    return matchBusca && matchGenero && matchDisponivel
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
          display: flex;
          pointer-events: none;
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
        .class-badge { position: absolute; left: 10px; top: 10px; min-width: 28px; height: 28px; padding: 0 7px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-family: 'Source Sans 3', sans-serif; font-size: 0.8rem; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }

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
          .catalog-section { padding: 24px 14px 40px; }
          .catalog-accent { width: 10px; height: 30px; }
          .catalog-title { font-size: 1.5rem; }
          .catalog-count { font-size: 0.78rem; }
          .search-wrap { margin-bottom: 16px; }
          .search-input { padding: 11px 16px 11px 40px; font-size: 0.86rem; }
          .search-icon { left: 14px; font-size: 0.86rem; }
          /* mais livros por linha (3 ou mais), como no computador */
          .books-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
          .book-card { border-radius: 12px; box-shadow: 0 6px 16px rgba(55, 18, 18, 0.07); }
          .book-card:hover { transform: none; }
          .book-fallback { font-size: 1.4rem; }
          .class-badge { left: 5px; top: 5px; min-width: 18px; height: 18px; padding: 0 4px; font-size: 0.6rem; border-radius: 5px; }
          .book-status { right: 4px; bottom: 4px; padding: 2px 6px; font-size: 0.54rem; }
          .book-content { padding: 8px 8px 10px; }
          .book-title { font-size: 0.78rem; line-height: 1.15; }
          .book-author { font-size: 0.66rem; margin-bottom: 4px; }
          .book-meta { gap: 4px; }
          .book-meta-tag { font-size: 0.58rem; padding: 2px 5px; }
        }
      `}</style>

      <div className="page-wrap">
        <PublicNavbar />

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
            <span className="search-icon"><Icone nome="busca" tamanho="1.15em" /></span>
            <input
              className="search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, autor ou assunto..."
            />
          </div>

          <FiltrosCatalogo
            generos={generos}
            selectedGeneros={selectedGeneros}
            onChangeGeneros={setSelectedGeneros}
            soDisponiveis={soDisponiveis}
            onChangeSoDisponiveis={setSoDisponiveis}
            temFiltroAtivo={selectedGeneros.length > 0 || !!busca || soDisponiveis}
            onLimpar={clearFiltros}
          />

          {loading && <div className="feedback-box">Carregando acervo...</div>}

          {!loading && filtrados.length === 0 && (
            <div className="feedback-box">
              {busca || selectedGeneros.length > 0 || soDisponiveis
                ? "Nenhum livro encontrado para esse filtro."
                : "Nenhum livro cadastrado ainda."}
            </div>
          )}

          <div className="books-grid">
            {filtrados.map((livro) => {
              const disponivel = (livro.quantidadeDisponivel ?? 0) > 0
              return (
                <Link key={livro.id} href={`/livro/${livro.isbn}`} className="book-card">
                  <div className="book-cover">
                    {livro.capa ? (
                      <img src={livro.capa} alt={livro.titulo || "Capa do livro"} />
                    ) : (
                      <div className="book-fallback"><Icone nome="livros" tamanho="1em" /></div>
                    )}
                    {normalizarClassificacao(livro.classificacaoIndicativa) && (
                      <div
                        className="class-badge"
                        title={CLASSIFICACAO_INFO[normalizarClassificacao(livro.classificacaoIndicativa)!].descricao}
                        style={{
                          color: CLASSIFICACAO_INFO[normalizarClassificacao(livro.classificacaoIndicativa)!].cor,
                          background: CLASSIFICACAO_INFO[normalizarClassificacao(livro.classificacaoIndicativa)!].fundo,
                        }}
                      >
                        {CLASSIFICACAO_INFO[normalizarClassificacao(livro.classificacaoIndicativa)!].rotulo}
                      </div>
                    )}
                    <div className={`book-status ${disponivel ? "available" : "borrowed"}`}>
                      {disponivel ? "Disponível" : "Emprestado"}
                    </div>
                  </div>
                  <div className="book-content">
                    <h3 className="book-title">{livro.titulo}</h3>
                    <p className="book-author">{livro.autor}</p>
                    <div className="book-meta">
                      {livro.volume && <span className="book-meta-tag">Vol. {livro.volume}</span>}
                      {livro.quantidadeTotal && livro.quantidadeTotal > 1 && (
                        <span className="book-meta-tag">{livro.quantidadeDisponivel}/{livro.quantidadeTotal} disponíveis</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
