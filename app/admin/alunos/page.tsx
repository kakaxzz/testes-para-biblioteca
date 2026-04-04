"use client"

import { useEffect, useState } from "react"

export default function AdminAlunos() {
  const [nome, setNome] = useState("")
  const [matricula, setMatricula] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [alunos, setAlunos] = useState<any[]>([])
  const [busca, setBusca] = useState("")

  useEffect(() => {
    carregarAlunos()
  }, [])

  async function carregarAlunos() {
    const res = await fetch("/api/alunos")
    if (res.ok) setAlunos(await res.json())
  }

  async function salvarAluno(e: React.FormEvent) {
    e.preventDefault()
    setMensagem("")
    const res = await fetch("/api/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, matricula, whatsapp }),
    })

    if (res.ok) {
      setMensagem(`Aluno "${nome}" cadastrado com sucesso!`)
      setTipoMensagem("ok")
      setNome("")
      setMatricula("")
      setWhatsapp("")
      carregarAlunos()
    } else {
      const d = await res.json()
      setMensagem(d.error || "Erro ao cadastrar aluno.")
      setTipoMensagem("erro")
    }
  }

  const filtrados = alunos.filter(
    (a) =>
      a.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      a.matricula?.includes(busca)
  )

  return (
    <div>
      <div className="page-header">
        <h1>Alunos</h1>
        <p>Cadastre e gerencie os alunos da biblioteca</p>
      </div>

      <div className="admin-grid-2">
        <div className="card">
          <h3 className="section-title">Novo aluno</h3>

          <form onSubmit={salvarAluno}>
            <div className="input-group">
              <label>Nome completo</label>
              <input
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Maria da Silva"
              />
            </div>

            <div className="input-group">
              <label>Matricula</label>
              <input
                className="input-field"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
                placeholder="Ex: 2024001"
              />
            </div>

            <div className="input-group">
              <label>WhatsApp (opcional)</label>
              <input
                className="input-field"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11999999999"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Cadastrar aluno
            </button>
          </form>

          {mensagem && (
            <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"}>
              {mensagem}
            </div>
          )}
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              Alunos cadastrados
              <span className="section-meta">{filtrados.length} encontrados</span>
            </h3>

            <input
              className="input-field"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ maxWidth: 220 }}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matricula</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                      {busca ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado ainda"}
                    </td>
                  </tr>
                )}

                {filtrados.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.nome}</td>
                    <td style={{ color: "#7f6d6d" }}>{a.matricula}</td>
                    <td style={{ color: "#7f6d6d" }}>{a.whatsapp || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
