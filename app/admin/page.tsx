"use client"

import { useEffect, useState } from "react"

type TopLivro = {
  id: number
  titulo: string
  autor: string
  isbn: string
  count: number
}

type Stats = {
  livros: number
  usuarios: number
  emprestimos: number
  emaberto: number
  topLivros: TopLivro[]
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

  const cartoes = [
    { label: "Total de Livros Cadastrados", value: stats?.livros ?? 0 },
    { label: "Usuários cadastrados", value: stats?.usuarios ?? 0 },
    { label: "Empréstimos ativos", value: stats?.emaberto ?? 0 },
    { label: "Empréstimos totais", value: stats?.emprestimos ?? 0 },
  ]
  return (
    <div>
      <div className="dash-intro">
        <p>Bem-vinda ao painel da Biblioteca Escolar Emerson Teixeira</p>
      </div>

      <div className="section-heading">
        <div className="section-heading-bar" />
        <h2>Estatísticas</h2>
      </div>

      <div className="stats-grid">
        {cartoes.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-card-value">{loading ? "…" : c.value}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <section className="card" style={{ marginBottom: 32 }}>
        <div className="section-heading" style={{ marginBottom: 20 }}>
          <div className="section-heading-bar" />
          <h2 style={{ fontSize: "1.6rem" }}>Livros mais emprestados</h2>
        </div>

        {loading ? (
          <div className="feedback-box">Carregando...</div>
        ) : stats?.topLivros.length ? (
          <div style={{ display: "grid", gap: 14 }}>
            {stats.topLivros.map((livro, index) => (
              <div key={livro.id} className="ranking-row">
                <span className="ranking-position">{index + 1}º</span>
                <div className="ranking-info">
                  <strong>{livro.titulo}</strong>
                  <p>{livro.autor} • {livro.isbn}</p>
                </div>
                <span className="ranking-badge">{livro.count}x</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="feedback-box">Nenhum empréstimo registrado ainda.</div>
        )}
      </section>

      <style>{`
        .dash-intro { margin-bottom: 32px; }
        .dash-intro p { font-family: 'Source Sans 3', sans-serif; font-size: 1.05rem; color: #6f5f5f; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 20px; margin-bottom: 36px; }
        .stat-card {
          border-radius: 20px; padding: 26px 22px; text-align: center;
          background: linear-gradient(160deg, #7d1c1c 0%, #58100f 100%);
          box-shadow: 0 16px 32px rgba(60,14,14,0.24);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 22px 40px rgba(60,14,14,0.3); }
        .stat-card-value { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 800; color: #fff7ef; line-height: 1; margin-bottom: 8px; }
        .stat-card-label { font-family: 'Source Sans 3', sans-serif; font-size: 0.94rem; font-weight: 700; color: rgba(255,247,239,0.86); }
        .feedback-box { padding: 24px; text-align: center; color: #8f7e7e; font-weight: 700; }
        .ranking-row { display: flex; align-items: center; gap: 16px; padding: 16px 18px; border-radius: 18px; background: #fff8f4; border: 1px solid rgba(139,30,30,0.1); }
        .ranking-position { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px; background: rgba(139,30,30,0.1); color: #8b1e1e; font-weight: 800; font-size: 0.9rem; }
        .ranking-info { flex: 1; min-width: 0; }
        .ranking-info strong { display: block; color: #2d1414; font-size: 1rem; margin-bottom: 4px; }
        .ranking-info p { margin: 0; color: #7d5f5f; font-size: 0.88rem; }
        .ranking-badge { flex-shrink: 0; background: rgba(139,30,30,0.1); color: #8b1e1e; border-radius: 999px; padding: 8px 14px; font-weight: 700; font-size: 0.88rem; }
      `}</style>
    </div>
  )
}
