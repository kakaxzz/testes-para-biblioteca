"use client"

import { useEffect, useState } from "react"

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
  const [tccs, setTccs] = useState<any[]>([])

  useEffect(() => {
    carregarTccs()
  }, [])

  async function carregarTccs() {
    const res = await fetch("/api/tcc")
    if (res.ok) setTccs(await res.json())
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!arquivo) {
      setMensagem("Selecione um arquivo PDF.")
      setTipoMensagem("erro")
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append("titulo", titulo)
    form.append("autor", autor)
    form.append("ano", ano)
    form.append("tipo", tipo)
    form.append("resumo", resumo)
    form.append("arquivo", arquivo)

    const res = await fetch("/api/tcc", { method: "POST", body: form })

    if (res.ok) {
      setMensagem("Trabalho cadastrado com sucesso!")
      setTipoMensagem("ok")
      setTitulo("")
      setAutor("")
      setResumo("")
      setArquivo(null)
      setAno(new Date().getFullYear().toString())
      carregarTccs()
    } else {
      const d = await res.json()
      setMensagem(d.error || "Erro ao cadastrar.")
      setTipoMensagem("erro")
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>TCCs & Artigos</h1>
        <p>Cadastre producoes academicas da escola</p>
      </div>

      <div className="admin-grid-2">
        <div className="card">
          <h3 className="section-title">Novo trabalho</h3>
          <form onSubmit={salvar}>
            <div className="input-group">
              <label>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="tcc">TCC</option>
                <option value="artigo">Artigo</option>
              </select>
            </div>
            <div className="input-group">
              <label>Titulo</label>
              <input className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Titulo do trabalho" />
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
              <textarea className="input-field" value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="Breve descricao do trabalho..." />
            </div>
            <div className="input-group">
              <label>Arquivo PDF</label>
              <input type="file" accept=".pdf" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Enviando..." : "Cadastrar trabalho"}
            </button>
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
                </tr>
              </thead>
              <tbody>
                {tccs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                      Nenhum trabalho cadastrado
                    </td>
                  </tr>
                )}
                {tccs.map((t: any) => (
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
                      <a href={`/uploads/${t.arquivo}`} target="_blank" rel="noopener noreferrer" style={{ color: "#8b1e1e", fontSize: 13, fontWeight: 700 }}>
                        Ver PDF
                      </a>
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
