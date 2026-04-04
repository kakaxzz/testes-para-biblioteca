"use client"

import { useEffect, useState } from "react"

export default function AdminEmprestimos() {
  const [matricula, setMatricula] = useState("")
  const [isbn, setIsbn] = useState("")
  const [aluno, setAluno] = useState<any>(null)
  const [livro, setLivro] = useState<any>(null)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [emprestimos, setEmprestimos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarEmprestimos()
  }, [])

  async function carregarEmprestimos() {
    const res = await fetch("/api/emprestimos")
    if (res.ok) setEmprestimos(await res.json())
  }

  async function buscarAluno() {
    if (!matricula) return
    const res = await fetch(`/api/alunos?matricula=${matricula}`)
    if (res.ok) setAluno(await res.json())
    else {
      setAluno(null)
      setMensagem("Aluno nao encontrado.")
      setTipoMensagem("erro")
    }
  }

  async function buscarLivro() {
    if (!isbn) return
    const res = await fetch(`/api/livros/${isbn}`)
    if (res.ok) setLivro(await res.json())
    else {
      setLivro(null)
      setMensagem("Livro nao encontrado.")
      setTipoMensagem("erro")
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
      setMensagem(`Emprestimo registrado: "${livro.titulo}" para ${aluno.nome}`)
      setTipoMensagem("ok")
      setAluno(null)
      setLivro(null)
      setMatricula("")
      setIsbn("")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      setMensagem(d.error)
      setTipoMensagem("erro")
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Emprestimos</h1>
        <p>Registre a saida de livros para alunos</p>
      </div>

      <div className="admin-grid-2-wide">
        <div className="card">
          <h3 className="section-title">Aluno</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              placeholder="Matricula do aluno"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarAluno()}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={buscarAluno}>
              Buscar
            </button>
          </div>

          {aluno && (
            <div className="surface-note ok" style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, color: "#166534" }}>{aluno.nome}</div>
              <div style={{ fontSize: 12, color: "#8aa097" }}>Matricula: {aluno.matricula}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title">Livro</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field"
              placeholder="ISBN do livro"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarLivro()}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={buscarLivro}>
              Buscar
            </button>
          </div>

          {livro && (
            <div className="surface-note error" style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, color: "#8b1e1e" }}>{livro.titulo}</div>
              <div style={{ fontSize: 12, color: "#9b8f8f" }}>{livro.autor}</div>
              {livro.status === "reservado" && (
                <div style={{ fontSize: 12, color: "#854d0e", marginTop: 4 }}>
                  Este livro pode estar emprestado
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mensagem && (
        <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginBottom: 24 }}>
          {mensagem}
        </div>
      )}

      {aluno && livro && (
        <div className="card" style={{ marginBottom: 32, display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <p style={{ fontSize: 15, color: "#5e4a4a", fontWeight: 600 }}>
            Confirmar emprestimo de <strong>"{livro.titulo}"</strong> para <strong>{aluno.nome}</strong>?
          </p>
          <button className="btn-primary" onClick={registrarEmprestimo} disabled={loading}>
            {loading ? "Salvando..." : "Confirmar emprestimo"}
          </button>
        </div>
      )}

      <div className="card">
        <h3 className="section-title">Emprestimos ativos</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Livro</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                    Nenhum emprestimo registrado
                  </td>
                </tr>
              )}

              {emprestimos.map((e: any) => (
                <tr key={e.id}>
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
                    <span className={`badge ${e.dataDevolucao ? "badge-green" : "badge-red"}`}>
                      {e.dataDevolucao ? "Devolvido" : "Em aberto"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
