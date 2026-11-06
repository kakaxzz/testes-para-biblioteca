"use client"

import { useEffect, useState } from "react"
import GenerateToken from "@/components/GenerateToken"
import { Icone } from "@/components/Icone"
import { ModalPortal } from "@/components/ModalPortal"
import { CURSOS_TCC, rotuloCurso } from "@/lib/tcc"

type Trabalho = {
  id: number
  titulo: string
  autor: string
  ano: number
  tipo: string
  curso?: string | null
  resumo?: string | null
}

type Valores = {
  titulo: string
  autor: string
  ano: string
  tipo: string
  curso: string
  resumo: string
}

const anoAtual = () => new Date().getFullYear().toString()

const valoresVazios = (): Valores => ({
  titulo: "",
  autor: "",
  ano: anoAtual(),
  tipo: "tcc",
  curso: "",
  resumo: "",
})

function CamposTcc({ valores, onChange }: { valores: Valores; onChange: (p: Partial<Valores>) => void }) {
  return (
    <>
      <div className="input-group">
        <label>Tipo</label>
        <select className="input-field" value={valores.tipo} onChange={(e) => onChange({ tipo: e.target.value })}>
          <option value="tcc">TCC</option>
          <option value="artigo">Artigo</option>
        </select>
      </div>
      <div className="input-group">
        <label>Curso</label>
        <select className="input-field" value={valores.curso} onChange={(e) => onChange({ curso: e.target.value })} required>
          <option value="" disabled>Selecione o curso</option>
          {CURSOS_TCC.map((c) => (
            <option key={c.valor} value={c.valor}>{c.rotulo}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Título</label>
        <input className="input-field" value={valores.titulo} onChange={(e) => onChange({ titulo: e.target.value })} required placeholder="Título do trabalho" />
      </div>
      <div className="input-group">
        <label>Autor</label>
        <input className="input-field" value={valores.autor} onChange={(e) => onChange({ autor: e.target.value })} required placeholder="Nome do autor" />
      </div>
      <div className="input-group">
        <label>Ano</label>
        <input className="input-field" type="number" value={valores.ano} onChange={(e) => onChange({ ano: e.target.value })} required min="2000" max="2099" />
      </div>
      <div className="input-group">
        <label>Resumo (opcional)</label>
        <textarea className="input-field" value={valores.resumo} onChange={(e) => onChange({ resumo: e.target.value })} placeholder="Breve descrição do trabalho..." />
      </div>
    </>
  )
}

function montarForm(valores: Valores, arquivo: File | null) {
  const form = new FormData()
  form.append("titulo", valores.titulo)
  form.append("autor", valores.autor)
  form.append("ano", valores.ano)
  form.append("tipo", valores.tipo)
  form.append("curso", valores.curso)
  form.append("resumo", valores.resumo)
  if (arquivo) form.append("arquivo", arquivo)
  return form
}

export default function AdminTcc() {
  const [novo, setNovo] = useState<Valores>(valoresVazios)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [loading, setLoading] = useState(false)
  const [tccs, setTccs] = useState<Trabalho[]>([])

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [edicao, setEdicao] = useState<Valores>(valoresVazios)
  const [arquivoEdicao, setArquivoEdicao] = useState<File | null>(null)
  const [fileKeyEdicao, setFileKeyEdicao] = useState(0)
  const [erroEdicao, setErroEdicao] = useState("")
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  useEffect(() => {
    carregarTccs()
  }, [])

  async function carregarTccs() {
    const res = await fetch("/api/tcc")
    if (res.ok) setTccs(await res.json())
  }

  function iniciarEdicao(t: Trabalho) {
    setEditandoId(t.id)
    setEdicao({
      titulo: t.titulo ?? "",
      autor: t.autor ?? "",
      ano: String(t.ano ?? anoAtual()),
      tipo: t.tipo === "artigo" ? "artigo" : "tcc",
      curso: CURSOS_TCC.some((c) => c.valor === t.curso) ? (t.curso as string) : "",
      resumo: t.resumo ?? "",
    })
    setArquivoEdicao(null)
    setFileKeyEdicao((k) => k + 1)
    setErroEdicao("")
  }

  function fecharEdicao() {
    setEditandoId(null)
    setErroEdicao("")
  }

  async function excluir(t: Trabalho) {
    const ok = window.confirm(`Excluir "${t.titulo}"?\n\nO trabalho e o PDF serão apagados e não poderão ser recuperados.`)
    if (!ok) return

    try {
      const res = await fetch(`/api/tcc/${t.id}`, { method: "DELETE" })
      if (res.ok) {
        if (editandoId === t.id) fecharEdicao()
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

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault()

    if (!arquivo) {
      setMensagem("Selecione um arquivo PDF.")
      setTipoMensagem("erro")
      return
    }

    if (arquivo.size > 4 * 1024 * 1024) {
      setMensagem("O PDF tem mais de 4 MB. Comprima o arquivo e tente de novo.")
      setTipoMensagem("erro")
      return
    }

    setLoading(true)
    setMensagem("")

    try {
      const res = await fetch("/api/tcc", { method: "POST", body: montarForm(novo, arquivo) })

      if (res.ok) {
        setMensagem("Trabalho cadastrado com sucesso!")
        setTipoMensagem("ok")
        setNovo(valoresVazios())
        setArquivo(null)
        setFileKey((k) => k + 1)
        carregarTccs()
      } else {
        const d = await res.json().catch(() => null)
        setMensagem(d?.error || "Erro ao cadastrar.")
        setTipoMensagem("erro")
      }
    } catch {
      setMensagem("Erro de conexão ao enviar o PDF.")
      setTipoMensagem("erro")
    }
    setLoading(false)
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId === null) return

    if (arquivoEdicao && arquivoEdicao.size > 4 * 1024 * 1024) {
      setErroEdicao("O PDF tem mais de 4 MB. Comprima o arquivo e tente de novo.")
      return
    }

    setSalvandoEdicao(true)
    setErroEdicao("")

    try {
      const res = await fetch(`/api/tcc/${editandoId}`, { method: "PUT", body: montarForm(edicao, arquivoEdicao) })

      if (res.ok) {
        fecharEdicao()
        setMensagem("Alterações salvas!")
        setTipoMensagem("ok")
        carregarTccs()
      } else {
        const d = await res.json().catch(() => null)
        setErroEdicao(d?.error || "Erro ao salvar as alterações.")
      }
    } catch {
      setErroEdicao("Erro de conexão ao enviar o PDF.")
    }
    setSalvandoEdicao(false)
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
          <h3 className="section-title">Novo trabalho</h3>
          <form onSubmit={cadastrar}>
            <CamposTcc valores={novo} onChange={(p) => setNovo((v) => ({ ...v, ...p }))} />
            <div className="input-group">
              <label>Arquivo PDF</label>
              <input key={fileKey} type="file" accept=".pdf,application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="input-field" required />
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

          {editandoId !== null && (
            <ModalPortal>
              <div className="modal-overlay">
                <div className="modal-surface modal-surface--wide">
                  <div className="modal-head">
                    <h2 className="font-titulo text-xl">Editar trabalho</h2>
                    <button onClick={fecharEdicao} aria-label="Fechar" className="flex cursor-pointer text-neutral-400 hover:text-neutral-600"><Icone nome="x" tamanho={22} /></button>
                  </div>
                  <div className="modal-body">
                    <form id="form-editar-tcc" onSubmit={salvarEdicao}>
                      <CamposTcc valores={edicao} onChange={(p) => setEdicao((v) => ({ ...v, ...p }))} />
                      <div className="input-group">
                        <label>Novo arquivo PDF (opcional)</label>
                        <input key={fileKeyEdicao} type="file" accept=".pdf,application/pdf" onChange={(e) => setArquivoEdicao(e.target.files?.[0] || null)} className="input-field" />
                        <span style={{ fontSize: 12.5, color: "#9c8d8d" }}>Deixe em branco para manter o PDF que já está salvo.</span>
                      </div>
                      {erroEdicao && <div className="mensagem-erro">{erroEdicao}</div>}
                    </form>
                  </div>
                  <div className="modal-foot">
                    <button type="submit" form="form-editar-tcc" className="btn-primary" disabled={salvandoEdicao}>
                      <Icone nome="salvar" tamanho={18} />{salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={fecharEdicao} disabled={salvandoEdicao}>Cancelar</button>
                  </div>
                </div>
              </div>
            </ModalPortal>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Ano</th>
                  <th>Curso</th>
                  <th>Tipo</th>
                  <th>PDF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tccs.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                      Nenhum trabalho cadastrado
                    </td>
                  </tr>
                )}
                {tccs.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.titulo}</td>
                    <td style={{ color: "#7f6d6d" }}>{t.autor}</td>
                    <td style={{ color: "#7f6d6d" }}>{t.ano}</td>
                    <td style={{ color: "#7f6d6d" }}>{rotuloCurso(t.curso)}</td>
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
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => iniciarEdicao(t)}
                          style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Icone nome="editar" tamanho={17} />
                        </button>
                        <button
                          onClick={() => excluir(t)}
                          style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", background: "#fdf2f2", border: "1px solid rgba(139,30,30,0.2)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#8b1e1e" }}
                          title="Excluir"
                          aria-label="Excluir"
                        >
                          <Icone nome="lixeira" tamanho={17} />
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
