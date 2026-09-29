"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
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
  const [menuAberto, setMenuAberto] = useState(false)

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
          .nav-more { position: relative; }
          .nav-more-btn {
            border: none; cursor: pointer; color: #fff2ea; background: rgba(255,255,255,0.14);
            width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; gap: 3px;
            transition: transform 0.25s ease, background 0.25s ease;
          }
          .nav-more-btn span { width: 4px; height: 4px; border-radius: 50%; background: #fff2ea; display: block; }
          .nav-more-btn:hover { transform: translateY(-1px) scale(1.06); background: rgba(255,255,255,0.24); }
          .nav-more-backdrop { position: fixed; inset: 0; z-index: 149; }
          .nav-more-menu {
            position: absolute; top: calc(100% + 10px); right: 0; z-index: 150;
            background: #fffdf9; border-radius: 14px; padding: 8px; min-width: 200px;
            box-shadow: 0 18px 40px rgba(36, 10, 10, 0.22); border: 1px solid rgba(139,30,30,0.08);
            display: flex; flex-direction: column; gap: 2px;
            animation: menuPop 0.18s ease-out both;
          }
          @keyframes menuPop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          .nav-more-item {
            display: block; text-decoration: none; color: #3b1616; font-family: 'Source Sans 3', sans-serif;
            font-weight: 700; font-size: 0.94rem; padding: 10px 12px; border-radius: 9px;
            transition: background 0.18s ease;
          }
          .nav-more-item:hover { background: rgba(139,30,30,0.08); }

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

          .search-box { width: 100%; max-width: 360px; position: relative; flex-shrink: 0; }
          .search-input { width: 100%; border: none; outline: none; border-radius: 999px; padding: 14px 20px 14px 46px; font-size: 0.94rem; font-family: 'Source Sans 3', sans-serif; background: rgba(231, 221, 210, 0.96); color: #321515; box-shadow: 0 10px 30px rgba(68, 27, 27, 0.08); transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease; }
          .search-input:focus { background: rgba(242, 237, 232, 0.98); box-shadow: 0 14px 34px rgba(68, 27, 27, 0.12); transform: translateY(-1px); }
          .search-input::placeholder { color: #6d5f5f; }
          .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #7c5b5b; font-size: 0.94rem; }

          .catalog-section { width: 100%; max-width: none; margin: 0; padding: 52px 56px 80px 42px; }
          .catalog-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
          .catalog-title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
          .catalog-accent { width: 16px; height: 42px; border-radius: 999px; background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%); box-shadow: 0 8px 18px rgba(95, 18, 18, 0.22); }
          .catalog-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 700; color: #2d1414; }
          .catalog-count { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #9c8d8d; font-weight: 700; }

          .filters-panel { margin-bottom: 26px; }
          .filters-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
          .filters-dropdown-wrap { position: relative; }
          .filters-toggle { border: 1px solid rgba(139, 30, 30, 0.18); background: white; color: #6a2a2a; border-radius: 999px; padding: 10px 18px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; }
          .filters-toggle:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(101, 33, 33, 0.09); }
          .filters-backdrop { position: fixed; inset: 0; z-index: 59; }
          .filters-dropdown { position: absolute; top: calc(100% + 10px); left: 0; z-index: 60; background: #fffdfa; border: 1px solid rgba(139, 30, 30, 0.14); border-radius: 16px; padding: 10px; min-width: 240px; max-width: 300px; max-height: 320px; overflow-y: auto; box-shadow: 0 18px 40px rgba(60,14,14,0.14); animation: menuPop 0.18s ease-out both; }
          .filters-dropdown-title { font-family: 'Source Sans 3', sans-serif; font-size: 0.78rem; font-weight: 800; color: #a1888b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; padding: 4px 10px 0; }
          .filters-options { display: flex; flex-direction: column; gap: 1px; }
          .filters-option { text-align: left; border: none; background: transparent; cursor: pointer; padding: 9px 10px; border-radius: 10px; font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #3b1616; transition: background 0.15s ease; }
          .filters-option:hover { background: rgba(139, 30, 30, 0.06); }
          .filters-option.active { background: rgba(139, 30, 30, 0.12); font-weight: 700; color: #6a2a2a; }
          .selected-filters { display: flex; flex-wrap: wrap; gap: 8px; }
          .filter-chip { border: none; cursor: pointer; background: #f4e6df; color: #6a2a2a; border-radius: 999px; padding: 8px 12px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.88rem; transition: transform 0.18s ease, background 0.18s ease; }
          .filter-chip:hover { transform: translateY(-1px); background: #e9d2c8; }
          .filter-clear { border: none; cursor: pointer; color: #8b1e1e; background: rgba(255, 230, 226, 0.95); padding: 10px 16px; border-radius: 999px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; transition: transform 0.18s ease, background 0.18s ease; }
          .filter-clear:hover { transform: translateY(-1px); background: rgba(255, 215, 208, 0.96); }
          .filters-empty { font-family: 'Source Sans 3', sans-serif; color: #8c7474; font-size: 0.94rem; padding: 10px; }

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
          .toast-close { background: none; border: none; color: rgba(255,255,255,0.55); cursor: pointer; font-size: 1.1rem; padding: 4px; line-height: 1; flex-shrink: 0; transition: color 0.2s; }
          .toast-close:hover { color: #fff; }
          .notice-header { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 28px; flex-wrap: wrap; }
          .notice-subtitle { font-family: 'Source Sans 3', sans-serif; font-size: 0.98rem; color: #7a5e5e; max-width: 540px; }
          .notice-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            grid-auto-rows: 190px;
            grid-auto-flow: dense;
            gap: 20px;
          }
          .notice-card {
            border-radius: 24px; padding: 22px 22px 20px; text-align: center;
            background: linear-gradient(160deg, #7d1c1c 0%, #58100f 100%);
            box-shadow: 0 18px 38px rgba(60, 14, 14, 0.28);
            border: 1px solid rgba(255,255,255,0.06);
            transition: transform 0.28s ease, box-shadow 0.28s ease;
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
            overflow: hidden;
          }
          .notice-card.notice-card--big { grid-row: span 2; padding: 26px 24px; }
          .notice-card:hover { transform: translateY(-6px); box-shadow: 0 24px 46px rgba(60, 14, 14, 0.36); }
          .notice-card h3 { font-family: 'Playfair Display', serif; font-size: 1.15rem; line-height: 1.3; margin-bottom: 8px; color: #fff7ef; }
          .notice-card--big h3 { font-size: 1.35rem; }
          .notice-card p { font-family: 'Source Sans 3', sans-serif; font-size: 0.9rem; line-height: 1.5; color: rgba(255,247,239,0.86); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
          .notice-card--big p { -webkit-line-clamp: 5; font-size: 0.95rem; }
          .notice-tag { display: inline-block; font-family: 'Source Sans 3', sans-serif; font-size: 0.74rem; font-weight: 800; color: #fff2e4; background: rgba(255,255,255,0.14); padding: 5px 13px; border-radius: 999px; margin-top: auto; flex-shrink: 0; }
          .notice-media { width: 100%; display: flex; justify-content: center; margin-bottom: 12px; flex-shrink: 0; }
          .notice-media img { max-height: 130px; object-fit: contain; filter: drop-shadow(0 10px 18px rgba(0,0,0,0.25)); }
          .notice-media.cover img { max-height: 130px; border-radius: 8px; box-shadow: 0 12px 24px rgba(0,0,0,0.35); }
          .notice-stack { grid-row: span 2; display: flex; flex-direction: column; gap: 20px; }
          .notice-stack .notice-card { flex: 1 1 0; min-height: 0; }

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
            .topbar-inner { padding: 14px 18px; }
            .hero-inner { grid-template-columns: 1fr; min-height: auto; padding: 0; }
            .hero-copy { max-width: none; padding: 28px 18px 12px; }
            .hero-logo-card { width: min(100%, 300px); }
            .hero-logo-wrap { min-height: 210px; }
            .catalog-section { padding-left: 18px; padding-right: 18px; }
            .search-box { max-width: none; }
            .about-inner { grid-template-columns: 1fr; gap: 6px; padding: 32px 18px 48px; }
            .about-header { padding: 32px 18px 16px; }
            .about-gallery-track img { width: 220px; height: 190px; }
            .nav-links { gap: 8px; }
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
                <a href="#biblionews" className="nav-link">BiblioNews</a>
                <a href="#sobre" className="nav-link">Sobre a biblioteca</a>
                <div className="nav-more">
                  <button
                    type="button"
                    className="nav-more-btn"
                    onClick={() => setMenuAberto((v) => !v)}
                    aria-label="Mais opções"
                  >
                    <span /><span /><span />
                  </button>
                  {menuAberto && (
                    <>
                      <div className="nav-more-backdrop" onClick={() => setMenuAberto(false)} />
                      <div className="nav-more-menu">
                        <Link href="/tcc" className="nav-more-item" onClick={() => setMenuAberto(false)}>TCC &amp; Artigos</Link>
                        <Link href="/admin/login" className="nav-more-item" onClick={() => setMenuAberto(false)}>Área do Admin</Link>
                      </div>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </header>

          <section className="hero">
            <div className="hero-inner">
              <div className="hero-copy">
                <p className="hero-kicker">Escola João Paulo I</p>
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
                  <img src="/logo-jpi.png" alt="Logo da Biblioteca Emerson Teixeira" className="hero-logo" />
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
                <span className="search-icon">⌕</span>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Digite aqui o livro que procura!"
                  className="search-input"
                />
              </div>
            </div>

            <div className="filters-panel">
              <div className="filters-row">
                <div className="filters-dropdown-wrap">
                  <button type="button" className="filters-toggle" onClick={() => setFiltrosAbertos((prev) => !prev)}>
                    {filtrosAbertos ? "Ocultar filtros" : "Mostrar filtros"}
                  </button>
                  {filtrosAbertos && (
                    <>
                      <div className="filters-backdrop" onClick={() => setFiltrosAbertos(false)} />
                      <div className="filters-dropdown">
                        <div className="filters-dropdown-title">Filtrar por assunto</div>
                        {generos.length > 0 ? (
                          <div className="filters-options">
                            <button
                              type="button"
                              className={`filters-option${selectedGeneros.length === 0 ? " active" : ""}`}
                              onClick={() => { setSelectedGeneros([]); setFiltrosAbertos(false) }}
                            >
                              Todos os assuntos
                            </button>
                            {generos.map((g) => (
                              <button
                                key={g}
                                type="button"
                                className={`filters-option${selectedGeneros[0] === g ? " active" : ""}`}
                                onClick={() => { setSelectedGeneros([g]); setFiltrosAbertos(false) }}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="filters-empty">Nenhum assunto encontrado.</div>
                        )}
                      </div>
                    </>
                  )}
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

                {(selectedGeneros.length > 0 || busca) && (
                  <button type="button" onClick={clearFiltros} className="filter-clear">Limpar filtros</button>
                )}
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
                  (() => {
                    const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

                    const enriquecidos = notices.map((notice) => {
                      const textoCompleto = normalizar(`${notice.titulo} ${notice.mensagem} ${notice.tag}`)
                      const ehMascote = textoCompleto.includes("mascote") || textoCompleto.includes("papiro")
                      const ehLivroDoMes = normalizar(notice.titulo).includes("livro do mes")
                      const capaAcervo = ehLivroDoMes
                        ? livros.find((l) => l.titulo && normalizar(notice.mensagem).includes(normalizar(l.titulo)))?.capa
                        : undefined
                      const capaFixa = ehLivroDoMes && textoCompleto.includes("noites brancas")
                        ? "/capa-noites-brancas.jpg"
                        : undefined
                      const capa = capaAcervo || capaFixa
                      const temMedia = ehMascote || !!capa
                      const grande = temMedia || notice.mensagem.length > 120
                      return { notice, ehMascote, capa, grande }
                    })

                    const renderCard = (item: typeof enriquecidos[number], grande: boolean) => (
                      <article key={item.notice.id} className={`notice-card${grande ? " notice-card--big" : " notice-card--small"}`}>
                        {item.ehMascote && (
                          <div className="notice-media">
                            <img src="/papiro-mascote.png" alt="Papiro, o mascote da biblioteca" />
                          </div>
                        )}
                        {item.capa && (
                          <div className="notice-media cover">
                            <img src={item.capa} alt={item.notice.titulo} />
                          </div>
                        )}
                        <h3>{item.notice.titulo}</h3>
                        <p>{item.notice.mensagem}</p>
                        <span className="notice-tag">{item.notice.tag}</span>
                      </article>
                    )

                    const blocos: ReactNode[] = []
                    let i = 0
                    while (i < enriquecidos.length) {
                      const atual = enriquecidos[i]
                      if (atual.grande) {
                        blocos.push(renderCard(atual, true))
                        i += 1
                        continue
                      }
                      const proximo = enriquecidos[i + 1]
                      if (proximo && !proximo.grande) {
                        blocos.push(
                          <div key={`par-${atual.notice.id}`} className="notice-stack">
                            {renderCard(atual, false)}
                            {renderCard(proximo, false)}
                          </div>
                        )
                        i += 2
                      } else {
                        blocos.push(renderCard(atual, false))
                        i += 1
                      }
                    }
                    return blocos
                  })()
                ) : (
                  <article className="notice-card">
                    <h3>Sem avisos disponíveis</h3>
                    <p>O administrador ainda não publicou nenhum comunicado.</p>

                  </article>
                )}
              </div>
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
          <button className="toast-close" onClick={fecharToast} aria-label="Fechar">✕</button>
        </div>
      )}

      {/* Papiro fora de tudo — position:fixed funciona corretamente aqui */}
      <Papiro acervo={livros} />
    </>
  )
}