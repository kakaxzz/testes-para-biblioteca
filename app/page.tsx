"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Papiro } from "@/components/Papiro"

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
  criadoEm?: string
}

type Notice = {
  id: number
  titulo: string
  mensagem: string
  tag: string
}

export default function Home() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [busca, setBusca] = useState("")
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toastVisivel, setToastVisivel] = useState(false)
  const [toastSaindo, setToastSaindo] = useState(false)

  useEffect(() => {
    fetch("/api/livros")
      .then((r) => r.json())
      .then((data) => { setLivros(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch("/api/biblionews")
      .then((r) => r.json())
      .then((data) => setNotices(data))
      .catch(() => setNotices([]))
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
    return matchBusca && matchGenero
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

          .topbar {
            position: fixed; top: 0; width: 100%; z-index: 100;
            background: rgba(120, 26, 26, 0.96); backdrop-filter: blur(12px);
            box-shadow: 0 8px 26px rgba(36, 10, 10, 0.12);
          }
          .topbar-inner {
            width: 100%; max-width: none; margin: 0;
            padding: 14px 38px 14px 42px;
            display: flex; align-items: center; justify-content: space-between; gap: 20px;
          }
          .brand {
            font-family: 'Playfair Display', serif; font-size: 1.65rem; font-weight: 700;
            color: #fff7f0; text-decoration: none; letter-spacing: 0.01em;
          }
          .brand span { color: #f4c58c; }
          .nav-links { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
          .nav-link {
            text-decoration: none; color: #fff2ea;
            font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; font-weight: 700;
            padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.1);
            transition: transform 0.25s ease, background 0.25s ease, opacity 0.25s ease;
          }
          .nav-link:hover { transform: translateY(-1px); background: rgba(255,255,255,0.2); }

          .hero {
            margin-top: 76px;
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

          .search-shell { width: 100%; max-width: none; margin: -24px 0 0; padding: 0 56px 0 42px; position: relative; z-index: 5; }
          .search-box { max-width: 680px; margin: 0 auto; position: relative; }
          .search-input { width: 100%; border: none; outline: none; border-radius: 999px; padding: 18px 24px 18px 52px; font-size: 0.98rem; font-family: 'Source Sans 3', sans-serif; background: rgba(231, 221, 210, 0.96); color: #321515; box-shadow: 0 10px 30px rgba(68, 27, 27, 0.08); transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease; }
          .search-input:focus { background: rgba(242, 237, 232, 0.98); box-shadow: 0 14px 34px rgba(68, 27, 27, 0.12); transform: translateY(-1px); }
          .search-input::placeholder { color: #6d5f5f; }
          .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #7c5b5b; font-size: 1rem; }

          .catalog-section { width: 100%; max-width: none; margin: 0; padding: 52px 56px 86px 42px; }
          .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
          .catalog-title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
          .catalog-accent { width: 16px; height: 42px; border-radius: 999px; background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%); box-shadow: 0 8px 18px rgba(95, 18, 18, 0.22); }
          .catalog-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 700; color: #2d1414; }
          .catalog-count { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #9c8d8d; font-weight: 700; }

          .filters-panel { background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(140, 92, 92, 0.16); border-radius: 18px; padding: 14px 18px 14px; margin-bottom: 24px; box-shadow: 0 10px 22px rgba(102, 47, 47, 0.05); }
          .filters-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
          .filters-title { font-family: 'Source Sans 3', sans-serif; font-size: 1rem; font-weight: 800; color: #3b1616; margin-bottom: 6px; }
          .filters-note { font-family: 'Source Sans 3', sans-serif; font-size: 0.9rem; color: #6f5e5e; line-height: 1.4; }
          .selected-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
          .filter-chip { border: none; cursor: pointer; background: #f4e6df; color: #6a2a2a; border-radius: 999px; padding: 8px 12px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.88rem; transition: transform 0.18s ease, background 0.18s ease; }
          .filter-chip:hover { transform: translateY(-1px); background: #e9d2c8; }
          .filter-clear { border: none; cursor: pointer; color: #8b1e1e; background: rgba(255, 230, 226, 0.95); padding: 10px 16px; border-radius: 999px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; transition: transform 0.18s ease, background 0.18s ease; }
          .filter-clear:hover { transform: translateY(-1px); background: rgba(255, 215, 208, 0.96); }
          .filters-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
          .filters-toggle { border: 1px solid rgba(139, 30, 30, 0.18); background: white; color: #6a2a2a; border-radius: 999px; padding: 10px 18px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; }
          .filters-toggle:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(101, 33, 33, 0.09); }
          .filters-body { max-height: 0; overflow: hidden; transition: max-height 0.28s ease; }
          .filters-body.open { max-height: 220px; }
          .filter-box { background: #fffdfa; border: 1px solid rgba(139, 30, 30, 0.12); border-radius: 18px; padding: 14px 14px 12px; box-shadow: 0 10px 18px rgba(111, 40, 40, 0.05); }
          .filter-box-title { font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; font-weight: 700; color: #3c1818; margin-bottom: 12px; }
          .filters-empty { font-family: 'Source Sans 3', sans-serif; color: #8c7474; font-size: 0.94rem; padding: 14px 0; }
          .category-select { width: 100%; border: 1px solid rgba(139, 30, 30, 0.22); border-radius: 12px; padding: 12px 16px; font-size: 0.96rem; font-family: 'Source Sans 3', sans-serif; font-weight: 600; color: #3c1818; background: #fffaf7; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236a1717' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
          .category-select:focus { border-color: rgba(139, 30, 30, 0.5); box-shadow: 0 0 0 3px rgba(139, 30, 30, 0.08); }

          .feedback-box { text-align: center; padding: 64px 20px; color: #8f7e7e; font-family: 'Source Sans 3', sans-serif; font-weight: 700; }

          .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 28px; }
          .book-card { display: block; text-decoration: none; background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,245,0.9) 100%); border-radius: 22px; overflow: hidden; box-shadow: 0 12px 30px rgba(55, 18, 18, 0.06); border: 1px solid rgba(120, 32, 32, 0.04); transition: transform 0.28s ease, box-shadow 0.28s ease, opacity 0.35s ease; }
          .book-card:hover { transform: translateY(-8px); box-shadow: 0 18px 40px rgba(79, 20, 20, 0.12); }
          .book-cover { position: relative; aspect-ratio: 2 / 3; overflow: hidden; background: linear-gradient(180deg, rgba(122, 36, 36, 0.12), rgba(58, 18, 18, 0.18)), #ede5db; }
          .book-cover img { width: 100%; height: 100%; object-fit: cover; }
          .book-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: #7a3434; }
          .book-status { position: absolute; right: 10px; bottom: 10px; padding: 5px 10px; border-radius: 999px; font-family: 'Source Sans 3', sans-serif; font-size: 0.72rem; font-weight: 800; backdrop-filter: blur(8px); }
          .book-status.available { background: rgba(240, 250, 244, 0.92); color: #166534; }
          .book-status.borrowed { background: rgba(253, 242, 242, 0.95); color: #8b1e1e; }
          .book-content { padding: 14px 14px 16px; border-top: 2px solid rgba(125, 29, 29, 0.32); }
          .book-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; line-height: 1.1; color: #261111; margin-bottom: 4px; min-height: 2.9rem; }
          .book-author { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #8a7474; font-weight: 700; margin-bottom: 8px; }
          .book-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .book-meta-tag { font-family: 'Source Sans 3', sans-serif; font-size: 0.74rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: rgba(139, 30, 30, 0.08); color: #8b1e1e; }

          .notice-section { width: 100%; max-width: none; margin: 0; padding: 46px 56px 76px 42px; background: linear-gradient(180deg, #fffdf9 0%, #f9f3eb 100%); }
          .notice-inner { max-width: 1180px; margin: 0 auto; }

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
          .toast-close { background: none; border: none; color: rgba(255,255,255,0.55); cursor: pointer; font-size: 1.1rem; padding: 4px; line-height: 1; flex-shrink: 0; transition: color 0.2s; }
          .toast-close:hover { color: #fff; }
          .notice-header { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 28px; flex-wrap: wrap; }
          .notice-subtitle { font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; color: #7a5e5e; max-width: 540px; }
          .notice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
          .notice-card { border-radius: 22px; padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,243,236,0.95) 100%); box-shadow: 0 16px 34px rgba(88, 30, 30, 0.08); border: 1px solid rgba(139,30,30,0.08); }
          .notice-card h3 { font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 10px; color: #2f1111; }
          .notice-card p { font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; line-height: 1.7; color: #5f4745; margin-bottom: 16px; }
          .notice-tag { display: inline-block; font-family: 'Source Sans 3', sans-serif; font-size: 0.8rem; font-weight: 800; color: #8b1e1e; background: rgba(139,30,30,0.1); padding: 6px 12px; border-radius: 999px; }

          .about-section { background: linear-gradient(180deg, #fffdf9 0%, #f3ece2 100%); position: relative; }
          .about-inner { width: 100%; max-width: none; margin: 0; padding: 68px 56px 68px 42px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 280px); gap: 32px; align-items: center; }
          .about-title { font-family: 'Lora', serif; font-size: clamp(2.2rem, 3.2vw, 3rem); color: #6c1a1a; margin-bottom: 12px; }
          .about-text { font-family: 'Source Sans 3', sans-serif; font-size: 1rem; line-height: 1.85; color: #554545; max-width: 560px; margin-bottom: 18px; }
          .about-list { list-style: none; display: grid; gap: 10px; font-family: 'Source Sans 3', sans-serif; color: #5b4747; font-weight: 700; }
          .about-card { background: linear-gradient(180deg, #7d1c1c 0%, #5b1313 100%); border-radius: 24px; min-height: 220px; padding: 28px; color: #fff7ef; box-shadow: 0 20px 40px rgba(77, 19, 19, 0.14); display: flex; flex-direction: column; justify-content: center; }
          .about-card-title { font-family: 'Lora', serif; font-size: 2rem; margin-bottom: 10px; }
          .about-card-text { font-family: 'Source Sans 3', sans-serif; line-height: 1.7; color: rgba(255,255,255,0.82); }

          .footer { min-height: 72px; padding: 18px 24px; background: #3a1212; color: rgba(255,255,255,0.88); display: flex; align-items: center; justify-content: center; font-family: 'Source Sans 3', sans-serif; text-align: center; font-size: 1rem; font-weight: 700; letter-spacing: 0.01em; border-top: 6px solid rgba(255,255,255,0.08); }

          [data-reveal] { opacity: 0; transform: translateY(10px); transition: opacity 0.45s ease, transform 0.45s ease; will-change: opacity, transform; }
          [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
          .search-shell[data-reveal] { transition-duration: 0.4s; }
          .catalog-section[data-reveal], .about-section[data-reveal] { transition-duration: 0.5s; }
          .book-card[data-reveal] { transition-duration: 0.4s; }

          @keyframes fadeInSoft {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 860px) {
            .topbar-inner { padding: 14px 18px; }
            .hero-inner { grid-template-columns: 1fr; min-height: auto; padding: 0; }
            .hero-copy { max-width: none; padding: 28px 18px 12px; }
            .hero-logo-card { width: min(100%, 300px); }
            .hero-logo-wrap { min-height: 210px; }
            .search-shell, .catalog-section, .about-inner { padding-left: 18px; padding-right: 18px; }
            .search-box { margin: 0; }
            .about-inner { grid-template-columns: 1fr; }
          }
        `}</style>

        <div className="home-shell">
          <header className="topbar">
            <div className="topbar-inner">
              <div className="brand">
                Biblioteca Escolar <span>Emerson Teixeira</span>
              </div>
              <nav className="nav-links">
                <a href="#catalogo" className="nav-link">Catálogo</a>
                <Link href="/tcc" className="nav-link">TCC</Link>
                <a href="#biblionews" className="nav-link">BiblioNews</a>
                <Link href="/admin/login" className="nav-link">Admin</Link>
              </nav>
            </div>
          </header>

          <section className="hero">
            <div className="hero-inner">
              <div className="hero-copy">
                <p className="hero-kicker">Escola João Paulo I</p>
                <h1 className="hero-title">
                  <span className="hero-title-line">Descubra seu</span>
                  <span className="hero-title-line">
                    próximo <span className="hero-title-highlight">LIVRO</span>
                  </span>
                </h1>
                <p className="hero-text">
                  Explore nosso acervo virtual, consulte a disponibilidade dos livros
                  e acesse os TCCs e artigos da nossa comunidade escolar.
                </p>
              </div>
              <div className="hero-logo-wrap">
                <div className="hero-logo-card">
                  <img src="/logo-jpi.png" alt="Logo da Biblioteca Emerson Teixeira" className="hero-logo" />
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
                <h2 className="catalog-title">Catálogo Completo</h2>
                <span className="catalog-count">
                  {loading ? "carregando..." : `${filtrados.length} livros`}
                </span>
              </div>
            </div>

            <div className="filters-panel">
              <div className="filters-header">
                <div>
                  <div className="filters-title">Filtros</div>
                  <div className="filters-note">Selecione assuntos para refinar a busca ou apague todos os filtros.</div>
                </div>
                <div className="filters-actions">
                  <button type="button" className="filters-toggle" onClick={() => setFiltrosAbertos((prev) => !prev)}>
                    {filtrosAbertos ? "Ocultar filtros" : "Mostrar filtros"}
                  </button>
                  {(selectedGeneros.length > 0 || busca) && (
                    <button type="button" onClick={clearFiltros} className="filter-clear">Limpar filtros</button>
                  )}
                </div>
              </div>

              {selectedGeneros.length > 0 && (
                <div className="selected-filters">
                  {selectedGeneros.map((g) => (
                    <button key={g} type="button" onClick={() => setSelectedGeneros((prev) => prev.filter((item) => item !== g))} className="filter-chip">
                      {g} ×
                    </button>
                  ))}
                </div>
              )}

              <div className={`filters-body ${filtrosAbertos ? "open" : ""}`}>
                <div className="filter-box">
                  <div className="filter-box-title">Filtrar por assunto</div>
                  {generos.length > 0 ? (
                    <select
                      className="category-select"
                      value={selectedGeneros[0] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setSelectedGeneros(val ? [val] : [])
                      }}
                    >
                      <option value="">— Todos os assuntos —</option>
                      {generos.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="filters-empty">Nenhum assunto encontrado.</div>
                  )}
                </div>
              </div>
            </div>

            {loading && <div className="feedback-box">Carregando acervo...</div>}
            {!loading && filtrados.length === 0 && (
              <div className="feedback-box">
                {busca || selectedGeneros.length > 0 ? "Nenhum livro encontrado para esse filtro." : "Nenhum livro cadastrado ainda."}
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
                        <div className="book-fallback">📚</div>
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
              <div className="notice-header">
                <div className="catalog-accent" />
                <div>
                  <h2 className="catalog-title">BiblioNews</h2>
                  <p className="notice-subtitle">Fique por dentro das novidades, avisos e comunicados da biblioteca.</p>
                </div>
              </div>
              <div className="notice-grid">
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <article key={notice.id} className="notice-card">
                      <h3>{notice.titulo}</h3>
                      <p>{notice.mensagem}</p>
                      <span className="notice-tag">{notice.tag}</span>
                    </article>
                  ))
                ) : (
                  <article className="notice-card">
                    <h3>Sem avisos disponíveis</h3>
                    <p>O administrador ainda não publicou nenhum comunicado.</p>
                  </article>
                )}
              </div>
            </div>
          </section>

          <section id="sobre" className="about-section" data-reveal>ioteca Em
            <div className="about-inner">
              <div>
                <h2 className="about-title">Um espaço para leitura, estudo e pesquisa</h2>
                <p className="about-text">
                  A Biblioteca Escolar Emerson Teixeira foi pensada como um ambiente acolhedor
                  para os alunos da Escola João Paulo I. O site segue a mesma ideia:
                  consulta simples, visual organizado e destaque para o acervo.
                </p>
                <ul className="about-list">
                  <li>Horário de atendimento de segunda a sexta</li>
                  <li>Consulta rápida ao acervo por busca e gênero</li>
                  <li>Espaço dedicado para TCCs, artigos e produções escolares</li>
                </ul>
              </div>
              <div className="about-card">
                <div className="about-card-title">Biblioteca Escolar</div>
                <p className="about-card-text">
                  Organização visual inspirada em acervo físico, com tons quentes,
                  leitura confortável e foco nos livros cadastrados.
                </p>
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
          <button className="toast-close" onClick={fecharToast} aria-label="Fechar">✕</button>
        </div>
      )}

      {/* Papiro fora de tudo — position:fixed funciona corretamente aqui */}
      <Papiro acervo={livros} />
    </>
  )
}