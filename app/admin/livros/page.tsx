"use client"

import { useState, useRef, useEffect } from "react"
import { CategoriasSelect, CATEGORIAS } from "@/components/CategoriaSelect"

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

  // categorias como string[] tanto no cadastro quanto na edição
  const [campos, setCampos] = useState({
    capa: "", autor: "", sinopse: "", categorias: [] as string[],
    editora: "", edicao: "", cdd: "", cutter: "", volume: "",
  })
  const [editandoCategorias, setEditandoCategorias] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregarLivros() }, [])

  async function carregarLivros(de?: string, ate?: string) {
    const params = new URLSearchParams()
    if (de) params.set("de", de)
    if (ate) params.set("ate", ate)
    const res = await fetch("/api/livros?" + params.toString())
    if (res.ok) setLivros(await res.json())
  }

  async function buscarLivro(codigo?: string) {
    const cod = codigo || isbn
    if (!cod) return
    setLoading(true); setMensagem(""); setLivro(null)
    const res = await fetch(`/api/buscar-isbn/${cod}`)
    const data = await res.json()
    if (res.ok) {
      setLivro({ ...data, isbn: cod })

      // Tenta mapear categorias da API para as da lista pré-definida
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
        assuntos: campos.categorias, // já é string[], a API faz join internamente
        editora: campos.editora,
        edicao: campos.edicao,
        cdd: campos.cdd,
        cutter: campos.cutter,
        volume: campos.volume,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setMensagem("✅ Livro salvo! Tombo #" + String(data.tombo).padStart(7, "0"))
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
    if (selecionados.length === filtrados.length) {
      setSelecionados([])
    } else {
      setSelecionados(filtrados.map((l: any) => l.id))
    }
  }

  function imprimirSelecionados() {
    setTimeout(() => window.print(), 300)
  }

  const filtrados = livros.filter(l =>
    l.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor?.toLowerCase().includes(busca.toLowerCase()) ||
    l.isbn?.includes(busca)
  )

  return (
    <div>
      <style>{`
        @media print { .admin-shell { display: block !important; } .sidebar, .admin-main-hero, .no-print { display: none !important; } .admin-main, .admin-content { all: unset !important; display: block !important; } .etiqueta-print { display: flex !important; flex-wrap: wrap; align-items: flex-start; justify-content: flex-start; background: white; padding: 8px; } }
        @media screen { .etiqueta-print { display: none; } }
      `}</style>

      {/* ETIQUETAS PARA IMPRESSÃO */}
      {selecionados.length > 0 && (
        <div className="etiqueta-print">
          {livros.filter((l: any) => selecionados.includes(l.id)).map((l: any) => (
            <div key={l.id} style={{
              display: "flex", flexDirection: "row",
              border: "1px solid #000", fontFamily: "monospace",
              fontSize: 10, margin: 4, width: 180, height: 60,
              background: "white"
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", borderRight: "1px solid #000", padding: "3px 4px", flex: 1 }}>
                <svg width="100" height="36" viewBox="0 0 104 36">
                  {String(l.tombo || 1).padStart(7, "0").split("").map((d, i) => {
                    const n = parseInt(d)
                    return Array.from({ length: 4 }).map((_, j) => (
                      <rect key={`${i}-${j}`} x={i * 15 + j * 3.5} y={0} width={j % 2 === 0 ? 2.5 : 1} height={((n + j + 1) % 3 === 0) ? 36 : 26} fill="#000" />
                    ))
                  })}
                </svg>
                <div style={{ fontSize: 7, textAlign: "center", marginTop: 1 }}>{l.titulo || "—"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "4px 6px", gap: 1, minWidth: 52 }}>
                <div style={{ fontWeight: "bold", fontSize: 11 }}>{l.cdd || "---"}</div>
                <div>{l.cutter || "---"}</div>
                <div>{l.edicao ? `${l.edicao}ª` : "---"}</div>
                <div>{l.criadoEm ? new Date(l.criadoEm).getFullYear() : "---"}</div>
                <div style={{ borderTop: "1px solid #000", marginTop: 2, paddingTop: 2, fontWeight: "bold" }}>{String(l.tombo || 0).padStart(7, "0")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="no-print">
        <div className="page-header">
          <h1>Livros</h1>
          <p>Cadastre e gerencie o acervo da biblioteca</p>
        </div>

        {/* Abas */}
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

                {/* ── COMBOBOX DE CATEGORIAS ── */}
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

                  {/* ── COMBOBOX DE CATEGORIAS NO MODAL ── */}
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
                    <th>Tombo</th><th>Capa</th><th>Título</th><th>Autor</th><th>CDD</th><th>Cutter</th><th>Ed.</th><th>Vol.</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr><td colSpan={11} style={{ textAlign: "center", color: "#ccc", padding: 32 }}>Nenhum livro encontrado</td></tr>
                  )}
                  {filtrados.map((l: any) => (
                    <tr key={l.id} style={{ background: selecionados.includes(l.id) ? "#fdf6f6" : undefined }}>
                      <td><input type="checkbox" checked={selecionados.includes(l.id)} onChange={() => toggleSelecionado(l.id)} /></td>
                      <td style={{ fontWeight: 700, color: "#8b1e1e", fontSize: 13 }}>#{String(l.tombo || 0).padStart(7, "0")}</td>
                      <td>{l.capa ? <img src={l.capa} alt={l.titulo} style={{ width: 32, height: 46, objectFit: "cover", borderRadius: 4 }} /> : <div style={{ width: 32, height: 46, background: "#f0eded", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>}</td>
                      <td><div style={{ fontWeight: 500 }}>{l.titulo}</div><div style={{ fontSize: 11, color: "#aaa" }}>{l.isbn}</div></td>
                      <td style={{ fontSize: 13, color: "#555" }}>{l.autor}</td>
                      <td style={{ fontSize: 13, color: "#555" }}>{l.cdd || "—"}</td>
                      <td style={{ fontSize: 13, color: "#555" }}>{l.cutter || "—"}</td>
                      <td style={{ fontSize: 13, color: "#555" }}>{l.edicao ? `${l.edicao}ª` : "—"}</td>
                      <td style={{ fontSize: 13, color: "#555" }}>{l.volume ? `v.${l.volume}` : "—"}</td>
                      <td><span className={`badge ${l.status === "disponivel" ? "badge-green" : "badge-red"}`}>{l.status === "disponivel" ? "Disponível" : "Emprestado"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => { setSelecionados([l.id]); setTimeout(() => window.print(), 300) }} style={{ padding: "5px 10px", background: "#f7f6f4", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🏷️</button>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}