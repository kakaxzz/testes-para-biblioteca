"use client"

import { useState, useRef, useEffect } from "react"
import { CATEGORIAS } from "@/components/CategoriaSelect"
import { ModalPortal } from "@/components/ModalPortal"
import { Code39 } from "@/components/Code39"
import { ClassificacaoBadge } from "@/components/ClassificacaoBadge"
import { LivroCampos, CAMPOS_VAZIOS, camposDoLivro, type CamposLivro } from "@/components/admin/LivroCampos"
import { LivroDetalhesModal } from "@/components/admin/LivroDetalhesModal"
import { Icone } from "@/components/Icone"

const tombo = (n: number) => `#${String(n || 0).padStart(7, "0")}`
const opcional = (v: string) => v || null
const CEL = "text-[13px] text-[#555]"

function Capa({ src, alt, className }: { src?: string | null; alt: string; className: string }) {
  return src
    ? <img src={src} alt={alt} className={`${className} rounded object-cover`} />
    : <div className={`${className} flex items-center justify-center rounded bg-[#f0eded] text-[#8b6b6b]`}><Icone nome="livro" tamanho="1.4em" /></div>
}

function FiltroData({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label className="grid w-[calc(50%-0.25rem)] gap-1 text-[11px] font-semibold text-neutral-500 sm:w-40">
      {rotulo}
      <input type="date" className="input-field" value={valor} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

type AcoesProps = { onEtiqueta: () => void; onDetalhes: () => void; onEditar: () => void; onRemover: () => void }

function Acoes({ onEtiqueta, onDetalhes, onEditar, onRemover }: AcoesProps) {
  const base = "inline-flex cursor-pointer items-center rounded-md border px-2.5 py-1.5 text-xs font-semibold"
  return (
    <div className="flex gap-1.5">
      <button onClick={onDetalhes} title="Ver detalhes" aria-label="Ver detalhes" className={`${base} border-[#e0e0e0] bg-[#f7f6f4] text-[#555]`}><Icone nome="olho" tamanho={17} /></button>
      <button onClick={onEtiqueta} title="Imprimir etiqueta" aria-label="Imprimir etiqueta" className={`${base} border-[#e0e0e0] bg-[#f7f6f4] text-[#555]`}><Icone nome="etiqueta" tamanho={17} /></button>
      <button onClick={onEditar} title="Editar" aria-label="Editar" className={`${base} border-blue-200 bg-blue-50 text-blue-700`}><Icone nome="editar" tamanho={17} /></button>
      <button onClick={onRemover} title="Remover" aria-label="Remover" className={`${base} border-[#8b1e1e]/20 bg-[#fdf2f2] text-[#8b1e1e]`}><Icone nome="lixeira" tamanho={17} /></button>
    </div>
  )
}

export default function AdminLivros() {
  const [aba, setAba] = useState<"cadastrar" | "acervo">("cadastrar")
  const [isbn, setIsbn] = useState("")
  const [livro, setLivro] = useState<any>(null)
  const [campos, setCampos] = useState<CamposLivro>(CAMPOS_VAZIOS)
  const [editando, setEditando] = useState<(CamposLivro & { isbn: string }) | null>(null)
  const [detalhes, setDetalhes] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")
  const [livros, setLivros] = useState<any[]>([])
  const [busca, setBusca] = useState("")
  const [filtroDE, setFiltroDE] = useState("")
  const [filtroATE, setFiltroATE] = useState("")
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [printTrigger, setPrintTrigger] = useState(0)
  const [soDisponiveis, setSoDisponiveis] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const avisar = (texto: string, tipo: "ok" | "erro") => { setMensagem(texto); setTipoMensagem(tipo) }

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
      setLivros(res.ok ? await res.json() : [])
    } catch (error) {
      console.error("Erro ao carregar livros:", error)
      setLivros([])
    }
  }

  async function buscarLivro() {
    const cod = isbn
    if (!cod) return
    setLoading(true); setMensagem(""); setLivro(null)
    const res = await fetch(`/api/buscar-isbn/${cod}`)
    const data = await res.json()
    if (res.ok) {
      setLivro({ ...data, isbn: cod })
      const assuntosApi: string[] = data.assuntos ?? []
      setCampos({
        ...CAMPOS_VAZIOS,
        titulo: data.titulo || "",
        capa: data.capa || "",
        autor: data.autor || "",
        sinopse: data.sinopse || "",
        categorias: assuntosApi.filter((a) => CATEGORIAS.some((c) => c.toLowerCase() === a.toLowerCase())),
        editora: data.editora || "",
        edicao: data.edicao || "",
      })
    } else {
      avisar(data.error, "erro")
    }
    setLoading(false); setIsbn(""); inputRef.current?.focus()
  }

  async function salvarLivro() {
    const { categorias, ...resto } = campos
    const res = await fetch("/api/livros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...livro, ...resto, assuntos: categorias }),
    })
    const data = await res.json()
    if (res.ok) {
      avisar(
        `${data.novoExemplar ? "Novo exemplar adicionado" : "Livro cadastrado"}! Tombo ${tombo(data.tombo)}`,
        "ok"
      )
      setLivro(null)
      setCampos(CAMPOS_VAZIOS)
      carregarLivros()
    } else {
      avisar(data.error, "erro")
    }
    inputRef.current?.focus()
  }

  async function salvarEdicao() {
    if (!editando) return
    const { categorias, ...resto } = editando
    const res = await fetch(`/api/livros/${editando.isbn}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...resto,
        editora: opcional(resto.editora),
        edicao: opcional(resto.edicao),
        cdd: opcional(resto.cdd),
        cutter: opcional(resto.cutter),
        sinopse: opcional(resto.sinopse),
        capa: opcional(resto.capa),
        assuntos: categorias.join(", "),
      }),
    })
    if (res.ok) {
      avisar("Livro atualizado com sucesso!", "ok")
      setEditando(null); carregarLivros()
    } else {
      const d = await res.json(); avisar(d.error, "erro")
    }
  }

  async function removerLivro(isbn: string, titulo: string) {
    if (!confirm(`Remover "${titulo}" do acervo? Esta ação não pode ser desfeita.`)) return
    const res = await fetch(`/api/livros/${isbn}`, { method: "DELETE" })
    if (res.ok) {
      avisar(`"${titulo}" removido do acervo.`, "ok"); carregarLivros()
    } else {
      const d = await res.json(); avisar(d.error, "erro")
    }
  }

  const toggleSelecionado = (id: number) =>
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const toggleTodos = () =>
    setSelecionados(selecionados.length === filtrados.length ? [] : filtrados.map((l) => l.id))

  const imprimir = (ids: number[]) => { setSelecionados(ids); setPrintTrigger((p) => p + 1) }

  const filtrados = livros.filter((l) => {
    const termo = busca.toLowerCase()
    const bateBusca = l.titulo?.toLowerCase().includes(termo) || l.autor?.toLowerCase().includes(termo) || l.isbn?.includes(busca)
    return bateBusca && (!soDisponiveis || (l.quantidadeDisponivel ?? 0) > 0)
  })

  const todosSelecionados = filtrados.length > 0 && selecionados.length === filtrados.length
  const corDisponivel = (l: any) => (l.quantidadeDisponivel === 0 ? "text-[#8b1e1e]" : "text-green-800")

  // ações de um livro, iguais na tabela e nos cartões do celular
  const acoes = (l: any) => (
    <Acoes
      onEtiqueta={() => imprimir([l.id])}
      onDetalhes={() => setDetalhes(l)}
      onEditar={() => setEditando({ isbn: l.isbn, ...camposDoLivro(l) })}
      onRemover={() => removerLivro(l.isbn, l.titulo)}
    />
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
          {livros.filter((l) => selecionados.includes(l.id)).flatMap((l) =>
            (l.exemplares ?? [{ tombo: l.tombo }]).map((ex: any) => (
              <div key={`${l.id}-${ex.tombo}`} className="etiqueta-card">
                <div className="etiqueta-barcode">
                  <Code39 valor={String(l.isbn || ex.tombo || "0")} />
                  <div className="etiqueta-barcode-text">{l.isbn || String(ex.tombo || 0).padStart(7, "0")}</div>
                </div>
                <div className="etiqueta-info">
                  <div className="etiqueta-meta">{l.cdd || "---"}</div>
                  <div className="etiqueta-meta">{l.cutter || "---"}</div>
                  <div className="etiqueta-meta">{l.edicao ? `${l.edicao}ª` : "---"}</div>
                  <div className="etiqueta-meta">{l.criadoEm ? new Date(l.criadoEm).getFullYear() : "---"}</div>
                  <div className="etiqueta-tombo">{tombo(ex.tombo)}</div>
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
          {([["cadastrar", "livros", "Cadastrar livro"], ["acervo", "lista", `Acervo (${livros.length})`]] as const).map(([id, icone, rotulo]) => (
            <button key={id} onClick={() => setAba(id)} className={aba === id ? "active" : ""}><Icone nome={icone} tamanho={18} />{rotulo}</button>
          ))}
        </div>

        {mensagem && <div className={`${tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} mb-5`}>{mensagem}</div>}

        {/* ABA CADASTRAR */}
        {aba === "cadastrar" && (
          <div className="card max-w-[700px]">
            <div className="mb-6 flex gap-2.5">
              <input
                ref={inputRef}
                autoFocus
                className="input-field flex-1"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarLivro()}
                placeholder="Escaneie ou digite o ISBN..."
              />
              <button className="btn-primary shrink-0" onClick={buscarLivro} disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
            </div>

            {livro && (
              <div className="border-t-2 border-[#f0eded] pt-6">
                <div className="mb-5 flex gap-4">
                  {campos.capa && <img src={campos.capa} alt="Capa" className="h-[145px] w-[100px] shrink-0 rounded-lg object-cover shadow-[0_4px_16px_rgba(0,0,0,0.12)]" />}
                  <div className="min-w-0">
                    <h2 className="mb-1 font-titulo text-xl">{livro.titulo}</h2>
                    <p className="text-[13px] text-neutral-400">ISBN: {livro.isbn}</p>
                  </div>
                </div>

                <LivroCampos valores={campos} onChange={(p) => setCampos((c) => ({ ...c, ...p }))} />

                <div className="flex flex-wrap gap-2.5">
                  <button className="btn-primary" onClick={salvarLivro}><Icone nome="salvar" tamanho={18} />Salvar livro</button>
                  <button className="btn-secondary" onClick={() => setLivro(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA ACERVO */}
        {aba === "acervo" && (
          <div className="card">
            <div className="mb-5 flex flex-wrap items-end gap-3">
              <input className="input-field md:max-w-[400px]" placeholder="Buscar por título, autor ou ISBN..." value={busca} onChange={(e) => setBusca(e.target.value)} />
              <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
                <FiltroData rotulo="Catalogado de" valor={filtroDE} onChange={setFiltroDE} />
                <FiltroData rotulo="até" valor={filtroATE} onChange={setFiltroATE} />
                <button className="btn-primary" onClick={() => carregarLivros(filtroDE, filtroATE)}>Filtrar</button>
                {(filtroDE || filtroATE) && (
                  <button className="btn-secondary" onClick={() => { setFiltroDE(""); setFiltroATE(""); carregarLivros() }}>Limpar</button>
                )}
              </div>
              <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[#5e4a4a]">
                <input type="checkbox" checked={soDisponiveis} onChange={(e) => setSoDisponiveis(e.target.checked)} />
                Só livros disponíveis
              </label>
              {selecionados.length > 0 && (
                <button className="btn-primary" onClick={() => imprimir(selecionados)}><Icone nome="etiqueta" tamanho={18} />Imprimir etiquetas ({selecionados.length})</button>
              )}
            </div>

            {/* DETALHES (últimos empréstimos, total...) */}
            {detalhes && (
              <LivroDetalhesModal
                livro={detalhes}
                onClose={() => setDetalhes(null)}
                onEditar={() => { setEditando({ isbn: detalhes.isbn, ...camposDoLivro(detalhes) }); setDetalhes(null) }}
              />
            )}

            {/* MODAL EDITAR */}
            {editando && (
              <ModalPortal>
                <div className="modal-overlay">
                  <div className="modal-surface modal-surface--wide">
                    <div className="modal-head">
                      <h2 className="font-titulo text-xl">Editar livro</h2>
                      <button onClick={() => setEditando(null)} aria-label="Fechar" className="flex cursor-pointer text-neutral-400 hover:text-neutral-600"><Icone nome="x" tamanho={22} /></button>
                    </div>
                    <div className="modal-body">
                      <LivroCampos comTitulo valores={editando} onChange={(p) => setEditando((v) => v && { ...v, ...p })} />
                    </div>
                    <div className="modal-foot">
                      <button className="btn-primary" onClick={salvarEdicao}><Icone nome="salvar" tamanho={18} />Salvar alterações</button>
                      <button className="btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
                    </div>
                  </div>
                </div>
              </ModalPortal>
            )}

            {/* CELULAR / TABLET: um cartão por livro */}
            <div className="md:hidden">
              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#5e4a4a]">
                <input type="checkbox" checked={todosSelecionados} onChange={toggleTodos} />
                Selecionar todos ({filtrados.length})
              </label>
              {filtrados.length === 0 && <p className="py-8 text-center text-neutral-300">Nenhum livro encontrado</p>}
              <div className="space-y-3">
                {filtrados.map((l) => (
                  <article key={l.id} className={`flex gap-3 rounded-2xl border border-[#8b1e1e]/10 p-3 ${selecionados.includes(l.id) ? "bg-[#fdf6f6]" : "bg-white/70"}`}>
                    <input type="checkbox" className="mt-1 shrink-0 self-start" aria-label={`Selecionar ${l.titulo}`} checked={selecionados.includes(l.id)} onChange={() => toggleSelecionado(l.id)} />
                    <Capa src={l.capa} alt={l.titulo} className="h-[58px] w-10 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div>
                        <button onClick={() => setDetalhes(l)} className="cursor-pointer text-left font-semibold leading-snug text-[#261111]">{l.titulo}</button>{" "}
                        <ClassificacaoBadge valor={l.classificacaoIndicativa} />
                        <p className="text-[13px] text-[#555]">{l.autor}</p>
                        <p className="break-all text-[11px] text-neutral-400">{l.isbn}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-bold">
                        <span className={corDisponivel(l)}>{l.quantidadeDisponivel}/{l.quantidadeTotal} disponíveis</span>
                        <span className="text-[#8b1e1e]">{(l.exemplares ?? []).map((e: any) => tombo(e.tombo)).join(", ")}</span>
                      </div>
                      {acoes(l)}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* COMPUTADOR: tabela, uma linha por exemplar */}
            <div className="table-wrap hidden md:block">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="Selecionar todos" checked={todosSelecionados} onChange={toggleTodos} /></th>
                    <th>Tombo</th><th>Capa</th><th>Título</th><th>Autor</th><th>CDD</th><th>Cutter</th><th>Ed.</th><th>Vol.</th><th>Exemplares</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr><td colSpan={11} className="p-8 text-center text-neutral-300">Nenhum livro encontrado</td></tr>
                  )}
                  {filtrados.flatMap((l) =>
                    (l.exemplares ?? [{ tombo: l.tombo, status: "disponivel", id: l.id }]).map((ex: any) => (
                      <tr key={`${l.id}-${ex.id}`} className={selecionados.includes(l.id) ? "bg-[#fdf6f6]" : ""}>
                        <td><input type="checkbox" checked={selecionados.includes(l.id)} onChange={() => toggleSelecionado(l.id)} /></td>
                        <td className="text-[13px] font-bold text-[#8b1e1e]">{tombo(ex.tombo)}</td>
                        <td><Capa src={l.capa} alt={l.titulo} className="h-[46px] w-8" /></td>
                        <td>
                          <button onClick={() => setDetalhes(l)} title="Ver detalhes" className="cursor-pointer text-left font-medium hover:underline">{l.titulo}</button>{" "}
                          <ClassificacaoBadge valor={l.classificacaoIndicativa} />
                          <div className="text-[11px] text-neutral-400">{l.isbn}</div>
                        </td>
                        <td className={CEL}>{l.autor}</td>
                        <td className={CEL}>{l.cdd || "—"}</td>
                        <td className={CEL}>{l.cutter || "—"}</td>
                        <td className={CEL}>{l.edicao ? `${l.edicao}ª` : "—"}</td>
                        <td className={CEL}>{l.volume ? `v.${l.volume}` : "—"}</td>
                        <td>
                          <span className={`text-[13px] font-bold ${corDisponivel(l)}`}>{l.quantidadeDisponivel}/{l.quantidadeTotal}</span>
                          <div className="text-[11px] text-neutral-400">disponíveis</div>
                        </td>
                        <td>{acoes(l)}</td>
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
