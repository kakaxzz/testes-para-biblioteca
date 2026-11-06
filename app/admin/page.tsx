"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { Icone as IconeUI } from "@/components/Icone"

type Stats = {
  livros: number
  usuarios: number
  emprestimos: number
  emaberto: number
}

type NomeIcone = "emprestimos" | "leitores" | "livros"

function Icone({ nome, tamanho = 22 }: { nome: NomeIcone; tamanho?: number }) {
  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (nome) {
    case "emprestimos":
      return (
        <svg {...comum}>
          <path d="M4 8h13l-3-3" />
          <path d="M20 16H7l3 3" />
        </svg>
      )
    case "leitores":
      return (
        <svg {...comum}>
          <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
          <path d="M6.5 11.8V16c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.2" />
          <path d="M21.5 9.5V15" />
        </svg>
      )
    default:
      return (
        <svg {...comum}>
          <path d="M5 4h3.5v16H5zM10.5 4H14v16h-3.5z" />
          <path d="M15.8 5.4l3.3-.9 3 14.6-3.3.9z" />
        </svg>
      )
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const atalhos: { label: string; href: string; icone: NomeIcone }[] = [
    { label: "Empréstimos", href: "/admin/emprestimos", icone: "emprestimos" },
    { label: "Cadastrar Leitores", href: "/admin/usuarios", icone: "leitores" },
    { label: "Cadastrar livros", href: "/admin/livros", icone: "livros" },
  ]

  const resumo: { label: string; valor: number | undefined; icone: NomeIcone }[] = [
    { label: "empréstimos", valor: stats?.emaberto, icone: "emprestimos" },
    { label: "leitores", valor: stats?.usuarios, icone: "leitores" },
    { label: "livros", valor: stats?.livros, icone: "livros" },
  ]

  return (
    <div className="dash">
      <section className="dash-hero">
        <img src="/logo-jpi.png" alt="" className="dash-hero-logo" />
        <div className="dash-hero-content">
          <p className="dash-eyebrow">Biblioteca Escolar Emerson Teixeira</p>
          <h1 className="dash-welcome">Seja bem-vinda!</h1>

          <div className="quick-pill">
            {atalhos.map((a, i) => (
              <Fragment key={a.href}>
                {i > 0 && <span className="quick-pill-divider" />}
                <Link href={a.href} className="quick-pill-item">
                  <Icone nome={a.icone} tamanho={18} />
                  {a.label}
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <h2 className="dash-subtitle">Na biblioteca, temos:</h2>

      <div className="stat-grid">
        {resumo.map((r, i) => (
          <div key={r.label} className="stat-card" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="stat-bar" />
            <div className="stat-body">
              <span className="stat-icon">
                <Icone nome={r.icone} />
              </span>
              <div className="stat-text">
                <span className="stat-value">
                  {loading ? <span className="skeleton" /> : r.valor === undefined ? "—" : r.valor.toLocaleString("pt-BR")}
                </span>
                <span className="stat-label">{r.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/admin/stats" className="dash-more">
        Ver estatísticas completas <IconeUI nome="setaDireita" tamanho="1em" />
      </Link>

      <style>{`
        .dash { display: flex; flex-direction: column; align-items: center; text-align: center; }

        .dash-hero {
          position: relative; overflow: hidden; width: 100%; max-width: 980px;
          border-radius: 28px; padding: 46px 28px 50px; margin-bottom: 44px; color: #fff7ef;
          background:
            radial-gradient(circle at 16% 8%, rgba(255,255,255,0.13), transparent 46%),
            linear-gradient(135deg, #6a1414 0%, #841f1f 55%, #6d1616 100%);
          box-shadow: 0 26px 52px rgba(60, 14, 14, 0.24);
          animation: dashUp 0.5s ease both;
        }
        .dash-hero-logo {
          position: absolute; right: -46px; bottom: -70px; width: 340px; height: 340px; object-fit: contain;
          opacity: 0.13; filter: brightness(1.6); mix-blend-mode: screen; pointer-events: none;
        }
        .dash-hero-content { position: relative; display: flex; flex-direction: column; align-items: center; }
        .dash-eyebrow {
          font-family: 'Source Sans 3', sans-serif; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #f4c58c; margin-bottom: 10px;
        }
        .dash-welcome {
          font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 4vw, 3.1rem);
          line-height: 1.05; color: #fff8f1; margin-bottom: 30px;
        }

        .quick-pill {
          display: flex; align-items: stretch; width: fit-content; max-width: 100%;
          border-radius: 999px; overflow: hidden; background: #fff7ef;
          box-shadow: 0 16px 34px rgba(20, 4, 4, 0.32);
        }
        .quick-pill-item {
          display: flex; align-items: center; justify-content: center; gap: 9px; text-align: center;
          text-decoration: none; color: #6a2a2a; font-family: 'Source Sans 3', sans-serif;
          font-weight: 700; font-size: 0.98rem; padding: 17px 30px; white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .quick-pill-item:hover { background: #f4e4c4; color: #4d1010; }
        .quick-pill-divider { width: 1px; margin: 12px 0; background: rgba(139, 30, 30, 0.22); flex-shrink: 0; }

        .dash-subtitle {
          font-family: 'Source Sans 3', sans-serif; font-size: 1.1rem; font-weight: 700;
          color: #4a3838; margin-bottom: 20px;
        }
        .stat-grid { display: flex; gap: 22px; flex-wrap: wrap; justify-content: center; }
        .stat-card {
          width: 270px; border-radius: 22px; overflow: hidden; text-align: left;
          background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,250,245,0.92) 100%);
          border: 1px solid rgba(139, 30, 30, 0.08); box-shadow: 0 16px 34px rgba(60, 14, 14, 0.1);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          animation: dashUp 0.5s ease both;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 24px 44px rgba(60, 14, 14, 0.16); }
        .stat-bar { height: 7px; background: linear-gradient(90deg, #7d1c1c, rgba(125, 28, 28, 0.15)); }
        .stat-body { display: flex; align-items: center; gap: 18px; padding: 22px 24px 24px; }
        .stat-icon {
          flex-shrink: 0; width: 54px; height: 54px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: #f8e4e0; color: #8b1e1e;
        }
        .stat-text { display: flex; flex-direction: column; min-width: 0; }
        .stat-value { font-family: 'Playfair Display', serif; font-size: 2.3rem; font-weight: 800; line-height: 1.1; color: #6d1414; min-height: 2.5rem; }
        .stat-label { font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; font-weight: 700; color: #7d5f5f; }

        .skeleton {
          display: inline-block; width: 70px; height: 2rem; border-radius: 10px; vertical-align: middle;
          background: linear-gradient(90deg, #efe3d9 25%, #f8f0e8 50%, #efe3d9 75%); background-size: 200% 100%;
          animation: shimmer 1.2s linear infinite;
        }
        .dash-more {
          margin-top: 26px; text-decoration: none; font-family: 'Source Sans 3', sans-serif;
          font-weight: 700; font-size: 0.95rem; color: #8b1e1e; padding: 8px 14px; border-radius: 999px;
          transition: background 0.2s ease;
        }
        .dash-more:hover { background: rgba(139, 30, 30, 0.08); }

        @keyframes dashUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        @media (max-width: 700px) {
          .dash-hero { padding: 34px 18px 36px; border-radius: 22px; }
          .quick-pill { flex-direction: column; border-radius: 22px; width: 100%; }
          .quick-pill-divider { width: auto; height: 1px; margin: 0 16px; }
          .stat-card { width: 100%; max-width: 360px; }
        }
      `}</style>
    </div>
  )
}
