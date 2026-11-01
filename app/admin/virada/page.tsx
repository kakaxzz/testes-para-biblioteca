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

export default function AdminVirada() {
  const [plano, setPlano] = useState<Plano | null>(null)
  const [loading, setLoading] = useState(true)
  const [executando, setExecutando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")

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
    setMensagem("")
    const res = await fetch("/api/admin/virada", { method: "POST" })
    const data = await res.json()
    if (res.ok && data.ok) {
      setTipoMensagem("ok")
      setMensagem(`✅ Virada feita: ${data.promovidos} promovidos, ${data.removidos} removidos, ${data.pendentes} com livro em aberto (ficaram).`)
    } else {
      setTipoMensagem("erro")
      setMensagem(data.motivo || data.error || "Erro ao executar a virada.")
    }
    setExecutando(false)
    carregar()
  }

  const rotulo = (l: Linha) =>
    l.destino === "promover" ? `vai para ${l.novaTurma}` : l.destino === "remover" ? "sai da escola (será apagado)" : "sem mudança"

  return (
    <div>
      <div className="page-header">
        <h1>Virada de ano</h1>
        <p>
          Todo 01/01 as turmas sobem de série automaticamente. O 3º ano do técnico e o 9º ano saem do
          sistema, e o resumo das estatísticas do ano fica guardado antes disso.
        </p>
      </div>

      {mensagem && <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginBottom: 20 }}>{mensagem}</div>}

      <div className="card" style={{ marginBottom: 22 }}>
        {loading || !plano ? (
          <div style={{ color: "#8f7e7e", fontWeight: 700 }}>Carregando...</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
              {[
                { n: plano.totais.promover, t: "mudam de turma" },
                { n: plano.totais.remover, t: "serão apagados" },
                { n: plano.totais.bloqueados, t: "com livro em aberto (ficam)" },
                { n: plano.totais.semMudanca, t: "sem mudança (turma antiga/vazia)" },
              ].map((c) => (
                <div key={c.t}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: "#8b1e1e", lineHeight: 1 }}>{c.n}</div>
                  <div style={{ fontSize: "0.9rem", color: "#7b5d5d", fontWeight: 700 }}>{c.t}</div>
                </div>
              ))}
            </div>

            {plano.motivo && <div className="mensagem-erro" style={{ marginBottom: 16 }}>{plano.motivo}</div>}
            {plano.executadaEm && (
              <div style={{ marginBottom: 16, color: "#5e4a4a" }}>
                Executada em {new Date(plano.executadaEm).toLocaleString("pt-BR")}.
              </div>
            )}

            <button className="btn-primary" onClick={executar} disabled={!plano.executavel || executando}>
              {executando ? "Executando..." : "Executar virada agora"}
            </button>
            <p style={{ marginTop: 10, fontSize: 13, color: "#8f7e7e" }}>
              Normalmente não precisa clicar: a virada roda sozinha em 01/01. O botão é o plano B, caso a rotina automática falhe.
            </p>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">O que acontece com cada turma</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Turma</th><th>Alunos</th><th>Com livro em aberto</th><th>Na virada</th></tr>
            </thead>
            <tbody>
              {(plano?.turmas ?? []).length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "#ccc", padding: 32 }}>Nenhum aluno cadastrado</td></tr>
              )}
              {(plano?.turmas ?? []).map((l) => (
                <tr key={l.turma}>
                  <td style={{ fontWeight: 700 }}>{l.turma}</td>
                  <td>{l.alunos}</td>
                  <td>{l.comLivroEmAberto || "—"}</td>
                  <td style={{ color: l.destino === "remover" ? "#8b1e1e" : "#5e4a4a", fontWeight: l.destino === "remover" ? 700 : 400 }}>{rotulo(l)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
