"use client"

import { useEffect, useState } from "react"

type Tipo = "ALUNO" | "FUNCIONARIO" | "RESPONSAVEL"

const TIPO_LABEL: Record<Tipo, string> = {
  ALUNO: "Aluno",
  FUNCIONARIO: "Funcionário",
  RESPONSAVEL: "Responsável",
}

export default function AdminUsuarios() {
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState<Tipo>("ALUNO")
  const [matricula, setMatricula] = useState("")
  const [cpf, setCpf] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<Tipo | "TODOS">("TODOS")
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    const res = await fetch("/api/usuarios")
    if (res.ok) setUsuarios(await res.json())
  }

  async function salvarUsuario(e: React.FormEvent) {
    e.preventDefault()
    setMensagem("")
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        tipo,
        matricula: tipo === "ALUNO" ? matricula : undefined,
        cpf: tipo !== "ALUNO" ? cpf : undefined,
        whatsapp,
      }),
    })

    if (res.ok) {
      setMensagem(`${TIPO_LABEL[tipo]} "${nome}" cadastrado com sucesso!`)
      setTipoMensagem("ok")
      setNome("")
      setMatricula("")
      setCpf("")
      setWhatsapp("")
      carregarUsuarios()
    } else {
      const d = await res.json()
      setMensagem(d.error || "Erro ao cadastrar usuário.")
      setTipoMensagem("erro")
    }
  }

  async function salvarEdicao() {
    if (!editando) return
    const res = await fetch(`/api/usuarios/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: editando.nome,
        tipo: editando.tipo,
        matricula: editando.tipo === "ALUNO" ? editando.matricula : undefined,
        cpf: editando.tipo !== "ALUNO" ? editando.cpf : undefined,
        whatsapp: editando.whatsapp,
      }),
    })

    if (res.ok) {
      setMensagem("✅ Usuário atualizado com sucesso!")
      setTipoMensagem("ok")
      setEditando(null)
      carregarUsuarios()
    } else {
      const d = await res.json()
      setMensagem(d.error || "Erro ao atualizar usuário.")
      setTipoMensagem("erro")
    }
  }

  async function removerUsuario(id: number, nome: string) {
    if (!confirm(`Remover "${nome}"? Esta ação não pode ser desfeita.`)) return
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
    if (res.ok) {
      setMensagem(`🗑️ "${nome}" removido.`)
      setTipoMensagem("ok")
      carregarUsuarios()
    } else {
      const d = await res.json()
      setMensagem(d.error || "Erro ao remover usuário.")
      setTipoMensagem("erro")
    }
  }

  const filtrados = usuarios.filter((u) => {
    const bateBusca =
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.matricula?.includes(busca) ||
      u.cpf?.includes(busca)
    const bateTipo = filtroTipo === "TODOS" || u.tipo === filtroTipo
    return bateBusca && bateTipo
  })

  return (
    <div>
      <div className="page-header">
        <h1>Usuários</h1>
        <p>Cadastre e gerencie alunos, funcionários e responsáveis</p>
      </div>

      <div className="admin-grid-2">
        <div className="card">
          <h3 className="section-title">Novo usuário</h3>

          <form onSubmit={salvarUsuario}>
            <div className="input-group">
              <label>Tipo</label>
              <select
                className="input-field"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Tipo)}
              >
                <option value="ALUNO">Aluno</option>
                <option value="FUNCIONARIO">Funcionário</option>
                <option value="RESPONSAVEL">Responsável</option>
              </select>
            </div>

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

            {tipo === "ALUNO" ? (
              <div className="input-group">
                <label>Matrícula</label>
                <input
                  className="input-field"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required
                  placeholder="Ex: 2024001"
                />
              </div>
            ) : (
              <div className="input-group">
                <label>CPF</label>
                <input
                  className="input-field"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  placeholder="Ex: 000.000.000-00"
                />
              </div>
            )}

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
              Cadastrar {TIPO_LABEL[tipo].toLowerCase()}
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
              Usuários cadastrados
              <span className="section-meta">{filtrados.length} encontrados</span>
            </h3>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                className="input-field"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as Tipo | "TODOS")}
                style={{ maxWidth: 170 }}
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="ALUNO">Alunos</option>
                <option value="FUNCIONARIO">Funcionários</option>
                <option value="RESPONSAVEL">Responsáveis</option>
              </select>

              <input
                className="input-field"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ maxWidth: 220 }}
              />
            </div>
          </div>

          {/* MODAL EDITAR */}
          {editando && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="modal-surface">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Editar usuário</h2>
                  <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>✕</button>
                </div>

                <div className="input-group">
                  <label>Tipo</label>
                  <select
                    className="input-field"
                    value={editando.tipo}
                    onChange={(e) => setEditando((v: any) => ({ ...v, tipo: e.target.value }))}
                  >
                    <option value="ALUNO">Aluno</option>
                    <option value="FUNCIONARIO">Funcionário</option>
                    <option value="RESPONSAVEL">Responsável</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Nome completo</label>
                  <input
                    className="input-field"
                    value={editando.nome || ""}
                    onChange={(e) => setEditando((v: any) => ({ ...v, nome: e.target.value }))}
                  />
                </div>

                {editando.tipo === "ALUNO" ? (
                  <div className="input-group">
                    <label>Matrícula</label>
                    <input
                      className="input-field"
                      value={editando.matricula || ""}
                      onChange={(e) => setEditando((v: any) => ({ ...v, matricula: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <label>CPF</label>
                    <input
                      className="input-field"
                      value={editando.cpf || ""}
                      onChange={(e) => setEditando((v: any) => ({ ...v, cpf: e.target.value }))}
                    />
                  </div>
                )}

                <div className="input-group">
                  <label>WhatsApp (opcional)</label>
                  <input
                    className="input-field"
                    value={editando.whatsapp || ""}
                    onChange={(e) => setEditando((v: any) => ({ ...v, whatsapp: e.target.value }))}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-primary" onClick={salvarEdicao}>💾 Salvar alterações</button>
                  <button className="btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Matrícula/CPF</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                      {busca ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado ainda"}
                    </td>
                  </tr>
                )}

                {filtrados.map((u: any) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nome}</td>
                    <td>
                      <span className="badge badge-green">{TIPO_LABEL[u.tipo as Tipo] ?? u.tipo}</span>
                    </td>
                    <td style={{ color: "#7f6d6d" }}>{u.matricula || u.cpf || "-"}</td>
                    <td style={{ color: "#7f6d6d" }}>{u.whatsapp || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setEditando({ ...u })}
                          style={{ padding: "5px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removerUsuario(u.id, u.nome)}
                          style={{ padding: "5px 10px", background: "#fdf2f2", border: "1px solid rgba(139,30,30,0.2)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#8b1e1e" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
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
