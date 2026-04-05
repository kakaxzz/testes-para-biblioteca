"use client"

import { useEffect, useState } from "react"

export default function AdminEmprestimos() {
  // ── estados: novo empréstimo ──
  const [matricula, setMatricula] = useState("")
  const [isbn, setIsbn] = useState("")
  const [aluno, setAluno] = useState<any>(null)
  const [livro, setLivro] = useState<any>(null)

  // ── estados: lista ──
  const [emprestimos, setEmprestimos] = useState<any[]>([])
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<"abertos" | "todos">("abertos")

  // ── estados: feedback ──
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarEmprestimos()
  }, [filtroStatus])

  async function carregarEmprestimos() {
    const url = filtroStatus === "abertos" ? "/api/emprestimos?abertos=true" : "/api/emprestimos"
    const res = await fetch(url)
    if (res.ok) setEmprestimos(await res.json())
  }

  function exibirMensagem(msg: string, tipo: "ok" | "erro") {
    setMensagem(msg)
    setTipoMensagem(tipo)
    setTimeout(() => setMensagem(""), 4000)
  }

  async function buscarAluno() {
    if (!matricula) return
    const res = await fetch(`/api/alunos?matricula=${matricula}`)
    if (res.ok) setAluno(await res.json())
    else {
      setAluno(null)
      exibirMensagem("Aluno não encontrado.", "erro")
    }
  }

  async function buscarLivro() {
    if (!isbn) return
    const res = await fetch(`/api/livros/${isbn}`)
    if (res.ok) setLivro(await res.json())
    else {
      setLivro(null)
      exibirMensagem("Livro não encontrado.", "erro")
    }
  }

  async function registrarEmprestimo() {
    if (!aluno || !livro) return
    setLoading(true)
    const res = await fetch("/api/emprestimos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId: aluno.id, livroId: livro.id }),
    })
    if (res.ok) {
      exibirMensagem(`Empréstimo registrado: "${livro.titulo}" para ${aluno.nome}`, "ok")
      setAluno(null)
      setLivro(null)
      setMatricula("")
      setIsbn("")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      exibirMensagem(d.error, "erro")
    }
    setLoading(false)
  }

  async function registrarDevolucao(id: number, titulo: string) {
    const res = await fetch("/api/devolucoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emprestimoId: id }),
    })
    if (res.ok) {
      exibirMensagem(`Devolução de "${titulo}" registrada!`, "ok")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      exibirMensagem(d.error, "erro")
    }
  }

  async function renovar(id: number, titulo: string) {
    const res = await fetch("/api/emprestimos/renovar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emprestimoId: id }),
    })
    if (res.ok) {
      exibirMensagem(`Empréstimo de "${titulo}" renovado por mais 10 dias!`, "ok")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      exibirMensagem(d.error, "erro")
    }
  }

  function abrirWhatsApp(e: any) {
    const nome = e.aluno?.nome?.split(" ")[0] || "aluno"
    const titulo = e.livro?.titulo || "o livro"
    const dias = diasDesde(e.dataEmprestimo)
    const prazoRestante = 10 - dias
    const msg =
      prazoRestante < 0
        ? `Ola ${nome}! O livro "${titulo}" esta com ${Math.abs(prazoRestante)} dias de atraso na devolucao.`
        : `Ola ${nome}! Lembrando que o livro "${titulo}" deve ser devolvido em ${prazoRestante} dia(s).`
    const tel = e.aluno?.whatsapp?.replace(/\D/g, "")
    if (!tel) {
      alert("Este aluno nao tem WhatsApp cadastrado.")
      return
    }
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  function diasDesde(data: string) {
    return Math.floor((Date.now() - new Date(data).getTime()) / 86400000)
  }

  function statusPrazo(dias: number) {
    const restante = 10 - dias
    if (restante < 0) return { label: `${Math.abs(restante)}d atrasado`, cor: "#8b1e1e", bg: "#fdf2f2", urgente: true }
    if (restante <= 2) return { label: `vence em ${restante}d`, cor: "#854d0e", bg: "#fff7e8", urgente: true }
    if (restante <= 5) return { label: `${restante}d restantes`, cor: "#854d0e", bg: "#fff7e8", urgente: false }
    return { label: `${restante}d restantes`, cor: "#166534", bg: "#f0faf4", urgente: false }
  }

  const abertos = emprestimos.filter((e) => !e.dataDevolucao)
  const atrasados = abertos.filter((e) => diasDesde(e.dataEmprestimo) > 10)
  const vencendoEmBreve = abertos.filter((e) => {
    const r = 10 - diasDesde(e.dataEmprestimo)
    return r >= 0 && r <= 2
  })

  const filtrados = emprestimos.filter((e) => {
    const termo = busca.toLowerCase()
    return (
      e.aluno?.nome?.toLowerCase().includes(termo) ||
      e.livro?.titulo?.toLowerCase().includes(termo) ||
      e.aluno?.matricula?.includes(termo)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h1>Empréstimos</h1>
        <p>Registre, gerencie e devolva empréstimos em um só lugar</p>
      </div>

      {/* alertas */}
      {(atrasados.length > 0 || vencendoEmBreve.length > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {atrasados.length > 0 && (
            <div className="surface-note error" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#8b1e1e" }}>{atrasados.length} empréstimo(s) em atraso</div>
            </div>
          )}
          {vencendoEmBreve.length > 0 && (
            <div className="surface-note warn" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#854d0e" }}>{vencendoEmBreve.length} empréstimo(s) vencendo em breve</div>
            </div>
          )}
        </div>
      )}

      {mensagem && (
        <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginBottom: 24 }}>
          {mensagem}
        </div>
      )}

      {/* novo empréstimo */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 className="section-title" style={{ marginBottom: 20 }}>Novo empréstimo</h3>
        <div className="admin-grid-2">
          <div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="Matrícula do aluno"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarAluno()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={buscarAluno}>Buscar</button>
            </div>
            {aluno && (
              <div className="surface-note ok" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, color: "#166534" }}>{aluno.nome}</div>
                <div style={{ fontSize: 12, color: "#8aa097" }}>Matrícula: {aluno.matricula}</div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="ISBN do livro"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarLivro()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={buscarLivro}>Buscar</button>
            </div>
            {livro && (
              <div className="surface-note error" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, color: "#8b1e1e" }}>{livro.titulo}</div>
                <div style={{ fontSize: 12, color: "#9b8f8f" }}>{livro.autor}</div>
                {livro.status === "reservado" && (
                  <div style={{ fontSize: 12, color: "#854d0e", marginTop: 4 }}>Este livro pode estar emprestado</div>
                )}
              </div>
            )}
          </div>
        </div>

        {aluno && livro && (
          <div style={{ marginTop: 20, display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <p style={{ fontSize: 15, color: "#5e4a4a", fontWeight: 600 }}>
              Confirmar empréstimo de <strong>"{livro.titulo}"</strong> para <strong>{aluno.nome}</strong>?
            </p>
            <button className="btn-primary" onClick={registrarEmprestimo} disabled={loading}>
              {loading ? "Salvando..." : "Confirmar empréstimo"}
            </button>
          </div>
        )}
      </div>

      {/* lista de empréstimos */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <h3 className="section-title">Empréstimos</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="input-field"
              placeholder="Buscar por aluno ou livro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {(["abertos", "todos"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'Source Sans 3', sans-serif",
                    background: filtroStatus === s ? "#8b1e1e" : "rgba(255,255,255,0.7)",
                    color: filtroStatus === s ? "white" : "#6a2a2a",
                  }}
                >
                  {s === "abertos" ? "Em aberto" : "Todos"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Livro</th>
                <th>Empréstimo</th>
                <th>Prazo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                    {busca ? "Nenhum resultado" : "Nenhum empréstimo encontrado"}
                  </td>
                </tr>
              )}
              {filtrados.map((e: any) => {
                const devolvido = !!e.dataDevolucao
                const prazo = devolvido ? null : statusPrazo(diasDesde(e.dataEmprestimo))
                return (
                  <tr key={e.id} style={{ background: prazo?.urgente ? prazo.bg : undefined }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.aluno?.nome}</div>
                      <div style={{ fontSize: 12, color: "#a09191" }}>{e.aluno?.matricula}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.livro?.titulo}</div>
                      <div style={{ fontSize: 12, color: "#a09191" }}>{e.livro?.autor}</div>
                    </td>
                    <td style={{ color: "#7f6d6d" }}>
                      {new Date(e.dataEmprestimo).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      {devolvido ? (
                        <span className="badge badge-green">Devolvido</span>
                      ) : (
                        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: prazo!.bg, color: prazo!.cor }}>
                          {prazo!.label}
                        </span>
                      )}
                    </td>
                    <td>
                      {devolvido ? (
                        <span style={{ fontSize: 12, color: "#b3a6a6" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn-primary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => registrarDevolucao(e.id, e.livro?.titulo)}>
                            Devolver
                          </button>
                          <button className="btn-secondary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => renovar(e.id, e.livro?.titulo)}>
                            Renovar
                          </button>
                          {e.aluno?.whatsapp && (
                            <button
                              onClick={() => abrirWhatsApp(e)}
                              style={{ padding: "7px 12px", fontSize: 12, background: "#25D366", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontFamily: "'Source Sans 3', sans-serif" }}
                            >
                              WhatsApp
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}