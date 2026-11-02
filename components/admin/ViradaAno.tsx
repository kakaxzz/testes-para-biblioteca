"use client"

import { useEffect, useState } from "react"

type Linha = {
  turma: string
  destino: "promover" | "remover" | "manter"
  novaTurma: string | null
  alunos: number
  comLivroEmAberto: number
}

type Plano = {
  ano: number
  executavel: boolean
  motivo: string | null
  executadaEm: string | null
  totais: { promover: number; remover: number; bloqueados: number; semMudanca: number }
  turmas: Linha[]
}

const rotulo = (l: Linha) =>
  l.destino === "promover" ? `vai para ${l.novaTurma}` : l.destino === "remover" ? "sai da escola (será apagado)" : "sem mudança"

export function ViradaAno() {
  const [plano, setPlano] = useState<Plano | null>(null)
  const [loading, setLoading] = useState(true)
  const [executando, setExecutando] = useState(false)
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null)

  async function carregar() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/virada")
      if (res.ok) setPlano(await res.json())
    } catch {
      setPlano(null)
    }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function executar() {
    if (!plano) return
    const { remover, promover } = plano.totais
    const ok = confirm(
      `Executar a virada de ${plano.ano} para ${plano.ano + 1} agora?\n\n` +
      `• ${promover} aluno(s) mudam de turma\n` +
      `• ${remover} aluno(s) serão APAGADOS, com o histórico de empréstimos\n\n` +
      `Isso não pode ser desfeito. Baixe um backup antes.`
    )
    if (!ok) return
    setExecutando(true)
    setMensagem(null)
    const res = await fetch("/api/admin/virada", { method: "POST" })
    const data = await res.json()
    if (res.ok && data.ok) {
      setMensagem({ ok: true, texto: `✅ Virada feita: ${data.promovidos} promovidos, ${data.removidos} removidos, ${data.pendentes} com livro em aberto (ficaram).` })
    } else {
      setMensagem({ ok: false, texto: data.motivo || data.error || "Erro ao executar a virada." })
    }
    setExecutando(false)
    carregar()
  }

  const resumo = plano && [
    { n: plano.totais.promover, t: "mudam de turma" },
    { n: plano.totais.remover, t: "serão apagados" },
    { n: plano.totais.bloqueados, t: "com livro em aberto (ficam)" },
    { n: plano.totais.semMudanca, t: "sem mudança (turma antiga/vazia)" },
  ]

  return (
    <div className="min-w-0 space-y-6">
      <section className="card">
        <h2 className="section-title">Virada de ano</h2>
        <p className="-mt-2 mb-5 text-sm text-[#7b5d5d]">
          Todo 01/01 as turmas sobem de série automaticamente. O 3º ano do técnico e o 9º ano saem do sistema,
          e o resumo das estatísticas do ano fica guardado antes disso.
        </p>

        {mensagem && <div className={`${mensagem.ok ? "mensagem-ok" : "mensagem-erro"} mt-0! mb-5`}>{mensagem.texto}</div>}

        {loading || !plano ? (
          <div className="font-bold text-[#8f7e7e]">Carregando...</div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
              {resumo!.map((c) => (
                <div key={c.t}>
                  <div className="font-titulo text-3xl font-extrabold leading-none text-[#8b1e1e]">{c.n}</div>
                  <div className="mt-1 text-sm font-bold text-[#7b5d5d]">{c.t}</div>
                </div>
              ))}
            </div>

            {plano.motivo && <div className="mensagem-erro mt-0! mb-4">{plano.motivo}</div>}
            {plano.executadaEm && (
              <p className="mb-4 text-[#5e4a4a]">Executada em {new Date(plano.executadaEm).toLocaleString("pt-BR")}.</p>
            )}

            <button className="btn-primary w-full sm:w-auto" onClick={executar} disabled={!plano.executavel || executando}>
              {executando ? "Executando..." : "Executar virada agora"}
            </button>
            <p className="mt-2.5 text-[13px] text-[#8f7e7e]">
              Normalmente não precisa clicar: a virada roda sozinha em 01/01. O botão é o plano B, caso a rotina automática falhe.
            </p>
          </>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">O que acontece com cada turma</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Turma</th><th>Alunos</th><th>Com livro em aberto</th><th>Na virada</th></tr>
            </thead>
            <tbody>
              {(plano?.turmas ?? []).length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-neutral-300">Nenhum aluno cadastrado</td></tr>
              )}
              {(plano?.turmas ?? []).map((l) => (
                <tr key={l.turma}>
                  <td className="font-bold">{l.turma}</td>
                  <td>{l.alunos}</td>
                  <td>{l.comLivroEmAberto || "—"}</td>
                  <td className={l.destino === "remover" ? "font-bold text-[#8b1e1e]" : "text-[#5e4a4a]"}>{rotulo(l)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
