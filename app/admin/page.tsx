"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ livros: 0, alunos: 0, emprestimos: 0, emaberto: 0 })

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {})
  }, [])

  const cards = [
    { icon: "📚", label: "Livros cadastrados", value: stats.livros, href: "/admin/livros", cor: "#8b1e1e" },
    { icon: "📖", label: "Emprestimos ativos", value: stats.emaberto, href: "/admin/emprestimos", cor: "#6d1414" },
  ]

  const atalhos = [
    { icon: "📚", label: "Adicionar livro", href: "/admin/livros" },
    { icon: "📖", label: "Novo emprestimo", href: "/admin/emprestimos" },
    { icon: "🎓", label: "Cadastrar aluno", href: "/admin/alunos" },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Bem-vinda ao painel da Biblioteca Emerson Teixeira</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
          gap: 22,
          marginBottom: 38,
        }}
      >
        {cards.map((c) => (
          <div key={c.href}>
            <div
              className="card"
              style={{
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 8,
                  background: `linear-gradient(90deg, ${c.cor}, rgba(255,255,255,0.25))`,
                }}
              />
              <div style={{ padding: "24px 22px" }}>
                <div style={{ fontSize: 31, marginBottom: 14 }}>{c.icon}</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 34,
                    fontWeight: 800,
                    color: c.cor,
                    marginBottom: 6,
                    lineHeight: 1,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 0.98 + "rem", color: "#8b7878", fontWeight: 700 }}>
                  {c.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          padding: 30,
          background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,248,243,0.9) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <div
            style={{
              width: 16,
              height: 42,
              borderRadius: 999,
              background: "linear-gradient(180deg, #5f1212 0%, #8f2222 100%)",
              boxShadow: "0 8px 18px rgba(95,18,18,0.22)",
            }}
          />
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 34,
              color: "#2d1414",
              lineHeight: 1,
            }}
          >
            Acoes rapidas
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
            gap: 14,
          }}
        >
          {atalhos.map((a) => (
            <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "22px 16px",
                  borderRadius: 18,
                  border: "1px solid rgba(120,32,32,0.06)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,248,243,0.72) 100%)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                  color: "#5a4747",
                  fontSize: 15,
                  fontWeight: 700,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)"
                  e.currentTarget.style.boxShadow = "0 16px 28px rgba(55,18,18,0.08)"
                  e.currentTarget.style.borderColor = "rgba(139,30,30,0.16)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ""
                  e.currentTarget.style.boxShadow = ""
                  e.currentTarget.style.borderColor = "rgba(120,32,32,0.06)"
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 10 }}>{a.icon}</div>
                {a.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}