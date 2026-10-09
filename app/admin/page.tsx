"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"

type Stats = {
  livros: number
  usuarios: number
  emprestimos: number
  emaberto: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const atalhos = [
    { label: "Empréstimos", href: "/admin/emprestimos" },
    { label: "Cadastrar alunos", href: "/admin/usuarios" },
    { label: "Cadastrar livros", href: "/admin/livros" },
  ]

  const resumo = [
    { label: "empréstimos", value: stats?.emaberto ?? 0, color: "#8b1e1e" },
    { label: "alunos", value: stats?.usuarios ?? 0, color: "#6d1414" },
    { label: "livros", value: stats?.livros ?? 0, color: "#7a1c1c" },
  ]

  return (
    <div className="dash-wrap">
      <div className="dash-ornament">✦</div>
      <h1 className="dash-welcome">Seja bem-vinda!</h1>
      <p className="dash-tagline">Biblioteca Escolar Emerson Teixeira</p>

      <div className="quick-pill">
        {atalhos.map((a, i) => (
          <Fragment key={a.href}>
            {i > 0 && <span className="quick-pill-divider" />}
            <Link href={a.href} className="quick-pill-item">
              {a.label}
            </Link>
          </Fragment>
        ))}
      </div>

      <p className="dash-subtitle">Na biblioteca, temos:</p>

      <div className="simple-stats">
        {resumo.map((r) => (
          <div key={r.label} className="simple-stat-card">
            <div className="simple-stat-bar" style={{ background: `linear-gradient(90deg, ${r.color}, rgba(255,255,255,0.3))` }} />
            <div className="simple-stat-body">
              <span className="simple-stat-value" style={{ color: r.color }}>{loading ? "…" : r.value}</span>
              <span className="simple-stat-label">{r.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .dash-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 8px; }
        .dash-ornament { color: #c99; font-size: 1.1rem; margin-bottom: 10px; opacity: 0.7; }
        .dash-welcome {
          font-family: 'Playfair Display', serif; font-size: 2.7rem; color: #2d1414;
          margin-bottom: 6px;
        }
        .dash-tagline {
          font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #a1888b;
          text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;
          margin-bottom: 36px;
        }
        .quick-pill {
          display: flex; align-items: stretch; width: fit-content; max-width: 100%;
          border: 2px solid #8b1e1e; border-radius: 999px; overflow: hidden;
          background: #fffdf9; box-shadow: 0 16px 34px rgba(60,14,14,0.14);
          margin-bottom: 44px;
        }
        .quick-pill-item {
          display: flex; align-items: center; justify-content: center; text-align: center;
          text-decoration: none; color: #6a2a2a; font-family: 'Source Sans 3', sans-serif;
          font-weight: 700; font-size: 0.98rem; padding: 18px 32px; white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .quick-pill-item:hover { background: #8b1e1e; color: #fff7ef; }
        .quick-pill-divider { width: 2px; background: rgba(139,30,30,0.22); flex-shrink: 0; }
        .dash-subtitle {
          font-family: 'Source Sans 3', sans-serif; font-size: 1.1rem; font-weight: 700;
          color: #4a3838; margin-bottom: 20px;
        }
        .simple-stats { display: flex; gap: 22px; flex-wrap: wrap; justify-content: center; }
        .simple-stat-card {
          border-radius: 20px; overflow: hidden; width: 190px;
          background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,250,245,0.9) 100%);
          box-shadow: 0 16px 32px rgba(60,14,14,0.1);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          text-align: left;
        }
        .simple-stat-card:hover { transform: translateY(-4px); box-shadow: 0 22px 40px rgba(60,14,14,0.16); }
        .simple-stat-bar { height: 8px; }
        .simple-stat-body { padding: 20px 22px 22px; }
        .simple-stat-value { display: block; font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 6px; }
        .simple-stat-label { font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #7d5f5f; font-weight: 700; }
        @media (max-width: 600px) {
          .quick-pill { flex-direction: column; border-radius: 24px; width: 100%; }
          .quick-pill-divider { width: 100%; height: 2px; }
          .simple-stat-card { width: 150px; }
        }
      `}</style>
    </div>
  )
}
