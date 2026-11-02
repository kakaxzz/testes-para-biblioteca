"use client"

import { useEffect, useState } from "react"
import { ModalPortal } from "@/components/ModalPortal"
import { ClassificacaoBadge } from "@/components/ClassificacaoBadge"

type Historico = {
  total: number
  emAberto: number
  ultimos: {
    id: number
    dataEmprestimo: string
    dataDevolucao: string | null
    exemplar: { tombo: number }
    usuario: { nome: string; turma: string | null; tipo: "ALUNO" | "FUNCIONARIO" | "RESPONSAVEL" }
  }[]
}

const TIPO: Record<string, string> = { FUNCIONARIO: "Funcionário", RESPONSAVEL: "Responsável" }
const data = (d: string) => new Date(d).toLocaleDateString("pt-BR")
const tombo = (n: number) => `#${String(n || 0).padStart(7, "0")}`

function Numero({ n, rotulo, destaque }: { n: number | string; rotulo: string; destaque?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#8b1e1e]/10 bg-white/70 px-3 py-2.5">
      <div className={`font-titulo text-2xl font-extrabold leading-none ${destaque ? "text-[#8b1e1e]" : "text-[#2d1414]"}`}>{n}</div>
      <div className="mt-1 text-xs font-bold text-[#7b5d5d]">{rotulo}</div>
    </div>
  )
}

type Props = { livro: any; onClose: () => void; onEditar: () => void }

export function LivroDetalhesModal({ livro, onClose, onEditar }: Props) {
  const [hist, setHist] = useState<Historico | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let cancelado = false
    setHist(null)
    setErro(false)
    fetch(`/api/admin/livros/${encodeURIComponent(livro.isbn)}/emprestimos`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelado && setHist(d))
      .catch(() => !cancelado && setErro(true))
    return () => { cancelado = true }
  }, [livro.isbn])

  useEffect(() => {
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", fechar)
    return () => document.removeEventListener("keydown", fechar)
  }, [onClose])

  const exemplares: { id: number; tombo: number; status: string }[] = livro.exemplares ?? []
  const categorias: string[] = livro.assuntos ? livro.assuntos.split(",").map((c: string) => c.trim()).filter(Boolean) : []
  const meta = [
    ["Editora", livro.editora],
    ["Edição", livro.edicao ? `${livro.edicao}ª` : ""],
    ["Volume", livro.volume],
    ["CDD", livro.cdd],
    ["Cutter", livro.cutter],
    ["Catalogado em", livro.criadoEm ? data(livro.criadoEm) : ""],
  ]

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-surface modal-surface--wide" role="dialog" aria-modal="true" aria-label="Detalhes do livro" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h2 className="font-titulo text-xl">Detalhes do livro</h2>
            <button onClick={onClose} aria-label="Fechar" className="cursor-pointer text-xl text-neutral-400 hover:text-neutral-600">✕</button>
          </div>

          <div className="modal-body space-y-5">
            {/* Identificação */}
            <div className="flex gap-4">
              {livro.capa ? (
                <img src={livro.capa} alt={livro.titulo} className="h-28 w-20 shrink-0 rounded-lg object-cover shadow-md sm:h-36 sm:w-24" />
              ) : (
                <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-[#f0eded] text-2xl sm:h-36 sm:w-24">📖</div>
              )}
              <div className="min-w-0">
                <h3 className="font-titulo text-lg font-bold leading-snug sm:text-xl">
                  {livro.titulo} <ClassificacaoBadge valor={livro.classificacaoIndicativa} className="align-middle" />
                </h3>
                <p className="text-sm text-[#555]">{livro.autor}</p>
                <p className="mt-1 break-all text-xs text-neutral-400">ISBN: {livro.isbn}</p>
              </div>
            </div>

            {/* Números */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Numero n={hist ? hist.total : "…"} rotulo="empréstimos no total" destaque />
              <Numero n={hist ? hist.emAberto : "…"} rotulo="em aberto agora" />
              <Numero n={`${livro.quantidadeDisponivel ?? 0}/${livro.quantidadeTotal ?? exemplares.length}`} rotulo="exemplares disponíveis" />
            </div>

            {/* Últimos empréstimos */}
            <section>
              <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#9d8b8b]">Últimas pessoas que pegaram</h4>
              {erro && <p className="mensagem-erro mt-0!">Não consegui carregar os empréstimos deste livro.</p>}
              {!erro && !hist && <p className="text-sm font-bold text-[#8f7e7e]">Carregando...</p>}
              {hist && hist.ultimos.length === 0 && <p className="text-sm text-neutral-400">Este livro ainda não foi emprestado.</p>}
              {hist && hist.ultimos.length > 0 && (
                <ul className="divide-y divide-[#f3e8e5] rounded-2xl border border-[#8b1e1e]/10 bg-white/70">
                  {hist.ultimos.map((e) => (
                    <li key={e.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{e.usuario.nome}</div>
                        <div className="text-xs text-neutral-500">
                          {[e.usuario.tipo !== "ALUNO" && TIPO[e.usuario.tipo], e.usuario.turma, tombo(e.exemplar.tombo)].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 sm:shrink-0">
                        <span>{data(e.dataEmprestimo)}</span>
                        <span className={`badge ${e.dataDevolucao ? "badge-green" : "badge-yellow"}`}>
                          {e.dataDevolucao ? `Devolvido ${data(e.dataDevolucao)}` : "Em aberto"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {hist && hist.total > hist.ultimos.length && (
                <p className="mt-2 text-xs text-neutral-400">Mostrando os {hist.ultimos.length} mais recentes de {hist.total}.</p>
              )}
            </section>

            {/* Exemplares */}
            <section>
              <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#9d8b8b]">Exemplares</h4>
              <div className="flex flex-wrap gap-2">
                {exemplares.map((ex) => (
                  <span key={ex.id} className={`badge ${ex.status === "disponivel" ? "badge-green" : "badge-yellow"}`}>
                    {tombo(ex.tombo)} · {ex.status === "disponivel" ? "Disponível" : "Emprestado"}
                  </span>
                ))}
              </div>
            </section>

            {/* Dados do livro */}
            <section>
              <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#9d8b8b]">Informações</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                {meta.map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt className="text-xs text-neutral-400">{rotulo}</dt>
                    <dd className="font-semibold">{valor || "—"}</dd>
                  </div>
                ))}
              </dl>
              {categorias.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {categorias.map((c) => <span key={c} className="badge badge-red">{c}</span>)}
                </div>
              )}
              {livro.sinopse && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#555]">{livro.sinopse}</p>}
            </section>
          </div>

          <div className="modal-foot">
            <button className="btn-primary" onClick={onEditar}>✏️ Editar livro</button>
            <button className="btn-secondary" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
