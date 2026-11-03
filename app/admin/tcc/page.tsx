"use client"

import { useEffect, useState } from "react"
import GenerateToken from "@/components/GenerateToken"

type Trabalho = {
  id: number
  titulo: string
  autor: string
  ano: number
  tipo: string
  resumo?: string | null
}

export default function AdminTcc() {
  const [titulo, setTitulo] = useState("")
  const [autor, setAutor] = useState("")
  const [ano, setAno] = useState(new Date().getFullYear().toString())
  const [tipo, setTipo] = useState("tcc")
  const [resumo, setResumo] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [loading, setLoading] = useState(false)
  const [fileKey, setFileKey] = useState(0)
  const [tccs, setTccs] = useState<Trabalho[]>([])
  // Quando preenchido, o formulário edita este trabalho em vez de cadastrar um novo
  const [editandoId, setEditandoId] = useState<number | null>(null)

  useEffect(() => {
    carregarTccs()
  }, [])

  async function carregarTccs() {
    const res = await fetch("/api/tcc")
    if (res.ok) setTccs(await res.json())
  }

  function limparFormulario() {
    setTitulo("")
    setAutor("")
    setResumo("")
    setTipo("tcc")
    setArquivo(null)
    setFileKey((k) => k + 1)
    setAno(new Date().getFullYear().toString())
  }

  function iniciarEdicao(t: Trabalho) {
    setEditandoId(t.id)
    setTitulo(t.titulo ?? "")
    setAutor(t.autor ?? "")
    setAno(String(t.ano ?? new Date().getFullYear()))
    setTipo(t.tipo === "artigo" ? "artigo" : "tcc")
    setResumo(t.resumo ?? "")
    setArquivo(null)
    setFileKey((k) => k + 1)
    setMensagem("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    limparFormulario()
    setMensagem("")
  }

  async function excluir(t: Trabalho) {
    const ok = window.confirm(`Excluir "${t.titulo}"?\n\nO trabalho e o PDF serão apagados e não poderão ser recuperados.`)
    if (!ok) return

    try {
      const res = await fetch(`/api/tcc/${t.id}`, { method: "DELETE" })
      if (res.ok) {
        if (editandoId === t.id) cancelarEdicao()
        setMensagem("Trabalho excluído.")
        setTipoMensagem("ok")
        carregarTccs()
      } else {
        const d = await res.json().catch(() => null)
        setMensagem(d?.error || "Erro ao excluir.")
        setTipoMensagem("erro")
      }
    } catch {
      setMensagem("Erro de conexão ao excluir.")
      setTipoMensagem("erro")
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const editando = editandoId !== null

    // Ao cadastrar o PDF é obrigatório; ao editar, sem arquivo novo o PDF atual é mantido
    if (!editando && !arquivo) {
      setMensagem("Selecione um arquivo PDF.")
      setTipoMensagem("erro")
      return
    }

    if (arquivo && arquivo.size > 4 * 1024 * 1024) {
      setMensagem("O PDF tem mais de 4 MB. Comprima o arquivo e tente de novo.")
      setTipoMensagem("erro")
      return
    }

    setLoading(true)
    setMensagem("")
    const form = new FormData()
    form.append("titulo", titulo)
    form.append("autor", autor)
    form.append("ano", ano)
    form.append("tipo", tipo)
    form.append("resumo", resumo)
    if (arquivo) form.append("arquivo", arquivo)

    try {
      const res = await fetch(editando ? `/api/tcc/${editandoId}` : "/api/tcc", {
        method: editando ? "PUT" : "POST",
        body: form,
      })

      if (res.ok) {
        setMensagem(editando ? "Alterações salvas!" : "Trabalho cadastrado com sucesso!")
        setTipoMensagem("ok")
        setEditandoId(null)
        limparFormulario()
        carregarTccs()
      } else {
        const d = await res.json().catch(() => null)
        setMensagem(d?.error || (editando ? "Erro ao salvar as alterações." : "Erro ao cadastrar."))
        setTipoMensagem("erro")
      }
    } catch {
      setMensagem("Erro de conexão ao enviar o PDF.")
      setTipoMensagem("erro")
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>TCCs & Artigos</h1>
        <p>Cadastre produções acadêmicas da escola</p>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <GenerateToken />
      </div>

      <div className="admin-grid-2">
        <div className="card">
          <h3 className="section-title">{editandoId !== null ? "Editar trabalho" : "Novo trabalho"}</h3>
          <form onSubmit={salvar}>
            <div className="input-group">
              <label>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="tcc">TCC</option>
                <option value="artigo">Artigo</option>
              </select>
            </div>
            <div className="input-group">
              <label>Título</label>
              <input className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Título do trabalho" />
            </div>
            <div className="input-group">
              <label>Autor</label>
              <input className="input-field" value={autor} onChange={(e) => setAutor(e.target.value)} required placeholder="Nome do autor" />
            </div>
            <div className="input-group">
              <label>Ano</label>
              <input className="input-field" type="number" value={ano} onChange={(e) => setAno(e.target.value)} required min="2000" max="2099" />
            </div>
            <div className="input-group">
              <label>Resumo (opcional)</label>
              <textarea className="input-field" value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="Breve descrição do trabalho..." />
            </div>
            <div className="input-group">
              <label>{editandoId !== null ? "Novo arquivo PDF (opcional)" : "Arquivo PDF"}</label>
              <input key={fileKey} type="file" accept=".pdf,application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="input-field" required={editandoId === null} />
              {editandoId !== null && (
                <span style={{ fontSize: 12.5, color: "#9c8d8d" }}>Deixe em branco para manter o PDF que já está salvo.</span>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading
                ? "Enviando..."
                : editandoId !== null
                  ? "Salvar alterações"
                  : "Cadastrar trabalho"}
            </button>
            {editandoId !== null && (
              <button type="button" className="btn-secondary" style={{ width: "100%", marginTop: 10 }} onClick={cancelarEdicao} disabled={loading}>
                Cancelar edição
              </button>
            )}
          </form>
          {mensagem && <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"}>{mensagem}</div>}
        </div>

        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>
            Trabalhos cadastrados
            <span className="section-meta">{tccs.length} no total</span>
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Autor</th>
                  <th>Ano</th>
                  <th>Tipo</th>
                  <th>PDF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tccs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                      Nenhum trabalho cadastrado
                    </td>
                  </tr>
                )}
                {tccs.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.titulo}</td>
                    <td style={{ color: "#7f6d6d" }}>{t.autor}</td>
                    <td style={{ color: "#7f6d6d" }}>{t.ano}</td>
                    <td>
                      <span className={`badge ${t.tipo === "tcc" ? "badge-red" : "badge-yellow"}`}>
                        {t.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <a href={`/api/tcc/${t.id}/arquivo`} target="_blank" rel="noopener noreferrer" style={{ color: "#8b1e1e", fontSize: 13, fontWeight: 700 }}>
                        Ver PDF
                      </a>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(t)}
                        style={{ background: "none", border: "none", padding: 0, marginRight: 14, color: "#8b1e1e", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(t)}
                        style={{ background: "none", border: "none", padding: 0, color: "#b42318", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Excluir
                      </button>
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