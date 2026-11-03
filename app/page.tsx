"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Papiro } from "@/components/Papiro"
import { BiblioNews } from "@/components/BiblioNews"
import { PublicNavbar } from "@/components/PublicNavbar"
import { FiltrosCatalogo } from "@/components/FiltrosCatalogo"
import { Icone } from "@/components/Icone"
import { CLASSIFICACAO_INFO, normalizarClassificacao } from "@/lib/classificacao"

type Livro = {
  id: number | string
  isbn: string
  titulo?: string
  autor?: string
  assuntos?: string
  capa?: string
  volume?: string
  quantidadeTotal?: number
  quantidadeDisponivel?: number
  classificacaoIndicativa?: string | null
  criadoEm?: string
}

export default function Home() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [busca, setBusca] = useState("")
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])
  const [soDisponiveis, setSoDisponiveis] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toastVisivel, setToastVisivel] = useState(false)
  const [toastSaindo, setToastSaindo] = useState(false)

  useEffect(() => {
    fetch("/api/livros")
      .then((r) => r.json())
      .then((data) => { setLivros(data); setLoading(false) })
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

  const novidades = useMemo(() => {
    const limite = new Date()
    limite.setDate(limite.getDate() - 30)
    return livros.filter((l) => l.criadoEm && new Date(l.criadoEm) >= limite)
  }, [livros])

  // Mostra toast se o livro mais recente foi cadastrado há menos de 2 dias
  useEffect(() => {
    if (loading || livros.length === 0) return
    const maisRecente = livros[0] // já vem ordenado desc
    if (!maisRecente?.criadoEm) return
    const diff = Date.now() - new Date(maisRecente.criadoEm).getTime()
    const doisDiasMs = 2 * 24 * 60 * 60 * 1000
    if (diff < doisDiasMs) {
      const timer = setTimeout(() => setToastVisivel(true), 800)
      return () => clearTimeout(timer)
    }
  }, [loading, livros])

  const clearFiltros = () => {
    setSelectedGeneros([])
    setSoDisponiveis(false)
    setBusca("")
  }

  const fecharToast = () => {
    setToastSaindo(true)
    setTimeout(() => { setToastVisivel(false); setToastSaindo(false) }, 350)
  }

  const filtrados = livros.filter((l) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      l.titulo?.toLowerCase().includes(termo) ||
      l.autor?.toLowerCase().includes(termo) ||
      l.assuntos?.toLowerCase().includes(termo)
    const matchGenero =
      selectedGeneros.length === 0 ||
      selectedGeneros.some((g) => l.assuntos?.toLowerCase().includes(g.toLowerCase()))
    const matchDisponivel = !soDisponiveis || (l.quantidadeDisponivel ?? 0) > 0
    return matchBusca && matchGenero && matchDisponivel
  })

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible")
        })
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [filtrados.length, generos.length, loading])

  return (
    <>
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

          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { background: #f6f1ea; }
          a { color: inherit; }

          .home-shell { min-height: 100vh; background: #f4ede3; }

          .hero {
            background: linear-gradient(90deg, #6d1414 0%, #8b1e1e 44%, #9a2424 72%, #8f2222 100%);
            position: relative; overflow: hidden; animation: fadeInSoft 0.7s ease-out;
          }
          .hero::before {
            content: ""; position: absolute; inset: 0;
            background:
              linear-gradient(90deg, rgba(72, 10, 10, 0.24), rgba(72, 10, 10, 0.08) 36%, rgba(255,255,255,0) 72%),
              linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
            opacity: 1; pointer-events: none;
          }
          .hero::after { display: none; }
          .hero-inner {
            width: 100%; max-width: none; margin: 0; min-height: 290px;
            padding: 0 28px 0 0; position: relative; z-index: 1;
            display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 0; align-items: stretch;
          }
          .hero-copy {
            max-width: 480px; color: white; animation: fadeInSoft 0.9s ease-out;
            display: flex; flex-direction: column; justify-content: center;
            padding: 30px 0 30px 42px;
          }
          .hero-kicker {
            font-family: 'Source Sans 3', sans-serif; font-size: 0.78rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.12em;
            color: rgba(255,255,255,0.78); margin-bottom: 16px;
          }
          .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2.9rem, 5.1vw, 4.3rem);
            line-height: 1.05; font-weight: 800; margin-bottom: 12px;
            letter-spacing: -0.04em; display: flex; flex-direction: column; gap: 0;
          }
          .hero-title-line { display: block; white-space: nowrap; }
          .hero-title-highlight { color: #fff2e4; font-style: normal; text-shadow: 0 8px 22px rgba(70, 10, 10, 0.2); }
          .hero-text { font-family: 'Source Sans 3', sans-serif; font-size: 0.9rem; line-height: 1.35; color: rgba(255,255,255,0.82); max-width: 250px; }
          .hero-logo-wrap { display: flex; justify-content: center; align-items: center; animation: fadeInSoft 1s ease-out; background: transparent; padding-right: 6px; }
          .hero-logo-card { width: min(100%, 330px); aspect-ratio: 1 / 1; border-radius: 0; background: transparent; box-shadow: none; display: flex; align-items: center; justify-content: center; padding: 0; }
          .hero-logo { width: 100%; height: 100%; object-fit: contain; opacity: 0.23; filter: sepia(0.08) saturate(0.75) brightness(1.08) contrast(0.9); mix-blend-mode: screen; }

          .search-box { width: 100%; max-width: 360px; position: relative; flex-shrink: 0; }
          .search-input { width: 100%; border: none; outline: none; border-radius: 999px; padding: 14px 20px 14px 46px; font-size: 0.94rem; font-family: 'Source Sans 3', sans-serif; background: rgba(231, 221, 210, 0.96); color: #321515; box-shadow: 0 10px 30px rgba(68, 27, 27, 0.08); transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease; }
          .search-input:focus { background: rgba(242, 237, 232, 0.98); box-shadow: 0 14px 34px rgba(68, 27, 27, 0.12); transform: translateY(-1px); }
          .search-input::placeholder { color: #6d5f5f; }
          .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #7c5b5b; font-size: 0.94rem; display: flex; pointer-events: none; }

          .catalog-section { width: 100%; max-width: none; margin: 0; padding: 52px 56px 80px 42px; }
          .catalog-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
          .catalog-title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
          .catalog-accent { width: 16px; height: 42px; border-radius: 999px; background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%); box-shadow: 0 8px 18px rgba(95, 18, 18, 0.22); }
          .catalog-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 700; color: #2d1414; }
          .catalog-count { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #9c8d8d; font-weight: 700; }

          .feedback-box { text-align: center; padding: 64px 20px; color: #8f7e7e; font-family: 'Source Sans 3', sans-serif; font-weight: 700; }

          .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 28px; }
          .book-card { display: block; text-decoration: none; background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,245,0.9) 100%); border-radius: 22px; overflow: hidden; box-shadow: 0 12px 30px rgba(55, 18, 18, 0.06); border: 1px solid rgba(120, 32, 32, 0.04); transition: transform 0.28s ease, box-shadow 0.28s ease, opacity 0.35s ease; }
          .book-card:hover { transform: translateY(-8px); box-shadow: 0 18px 40px rgba(79, 20, 20, 0.12); }
          .book-cover { position: relative; aspect-ratio: 2 / 3; overflow: hidden; background: linear-gradient(180deg, rgba(122, 36, 36, 0.12), rgba(58, 18, 18, 0.18)), #ede5db; }
          .book-cover img { width: 100%; height: 100%; object-fit: cover; }
          .class-badge { position: absolute; left: 10px; top: 10px; min-width: 28px; height: 28px; padding: 0 7px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-family: 'Source Sans 3', sans-serif; font-size: 0.8rem; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }
          .book-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: #7a3434; }
          .book-status { position: absolute; right: 10px; bottom: 10px; padding: 5px 10px; border-radius: 999px; font-family: 'Source Sans 3', sans-serif; font-size: 0.72rem; font-weight: 800; backdrop-filter: blur(8px); }
          .book-status.available { background: rgba(240, 250, 244, 0.92); color: #166534; }
          .book-status.borrowed { background: rgba(253, 242, 242, 0.95); color: #8b1e1e; }
          .book-content { padding: 14px 14px 16px; border-top: 2px solid rgba(125, 29, 29, 0.32); }
          .book-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; line-height: 1.1; color: #261111; margin-bottom: 4px; min-height: 2.9rem; }
          .book-author { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #8a7474; font-weight: 700; margin-bottom: 8px; }
          .book-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .book-meta-tag { font-family: 'Source Sans 3', sans-serif; font-size: 0.74rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: rgba(139, 30, 30, 0.08); color: #8b1e1e; }

          .notice-section { width: 100%; max-width: none; margin: 0; padding: 52px 56px 80px 42px; background: linear-gradient(180deg, #fffdf9 0%, #f9f3eb 100%); }
          .notice-inner { max-width: none; margin: 0; }

          .toast-novidade {
            position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(0);
            z-index: 999; display: flex; align-items: center; gap: 14px;
            background: linear-gradient(135deg, #4a0e0e 0%, #7a1a1a 60%, #8f2222 100%);
            color: #fff7f0; border-radius: 16px; padding: 16px 20px 16px 18px;
            box-shadow: 0 20px 50px rgba(50, 10, 10, 0.32); max-width: 420px; width: calc(100vw - 48px);
            animation: toastEntrar 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          .toast-novidade.saindo { animation: toastSair 0.35s ease forwards; }
          @keyframes toastEntrar { from { opacity: 0; transform: translateX(-50%) translateY(24px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
          @keyframes toastSair { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(20px); } }
          .toast-pulse { width: 10px; height: 10px; border-radius: 50%; background: #f4c58c; flex-shrink: 0; animation: pulsar 1.8s infinite; }
          @keyframes pulsar { 0% { box-shadow: 0 0 0 0 rgba(244,197,140,0.7); } 70% { box-shadow: 0 0 0 9px rgba(244,197,140,0); } 100% { box-shadow: 0 0 0 0 rgba(244,197,140,0); } }
          .toast-body { flex: 1; min-width: 0; }
          .toast-label { font-family: 'Source Sans 3', sans-serif; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #f4c58c; margin-bottom: 2px; }
          .toast-msg { font-family: 'Source Sans 3', sans-serif; font-size: 0.96rem; font-weight: 700; color: #fff7f0; line-height: 1.3; }
          .toast-sub { font-family: 'Source Sans 3', sans-serif; font-size: 0.8rem; color: rgba(255,255,255,0.65); margin-top: 2px; }
          .toast-close { background: none; border: none; color: rgba(255,255,255,0.55); cursor: pointer; padding: 4px; line-height: 1; display: flex; flex-shrink: 0; transition: color 0.2s; }
          .toast-close:hover { color: #fff; }
          .notice-header { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 28px; flex-wrap: wrap; }
          .notice-subtitle { font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; color: #7a5e5e; max-width: 540px; }

          .about-section { background: linear-gradient(180deg, #fffdf9 0%, #f3ece2 100%); position: relative; }
          .about-header { display: flex; align-items: center; gap: 14px; padding: 52px 56px 22px 42px; }
          .about-kicker { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 700; color: #2d1414; margin-bottom: 4px; }
          .about-subtitle { font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; color: #7a5e5e; max-width: 540px; }
          .about-subtitle strong { color: #6a2a2a; }
          .about-gallery { overflow: hidden; width: 100%; position: relative; border-top: 6px solid #7d1c1c; border-bottom: 6px solid #7d1c1c; }
          .about-gallery-track { display: flex; gap: 0; width: max-content; animation: scrollGallery 28s linear infinite; }
          .about-gallery:hover .about-gallery-track { animation-play-state: paused; }
          .about-gallery-track img { width: 320px; height: 300px; object-fit: cover; display: block; flex-shrink: 0; border-radius: 0; filter: brightness(0.94); }
          @keyframes scrollGallery { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .about-inner { width: 100%; max-width: none; margin: 0; padding: 40px 56px 80px 42px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px 60px; align-items: start; }
          .about-text { font-family: 'Source Sans 3', sans-serif; font-size: 1rem; line-height: 1.8; color: #8a7a72; max-width: 480px; margin-bottom: 16px; }
          .about-text strong { color: #4a3838; font-weight: 700; }
          .about-instagram { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #6a2a2a; background: #fff; border: 1px solid rgba(139, 30, 30, 0.18); border-radius: 999px; padding: 10px 18px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.92rem; transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .about-instagram:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(101, 33, 33, 0.12); }

          .footer { min-height: 72px; padding: 18px 24px; background: #3a1212; color: rgba(255,255,255,0.88); display: flex; align-items: center; justify-content: center; font-family: 'Source Sans 3', sans-serif; text-align: center; font-size: 1rem; font-weight: 700; letter-spacing: 0.01em; border-top: 6px solid rgba(255,255,255,0.08); }

          [data-reveal] { opacity: 0; transform: translateY(10px); transition: opacity 0.45s ease, transform 0.45s ease; will-change: opacity, transform; }
          [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
          .catalog-section[data-reveal], .about-section[data-reveal] { transition-duration: 0.5s; }
          .book-card[data-reveal] { transition-duration: 0.4s; }

          @keyframes fadeInSoft {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 860px) {
            /* hero: continua com texto à esquerda e logo à direita, como no computador, só que menor */
            .hero-inner { grid-template-columns: minmax(0, 1fr) 36%; min-height: 200px; padding: 0 14px 0 0; }
            .hero-copy { max-width: none; padding: 22px 0 22px 18px; }
            .hero-kicker { font-size: 0.64rem; margin-bottom: 8px; }
            .hero-title { font-size: clamp(1.5rem, 6.4vw, 2.8rem); margin-bottom: 8px; }
            .hero-text { font-size: 0.74rem; max-width: 230px; }
            .hero-logo-wrap { min-height: 0; padding-right: 0; }
            .hero-logo-card { width: 100%; }
            .catalog-section, .notice-section { padding: 32px 18px 48px; }
            .search-box { max-width: none; }
            .about-inner { grid-template-columns: 1fr; gap: 6px; padding: 32px 18px 48px; }
            .about-header { padding: 32px 18px 16px; }
            .about-gallery-track img { width: 220px; height: 190px; }
          }

          /* celular: mais livros por linha (3 ou mais), com tudo na mesma proporção do computador */
          @media (max-width: 640px) {
            .catalog-section, .notice-section { padding: 24px 14px 40px; }
            .catalog-accent { width: 10px; height: 30px; }
            .catalog-title { font-size: 1.5rem; }
            .notice-header { gap: 10px; margin-bottom: 16px; }
            .notice-subtitle { font-size: 0.78rem; }
            .catalog-count { font-size: 0.78rem; }
            .search-input { padding: 11px 16px 11px 40px; font-size: 0.86rem; }
            .books-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
            .book-card { border-radius: 12px; box-shadow: 0 6px 16px rgba(55, 18, 18, 0.07); }
            .book-card:hover { transform: none; }
            .book-fallback { font-size: 1.4rem; }
            .class-badge { left: 5px; top: 5px; min-width: 18px; height: 18px; padding: 0 4px; font-size: 0.6rem; border-radius: 5px; }
            .book-status { right: 4px; bottom: 4px; padding: 2px 6px; font-size: 0.54rem; }
            .book-content { padding: 8px 8px 10px; }
            .book-title { font-size: 0.78rem; line-height: 1.15; min-height: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .book-author { font-size: 0.66rem; margin-bottom: 4px; }
            .book-meta { gap: 4px; margin-top: 4px; }
            .book-meta-tag { font-size: 0.58rem; padding: 2px 5px; }
          }
        `}</style>

        <div className="home-shell">
          <PublicNavbar />

          <section className="hero">
            <div className="hero-inner">
              <div className="hero-copy">
                <p className="hero-kicker">Colégio João Paulo I</p>
                <h1 className="hero-title">
                  <span className="hero-title-line">Descubra o seu</span>
                  <span className="hero-title-line">
                    próximo <span className="hero-title-highlight">LIVRO!</span>
                  </span>
                </h1>
                <p className="hero-text">
                  Explore nosso acervo virtual, consulte a disponibilidade dos livros
                  e acesse os TCCs e artigos da nossa comunidade escolar.
                </p>
              </div>
              <div className="hero-logo-wrap">
                <div className="hero-logo-card">
                  <img src="/logo-jpi.png" alt="Logo da Biblioteca Escolar Emerson Teixeira" className="hero-logo" />
                </div>
              </div>
            </div>
          </section>

          <section id="catalogo" className="catalog-section" data-reveal>
            <div className="catalog-header">
              <div className="catalog-title-row">
                <div className="catalog-accent" />
                <h2 className="catalog-title">Catálogo Completo</h2>
                <span className="catalog-count">
                  {loading ? "carregando..." : `${filtrados.length} livros`}
                </span>
              </div>
              <div className="search-box">
                <span className="search-icon"><Icone nome="busca" tamanho="1.15em" /></span>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Digite aqui o livro que procura!"
                  className="search-input"
                />
              </div>
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
                {busca || selectedGeneros.length > 0 || soDisponiveis ? "Nenhum livro encontrado para esse filtro." : "Nenhum livro cadastrado ainda."}
              </div>
            )}

            <div className="books-grid">
              {filtrados.slice(0, 12).map((livro) => {
                const disponivel = (livro.quantidadeDisponivel ?? 0) > 0
                return (
                  <Link key={livro.id} href={`/livro/${livro.isbn}`} className="book-card" data-reveal>
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

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/catalogo" style={{ background: "#8b1e1e", color: "white", textDecoration: "none", borderRadius: 8, padding: "12px 32px", fontSize: 15, fontWeight: 600, display: "inline-block" }}>
                Ver catálogo completo ({livros.length} {livros.length === 1 ? "livro" : "livros"})
              </Link>
            </div>
          </section>

          <section id="biblionews" className="notice-section" data-reveal>
            <div className="notice-inner">
              <BiblioNews />
            </div>
          </section>

          <section id="sobre" className="about-section" data-reveal>
            <div className="about-header">
              <div className="catalog-accent" />
              <div>
                <h2 className="about-kicker">Saiba mais!</h2>
                <p className="about-subtitle">Um espaço para <strong>leitura</strong>, <strong>estudo</strong> e <strong>pesquisa</strong></p>
              </div>
            </div>

            <div className="about-gallery" data-reveal>
              <div className="about-gallery-track">
                <img src="/biblioteca-estantes.jpg" alt="Estantes com o acervo da biblioteca" />
                <img src="/biblioteca-mesas-estudo.jpg" alt="Mesas de estudo entre as estantes" />
                <img src="/biblioteca-cantinho-infantil.jpg" alt="Cantinho de leitura infantil" />
                <img src="/biblioteca-mural-historias.jpg" alt="Mural de histórias da comunidade escolar" />
                <img src="/biblioteca-estantes.jpg" alt="" aria-hidden="true" />
                <img src="/biblioteca-mesas-estudo.jpg" alt="" aria-hidden="true" />
                <img src="/biblioteca-cantinho-infantil.jpg" alt="" aria-hidden="true" />
                <img src="/biblioteca-mural-historias.jpg" alt="" aria-hidden="true" />
              </div>
            </div>

            <div className="about-inner">
              <div>
                <p className="about-text">
                  A Biblioteca Escolar Emerson Teixeira foi pensada como um ambiente <strong>acolhedor</strong> para
                  os alunos do <strong>Colégio João Paulo I</strong>.
                </p>
                <p className="about-text">
                  O site segue a mesma ideia: <strong>Consulta simples</strong>, <strong>visual organizado</strong> e{" "}
                  <strong>destaque</strong> para o acervo.
                </p>
              </div>
              <div>
                <p className="about-text">
                  A biblioteca funciona de <strong>segunda a sexta</strong>, das <strong>8h</strong> às{" "}
                  <strong>17h</strong>, com hora do estudo às <strong>14h</strong>!
                </p>
                <a
                  href="https://www.instagram.com/colegiojpibiblioteca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  @colegiojpibiblioteca
                </a>
              </div>
            </div>
          </section>

          <footer className="footer">
            Biblioteca Escolar Emerson Teixeira • Escola João Paulo I
          </footer>
        </div>
      </div>

      {/* Toast de novidades */}
      {toastVisivel && (
        <div className={`toast-novidade${toastSaindo ? " saindo" : ""}`}>
          <div className="toast-pulse" />
          <div className="toast-body">
            <div className="toast-label">Novidades</div>
            <div className="toast-msg">Novos livros chegaram ao acervo!</div>
            <div className="toast-sub">Confira os títulos mais recentes</div>
          </div>
          <button className="toast-close" onClick={fecharToast} aria-label="Fechar"><Icone nome="x" tamanho={18} /></button>
        </div>
      )}

      {/* Papiro fora de tudo — position:fixed funciona corretamente aqui */}
      <Papiro acervo={livros} />
    </>
  )
}