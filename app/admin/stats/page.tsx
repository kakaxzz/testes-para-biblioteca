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

type TopUsuario = {
  id: number
  nome: string
  tipo: "ALUNO" | "FUNCIONARIO" | "RESPONSAVEL"
  matricula: string | null
  cpf: string | null
  turma?: string | null
  count: number
}

type Stats = {
  ano: number
  anos: number[]
  livros: number
  usuarios: number
  emprestimos: number
  emaberto: number
  topLivros: TopLivro[]
  topUsuarios: TopUsuario[]
}

const hojeBR = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())

function somarDias(iso: string, dias: number) {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState<number | null>(null)

  // Relatório CSV
  const [inicio, setInicio] = useState("")
  const [fim, setFim] = useState("")
  const [gerando, setGerando] = useState(false)
  const [msgRelatorio, setMsgRelatorio] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null)
  const [avisoRelatorio, setAvisoRelatorio] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(ano ? `/api/stats?ano=${ano}` : "/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ano])

  // Período padrão do relatório = ano selecionado (até hoje, se for o ano corrente)
  useEffect(() => {
    if (!stats?.ano) return
    const hoje = hojeBR()
    setInicio(`${stats.ano}-01-01`)
    setFim(stats.ano === Number(hoje.slice(0, 4)) ? hoje : `${stats.ano}-12-31`)
  }, [stats?.ano])

  function usarPeriodo(tipo: "ano" | "mes" | "30dias") {
    const hoje = hojeBR()
    if (tipo === "30dias") {
      setInicio(somarDias(hoje, -29))
      setFim(hoje)
    } else if (tipo === "mes") {
      setInicio(`${hoje.slice(0, 7)}-01`)
      setFim(hoje)
    } else if (stats?.ano) {
      setInicio(`${stats.ano}-01-01`)
      setFim(stats.ano === Number(hoje.slice(0, 4)) ? hoje : `${stats.ano}-12-31`)
    }
  }

  async function baixarRelatorio() {
    setMsgRelatorio(null)
    setAvisoRelatorio(null)
    if (!inicio || !fim) {
      setMsgRelatorio({ tipo: "erro", texto: "Escolha a data inicial e a data final." })
      return
    }
    if (inicio > fim) {
      setMsgRelatorio({ tipo: "erro", texto: "A data inicial não pode ser depois da data final." })
      return
    }

    setGerando(true)
    try {
      const res = await fetch(`/api/admin/relatorio?inicio=${inicio}&fim=${fim}`)
      if (!res.ok) {
        const erro = await res.json().catch(() => null)
        throw new Error(erro?.error || "Não foi possível gerar o relatório.")
      }

      const total = Number(res.headers.get("X-Relatorio-Linhas") ?? 0)
      const aviso = res.headers.get("X-Relatorio-Aviso")
      if (aviso) setAvisoRelatorio(decodeURIComponent(aviso))

      if (total === 0) {
        setMsgRelatorio({ tipo: "erro", texto: "Nenhum empréstimo registrado nesse período." })
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `relatorio-emprestimos_${inicio}_a_${fim}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setMsgRelatorio({ tipo: "ok", texto: `Relatório gerado com ${total} empréstimo${total === 1 ? "" : "s"}.` })
    } catch (e) {
      setMsgRelatorio({ tipo: "erro", texto: e instanceof Error ? e.message : "Não foi possível gerar o relatório." })
    } finally {
      setGerando(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Estatísticas</h1>
        <p>Visão geral dos livros mais emprestados e dos leitores que mais leem em cada ano.</p>
        {stats?.anos && stats.anos.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <label htmlFor="ano-stats" style={{ fontWeight: 700, color: "#5e4a4a" }}>Ano</label>
            <select
              id="ano-stats"
              className="input-field"
              style={{ width: 130 }}
              value={stats.ano}
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {stats.anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}
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
          { label: "Leitores cadastrados", value: stats?.usuarios ?? 0, color: "#6d1414" },
          { label: stats?.ano ? `Empréstimos em ${stats.ano}` : "Empréstimos no ano", value: stats?.emprestimos ?? 0, color: "#7a1c1c" },
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

      <section className="card relatorio-card">
        <h2 className="relatorio-titulo">Relatório de empréstimos (CSV)</h2>
        <p className="relatorio-desc">
          Baixe a lista de todos os empréstimos feitos no período escolhido, pronta para abrir no Excel.
        </p>

        <div className="relatorio-form">
          <div className="input-group">
            <label htmlFor="relatorio-inicio">De</label>
            <input
              id="relatorio-inicio"
              type="date"
              className="input-field"
              min="2000-01-01"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="relatorio-fim">Até</label>
            <input
              id="relatorio-fim"
              type="date"
              className="input-field"
              min={inicio || "2000-01-01"}
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={baixarRelatorio} disabled={gerando || !inicio || !fim}>
            {gerando ? "Gerando..." : "Baixar relatório (CSV)"}
          </button>
        </div>

        <div className="relatorio-atalhos">
          <span>Atalhos:</span>
          <button type="button" className="btn-secondary" onClick={() => usarPeriodo("ano")}>Ano selecionado</button>
          <button type="button" className="btn-secondary" onClick={() => usarPeriodo("mes")}>Mês atual</button>
          <button type="button" className="btn-secondary" onClick={() => usarPeriodo("30dias")}>Últimos 30 dias</button>
        </div>

        {msgRelatorio && (
          <div className={msgRelatorio.tipo === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginTop: 16 }}>
            {msgRelatorio.texto}
          </div>
        )}
        {avisoRelatorio && <div className="relatorio-aviso">{avisoRelatorio}</div>}
      </section>

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
              Livros mais emprestados (top 5)
            </h2>
          </div>

          {loading ? (
            <div className="feedback-box">Carregando...</div>
          ) : stats?.topLivros.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {stats.topLivros.slice(0, 5).map((livro, index) => (
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
            <div className="feedback-box">Nenhum empréstimo registrado neste ano.</div>
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
              Leitores que mais leem (top 5)
            </h2>
          </div>

          {loading ? (
            <div className="feedback-box">Carregando...</div>
          ) : stats?.topUsuarios.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {stats.topUsuarios.slice(0, 5).map((usuario, index) => (
                <div key={usuario.id} className="report-row">
                  <div>
                    <span className="report-rank">#{index + 1}</span>
                    <strong>{usuario.nome}</strong>
                    <p>{usuario.matricula || usuario.cpf}{usuario.turma ? ` • ${usuario.turma}` : ""}</p>
                  </div>
                  <span className="report-badge">{usuario.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="feedback-box">Nenhum empréstimo registrado neste ano.</div>
          )}
        </section>
      </div>

      <style>{`
        .relatorio-card { padding: 24px; margin-bottom: 36px; background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,248,243,0.92) 100%); }
        .relatorio-titulo { font-family: 'Playfair Display', serif; font-size: 26px; color: #2d1414; line-height: 1.1; margin-bottom: 6px; }
        .relatorio-desc { margin: 0 0 18px; color: #6f5f5f; font-size: 0.95rem; }
        .relatorio-form { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
        .relatorio-form .input-group { display: flex; flex-direction: column; gap: 6px; }
        .relatorio-form .input-field { width: 180px; }
        .relatorio-atalhos { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 14px; color: #7b5d5d; font-weight: 700; font-size: 0.9rem; }
        .relatorio-atalhos .btn-secondary { padding: 6px 14px; font-size: 0.85rem; }
        .relatorio-aviso { margin-top: 12px; padding: 12px 16px; border-radius: 14px; background: #fff4df; border: 1px solid rgba(180,120,20,0.3); color: #6b4a0f; font-size: 0.9rem; font-weight: 600; }
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
