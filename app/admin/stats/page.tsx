"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type TopLivro = {
  id: number
  titulo: string
  autor: string
  isbn: string
  count: number
}

type TopAluno = {
  id: number
  nome: string
  matricula: string
  count: number
}

type Stats = {
  livros: number
  alunos: number
  emprestimos: number
  emaberto: number
  topLivros: TopLivro[]
  topAlunos: TopAluno[]
}

export default function AdminStats() {
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

  return (
    <div>
      <div className="page-header">
        <h1>Estatísticas</h1>
        <p>Visão geral dos livros mais emprestados e dos alunos que mais leem.</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 22,
          marginBottom: 36,
        }}
      >
        {[
          { label: "Livros cadastrados", value: stats?.livros ?? 0, color: "#8b1e1e" },
          { label: "Alunos cadastrados", value: stats?.alunos ?? 0, color: "#6d1414" },
          { label: "Empréstimos totais", value: stats?.emprestimos ?? 0, color: "#7a1c1c" },
          { label: "Empréstimos abertos", value: stats?.emaberto ?? 0, color: "#5d1111" },
        ].map((card) => (
          <div key={card.label} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                height: 8,
                background: `linear-gradient(90deg, ${card.color}, rgba(255,255,255,0.25))`,
              }}
            />
            <div style={{ padding: "22px 20px" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {loading ? "..." : card.value}
              </div>
              <div style={{ fontSize: 0.95 + "rem", color: "#7b5d5d", fontWeight: 700 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 22 }}>
        <section className="card" style={{ padding: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,243,0.92) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <div
              style={{
                width: 16,
                height: 42,
                borderRadius: 999,
                background: "linear-gradient(180deg, #5f1212 0%, #8f2222 100%)",
                boxShadow: "0 8px 18px rgba(95,18,18,0.22)",
              }}
            />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#2d1414", lineHeight: 1 }}>
              Livros mais emprestados
            </h2>
          </div>

          {loading ? (
            <div className="feedback-box">Carregando...</div>
          ) : stats?.topLivros.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {stats.topLivros.map((livro, index) => (
                <div key={livro.id} className="report-row">
                  <div>
                    <span className="report-rank">#{index + 1}</span>
                    <strong>{livro.titulo}</strong>
                    <p>{livro.autor} • {livro.isbn}</p>
                  </div>
                  <span className="report-badge">{livro.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="feedback-box">Nenhum empréstimo registrado ainda.</div>
          )}
        </section>

        <section className="card" style={{ padding: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,243,0.92) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <div
              style={{
                width: 16,
                height: 42,
                borderRadius: 999,
                background: "linear-gradient(180deg, #5f1212 0%, #8f2222 100%)",
                boxShadow: "0 8px 18px rgba(95,18,18,0.22)",
              }}
            />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#2d1414", lineHeight: 1 }}>
              Alunos que mais leem
            </h2>
          </div>

          {loading ? (
            <div className="feedback-box">Carregando...</div>
          ) : stats?.topAlunos.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {stats.topAlunos.map((aluno, index) => (
                <div key={aluno.id} className="report-row">
                  <div>
                    <span className="report-rank">#{index + 1}</span>
                    <strong>{aluno.nome}</strong>
                    <p>{aluno.matricula}</p>
                  </div>
                  <span className="report-badge">{aluno.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="feedback-box">Nenhum empréstimo registrado ainda.</div>
          )}
        </section>
      </div>

      <style>{`
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-family: 'Playfair Display', serif; font-size: 3rem; color: #2d1414; margin-bottom: 8px; }
        .page-header p { font-size: 1rem; color: #6f5f5f; max-width: 680px; }
        .feedback-box { padding: 24px; text-align: center; color: #8f7e7e; font-weight: 700; }
        .report-row { display: flex; justify-content: space-between; gap: 14px; align-items: center; padding: 18px 18px; border-radius: 18px; background: #fff8f4; border: 1px solid rgba(139,30,30,0.1); }
        .report-rank { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 999px; background: rgba(139,30,30,0.1); color: #8b1e1e; font-weight: 800; margin-right: 12px; }
        .report-row strong { display: block; color: #2d1414; font-size: 1rem; margin-bottom: 4px; }
        .report-row p { margin: 0; color: #7d5f5f; font-size: 0.9rem; }
        .report-badge { background: rgba(139,30,30,0.1); color: #8b1e1e; border-radius: 999px; padding: 10px 14px; font-weight: 700; min-width: 64px; text-align: center; }
      `}</style>
    </div>
  )
}
