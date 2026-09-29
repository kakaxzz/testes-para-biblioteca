"use client"

import { useState, useRef, useEffect } from "react"
import { CategoriasSelect, CATEGORIAS } from "@/components/CategoriaSelect"
import React from 'react'

export default function AdminLivros() {
  const [aba, setAba] = useState<"cadastrar" | "acervo">("cadastrar")
  const [isbn, setIsbn] = useState("")
  const [livro, setLivro] = useState<any>(null)
  const [editando, setEditando] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [livros, setLivros] = useState<any[]>([])
  const [busca, setBusca] = useState("")
  const [filtroDE, setFiltroDE] = useState("")
  const [filtroATE, setFiltroATE] = useState("")
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [printTrigger, setPrintTrigger] = useState(0)

  const [campos, setCampos] = useState({
    capa: "", autor: "", sinopse: "", categorias: [] as string[],
    editora: "", edicao: "", cdd: "", cutter: "", volume: "",
  })
  const [editandoCategorias, setEditandoCategorias] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  const CODE39_PATTERNS: Record<string, string> = {
    "0": "nnnwwnwnn",
    "1": "wnnwnnnnw",
    "2": "nwnwnnnnw",
    "3": "wwnwnnnnn",
    "4": "nnnwwnnnw",
    "5": "wnnwwnnnn",
    "6": "nwnwwnnnn",
    "7": "nnnwnnwnw",
    "8": "wnnwnnwnn",
    "9": "nwnwnnwnn",
    "*": "nwnnwnwnn",
  }

  function renderCode39Barcode(value: string, width = 130, height = 34) {
    const encoded = `*${String(value || "").toUpperCase()}*`
    const patterns = encoded.split("").map(char => CODE39_PATTERNS[char] || CODE39_PATTERNS["0"])

    const units = patterns.reduce((total, pattern) => {
      const charUnits = pattern.split("").reduce((sum, part) => sum + (part === "n" ? 1 : 2), 0)
      return total + charUnits + 1
    }, -1)

    const scale = width / units
    let x = 0
const bars: React.ReactElement[] = []
    patterns.forEach((pattern, patternIndex) => {
      pattern.split("").forEach((part, idx) => {
        const w = (part === "n" ? 1 : 2) * scale
        if (idx % 2 === 0) {
          bars.push(<rect key={`${patternIndex}-${idx}`} x={x} y={0} width={w} height={height} fill="#000" />)
        }
        x += w
      })
      x += scale
    })

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Código de barras ${value}`}>
        {bars}
      </svg>
    )
  }

  useEffect(() => {
    if (!printTrigger) return
    let timer = 0
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => window.print(), 80)
    })
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer) }
  }, [printTrigger])

  useEffect(() => { carregarLivros() }, [])

  async function carregarLivros(de?: string, ate?: string) {
    try {
      const params = new URLSearchParams()
      if (de) params.set("de", de)
      if (ate) params.set("ate", ate)
      const res = await fetch("/api/livros?" + params.toString())
      if (res.ok) {
        const data = await res.json()
        setLivros(data)
      } else {
        setLivros([])
      }
    } catch (error) {
      console.error("Erro ao carregar livros:", error)
      setLivros([])
    }
  }

  async function buscarLivro(codigo?: string) {
    const cod = codigo || isbn
    if (!cod) return
    setLoading(true); setMensagem(""); setLivro(null)
    const res = await fetch(`/api/buscar-isbn/${cod}`)
    const data = await res.json()
    if (res.ok) {
      setLivro({ ...data, isbn: cod })
      const assuntosApi: string[] = data.assuntos ?? []
      const categoriasMatched = assuntosApi.filter((a: string) =>
        CATEGORIAS.some(c => c.toLowerCase() === a.toLowerCase())
      )
      setCampos({
        capa: data.capa || "",
        autor: data.autor || "",
        sinopse: data.sinopse || "",
        categorias: categoriasMatched,
        editora: data.editora || "",
        edicao: data.edicao || "",
        cdd: "",
        cutter: "",
        volume: "",
      })
    } else {
      setMensagem(data.error)
      setTipoMensagem("erro")
    }
    setLoading(false); setIsbn(""); inputRef.current?.focus()
  }

  async function salvarLivro() {
    const res = await fetch("/api/livros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...livro,
        autor: campos.autor,
        sinopse: campos.sinopse,
        capa: campos.capa,
        assuntos: campos.categorias,
        editora: campos.editora,
        edicao: campos.edicao,
        cdd: campos.cdd,
        cutter: campos.cutter,
        volume: campos.volume,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      const msg = data.novoExemplar
        ? `✅ Novo exemplar adicionado! Tombo #${String(data.tombo).padStart(7, "0")}`
        : `✅ Livro cadastrado! Tombo #${String(data.tombo).padStart(7, "0")}`
      setMensagem(msg)
      setTipoMensagem("ok"); setLivro(null)
      setCampos({ capa: "", autor: "", sinopse: "", categorias: [], editora: "", edicao: "", cdd: "", cutter: "", volume: "" })
      carregarLivros()
    } else {
      setMensagem(data.error); setTipoMensagem("erro")
    }
    inputRef.current?.focus()
  }

  async function salvarEdicao() {
    const res = await fetch(`/api/livros/${editando.isbn}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editando,
        assuntos: editandoCategorias.join(", "),
      }),
    })
    if (res.ok) {
      setMensagem("✅ Livro atualizado com sucesso!")
      setTipoMensagem("ok"); setEditando(null); carregarLivros()
    } else {
      const d = await res.json(); setMensagem(d.error); setTipoMensagem("erro")
    }
  }

  async function removerLivro(isbn: string, titulo: string) {
    if (!confirm(`Remover "${titulo}" do acervo? Esta ação não pode ser desfeita.`)) return
    const res = await fetch(`/api/livros/${isbn}`, { method: "DELETE" })
    if (res.ok) {
      setMensagem(`🗑️ "${titulo}" removido do acervo.`); setTipoMensagem("ok"); carregarLivros()
    } else {
      const d = await res.json(); setMensagem(d.error); setTipoMensagem("erro")
    }
  }

  function toggleSelecionado(id: number) {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleTodos() {
    if (selecionados.length === filtrados.length) setSelecionados([])
    else setSelecionados(filtrados.map((l: any) => l.id))
  }

  function imprimirSelecionados() {
    if (selecionados.length === 0) return
    setPrintTrigger(prev => prev + 1)
  }

  const filtrados = livros.filter(l =>
    l.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor?.toLowerCase().includes(busca.toLowerCase()) ||
    l.isbn?.includes(busca)
  )

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          .admin-shell { display: block !important; }
          .sidebar, .admin-main-hero, .no-print { display: none !important; }
          .admin-main, .admin-content { all: unset !important; display: block !important; }
          .etiqueta-print { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; align-items: flex-start !important; justify-content: flex-start !important; background: white !important; padding: 0 !important; }
          .etiqueta-print > .etiqueta-card { box-sizing: border-box !important; width: 160px !important; min-height: 78px !important; border: 1px solid #000 !important; padding: 4px !important; background: white !important; page-break-inside: avoid !important; break-inside: avoid-column !important; }
          .etiqueta-barcode { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 2px !important; margin-bottom: 4px !important; }
          .etiqueta-barcode-text { font-size: 9px !important; letter-spacing: 0.08em !important; text-align: center !important; }
          .etiqueta-info { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 2px !important; font-size: 9px !important; line-height: 1.1 !important; }
          .etiqueta-meta { font-weight: 700 !important; color: #111 !important; }
          .etiqueta-tombo { font-size: 10px !important; font-weight: 900 !important; text-align: right !important; grid-column: span 2 !important; margin-top: 2px !important; }
        }
        @media screen { .etiqueta-print { display: none; } }
      `}</style>

      {/* ETIQUETAS PARA IMPRESSÃO */}
      {selecionados.length > 0 && (
        <div className="etiqueta-print">
          {livros.filter((l: any) => selecionados.includes(l.id)).flatMap((l: any) =>
            (l.exemplares ?? [{ tombo: l.tombo }]).map((ex: any) => (
              <div key={`${l.id}-${ex.tombo}`} className="etiqueta-card">
                <div className="etiqueta-barcode">
                  {renderCode39Barcode(String(l.isbn || ex.tombo || "0"), 130, 34)}
                  <div className="etiqueta-barcode-text">{l.isbn || String(ex.tombo || 0).padStart(7, "0")}</div>
                </div>
                <div className="etiqueta-info">
                  <div className="etiqueta-meta">{l.cdd || "---"}</div>
                  <div className="etiqueta-meta">{l.cutter || "---"}</div>
                  <div className="etiqueta-meta">{l.edicao ? `${l.edicao}ª` : "---"}</div>
                  <div className="etiqueta-meta">{l.criadoEm ? new Date(l.criadoEm).getFullYear() : "---"}</div>
                  <div className="etiqueta-tombo">#{String(ex.tombo || 0).padStart(7, "0")}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="no-print">
        <div className="page-header">
          <h1>Livros</h1>
          <p>Cadastre e gerencie o acervo da biblioteca</p>
        </div>

        <div className="surface-strip">
          {(["cadastrar", "acervo"] as const).map(a => (
            <button key={a} onClick={() => setAba(a)} className={aba === a ? "active" : ""}>
              {a === "cadastrar" ? "📚 Cadastrar livro" : `📋 Acervo (${livros.length})`}
            </button>
          ))}
        </div>

        {mensagem && <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginBottom: 20 }}>{mensagem}</div>}

        {/* ABA CADASTRAR */}
        {aba === "cadastrar" && (
          <div className="card" style={{ maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input ref={inputRef} autoFocus className="input-field" value={isbn} onChange={e => setIsbn(e.target.value)} onKeyDown={e => e.key === "Enter" && buscarLivro()} placeholder="Escaneie ou digite o ISBN..." style={{ flex: 1 }} />
              <button className="btn-primary" onClick={() => buscarLivro()} disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
            </div>

            {livro && (
              <div style={{ borderTop: "2px solid #f0eded", paddingTop: 24 }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                  {campos.capa && <img src={campos.capa} alt="Capa" style={{ width: 100, height: 145, objectFit: "cover", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 4 }}>{livro.titulo}</h2>
                    <p style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>ISBN: {livro.isbn}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="input-group"><label>Autor</label><input className="input-field" value={campos.autor} onChange={e => setCampos(c => ({ ...c, autor: e.target.value }))} /></div>
                      <div className="input-group"><label>Editora</label><input className="input-field" value={campos.editora} onChange={e => setCampos(c => ({ ...c, editora: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      <div className="input-group"><label>CDD</label><input className="input-field" value={campos.cdd} onChange={e => setCampos(c => ({ ...c, cdd: e.target.value }))} placeholder="Ex: 823.914" /></div>
                      <div className="input-group"><label>Cutter</label><input className="input-field" value={campos.cutter} onChange={e => setCampos(c => ({ ...c, cutter: e.target.value }))} placeholder="Ex: K56c" /></div>
                      <div className="input-group"><label>Edição</label><input className="input-field" value={campos.edicao} onChange={e => setCampos(c => ({ ...c, edicao: e.target.value }))} placeholder="Ex: 3" /></div>
                      <div className="input-group"><label>Volume</label><input className="input-field" value={campos.volume} onChange={e => setCampos(c => ({ ...c, volume: e.target.value }))} placeholder="Ex: 5" /></div>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Assuntos / Categorias</label>
                  <CategoriasSelect
                    value={campos.categorias}
                    onChange={novas => setCampos(c => ({ ...c, categorias: novas }))}
                  />
                </div>

                <div className="input-group"><label>Sinopse</label><textarea className="input-field" value={campos.sinopse} onChange={e => setCampos(c => ({ ...c, sinopse: e.target.value }))} /></div>
                <div className="input-group"><label>URL da Capa</label><input className="input-field" value={campos.capa} onChange={e => setCampos(c => ({ ...c, capa: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-primary" onClick={salvarLivro}>💾 Salvar livro</button>
                  <button className="btn-secondary" onClick={() => setLivro(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA ACERVO */}
        {aba === "acervo" && (
          <div className="card">
            <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <input className="input-field" placeholder="Buscar por título, autor ou ISBN..." value={busca} onChange={e => setBusca(e.target.value)} style={{ maxWidth: 400 }} />
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11, color: "#888", marginBottom: 4, display: "block" }}>Catalogado de</label>
                  <input type="date" className="input-field" value={filtroDE} onChange={e => setFiltroDE(e.target.value)} style={{ width: 160 }} />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11, color: "#888", marginBottom: 4, display: "block" }}>até</label>
                  <input type="date" className="input-field" value={filtroATE} onChange={e => setFiltroATE(e.target.value)} style={{ width: 160 }} />
                </div>
                <button className="btn-primary" onClick={() => carregarLivros(filtroDE, filtroATE)} style={{ height: 38 }}>Filtrar</button>
                {(filtroDE || filtroATE) && (
                  <button className="btn-secondary" onClick={() => { setFiltroDE(""); setFiltroATE(""); carregarLivros() }} style={{ height: 38 }}>Limpar</button>
                )}
              </div>
              {selecionados.length > 0 && (
                <button className="btn-primary" onClick={imprimirSelecionados} style={{ height: 38, background: "#8b1e1e" }}>
                  🏷️ Imprimir etiquetas ({selecionados.length})
                </button>
              )}
            </div>

            {/* MODAL EDITAR */}
            {editando && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="modal-surface">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Editar livro</h2>
                    <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>✕</button>
                  </div>
                  <div className="input-group"><label>Título</label><input className="input-field" value={editando.titulo} onChange={e => setEditando((v: any) => ({ ...v, titulo: e.target.value }))} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="input-group"><label>Autor</label><input className="input-field" value={editando.autor || ""} onChange={e => setEditando((v: any) => ({ ...v, autor: e.target.value }))} /></div>
                    <div className="input-group"><label>Editora</label><input className="input-field" value={editando.editora || ""} onChange={e => setEditando((v: any) => ({ ...v, editora: e.target.value }))} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    <div className="input-group"><label>CDD</label><input className="input-field" value={editando.cdd || ""} onChange={e => setEditando((v: any) => ({ ...v, cdd: e.target.value }))} /></div>
                    <div className="input-group"><label>Cutter</label><input className="input-field" value={editando.cutter || ""} onChange={e => setEditando((v: any) => ({ ...v, cutter: e.target.value }))} /></div>
                    <div className="input-group"><label>Edição</label><input className="input-field" value={editando.edicao || ""} onChange={e => setEditando((v: any) => ({ ...v, edicao: e.target.value }))} /></div>
                    <div className="input-group"><label>Volume</label><input className="input-field" value={editando.volume || ""} onChange={e => setEditando((v: any) => ({ ...v, volume: e.target.value }))} /></div>
                  </div>
                  <div className="input-group">
                    <label>Assuntos / Categorias</label>
                    <CategoriasSelect
                      value={editandoCategorias}
                      onChange={setEditandoCategorias}
                    />
                  </div>
                  <div className="input-group"><label>Sinopse</label><textarea className="input-field" value={editando.sinopse || ""} onChange={e => setEditando((v: any) => ({ ...v, sinopse: e.target.value }))} /></div>
                  <div className="input-group"><label>URL da Capa</label><input className="input-field" value={editando.capa || ""} onChange={e => setEditando((v: any) => ({ ...v, capa: e.target.value }))} /></div>
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
                    <th><input type="checkbox" checked={filtrados.length > 0 && selecionados.length === filtrados.length} onChange={toggleTodos} /></th>
                    <th>Tombo</th><th>Capa</th><th>Título</th><th>Autor</th><th>CDD</th><th>Cutter</th><th>Ed.</th><th>Vol.</th><th>Exemplares</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr><td colSpan={11} style={{ textAlign: "center", color: "#ccc", padding: 32 }}>Nenhum livro encontrado</td></tr>
                  )}
                  {filtrados.flatMap((l: any) =>
                    (l.exemplares ?? [{ tombo: l.tombo, status: "disponivel", id: l.id }]).map((ex: any) => (
                      <tr key={`${l.id}-${ex.id}`} style={{ background: selecionados.includes(l.id) ? "#fdf6f6" : undefined }}>
                        <td><input type="checkbox" checked={selecionados.includes(l.id)} onChange={() => toggleSelecionado(l.id)} /></td>
                        <td style={{ fontWeight: 700, color: "#8b1e1e", fontSize: 13 }}>#{String(ex.tombo || 0).padStart(7, "0")}</td>
                        <td>{l.capa ? <img src={l.capa} alt={l.titulo} style={{ width: 32, height: 46, objectFit: "cover", borderRadius: 4 }} /> : <div style={{ width: 32, height: 46, background: "#f0eded", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>}</td>
                        <td><div style={{ fontWeight: 500 }}>{l.titulo}</div><div style={{ fontSize: 11, color: "#aaa" }}>{l.isbn}</div></td>
                        <td style={{ fontSize: 13, color: "#555" }}>{l.autor}</td>
                        <td style={{ fontSize: 13, color: "#555" }}>{l.cdd || "—"}</td>
                        <td style={{ fontSize: 13, color: "#555" }}>{l.cutter || "—"}</td>
                        <td style={{ fontSize: 13, color: "#555" }}>{l.edicao ? `${l.edicao}ª` : "—"}</td>
                        <td style={{ fontSize: 13, color: "#555" }}>{l.volume ? `v.${l.volume}` : "—"}</td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: 13, color: l.quantidadeDisponivel === 0 ? "#8b1e1e" : "#166534" }}>
                            {l.quantidadeDisponivel}/{l.quantidadeTotal}
                          </span>
                          <div style={{ fontSize: 11, color: "#aaa" }}>disponíveis</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setSelecionados([l.id]); setPrintTrigger(prev => prev + 1) }} style={{ padding: "5px 10px", background: "#f7f6f4", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🏷️</button>
                            <button
                              onClick={() => {
                                setEditando({ ...l })
                                const cats = l.assuntos
                                  ? l.assuntos.split(",").map((c: string) => c.trim()).filter(Boolean)
                                  : []
                                setEditandoCategorias(cats)
                              }}
                              style={{ padding: "5px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}
                            >✏️</button>
                            <button onClick={() => removerLivro(l.isbn, l.titulo)} style={{ padding: "5px 10px", background: "#fdf2f2", border: "1px solid rgba(139,30,30,0.2)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#8b1e1e" }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}