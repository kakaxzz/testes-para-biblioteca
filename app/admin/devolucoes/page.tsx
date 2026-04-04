"use client"

import { useEffect, useState } from "react"

export default function AdminDevolucoes() {
  const [emprestimos, setEmprestimos] = useState<any[]>([])
  const [busca, setBusca] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState<"ok" | "erro">("ok")

  useEffect(() => {
    carregarEmprestimos()
  }, [])

  async function carregarEmprestimos() {
    const res = await fetch("/api/emprestimos?abertos=true")
    if (res.ok) setEmprestimos(await res.json())
  }

  async function registrarDevolucao(id: number, titulo: string) {
    const res = await fetch("/api/devolucoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emprestimoId: id }),
    })

    if (res.ok) {
      setMensagem(`Devolucao de "${titulo}" registrada!`)
      setTipoMensagem("ok")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      setMensagem(d.error)
      setTipoMensagem("erro")
    }
  }

  async function renovar(id: number, titulo: string) {
    const res = await fetch("/api/emprestimos/renovar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emprestimoId: id }),
    })

    if (res.ok) {
      setMensagem(`Emprestimo de "${titulo}" renovado por mais 10 dias!`)
      setTipoMensagem("ok")
      carregarEmprestimos()
    } else {
      const d = await res.json()
      setMensagem(d.error)
      setTipoMensagem("erro")
    }
  }

  function abrirWhatsApp(e: any) {
    const nome = e.aluno?.nome?.split(" ")[0] || "aluno"
    const titulo = e.livro?.titulo || "o livro"
    const dias = diasDesde(e.dataEmprestimo)
    const prazoRestante = 10 - dias

    let msg = ""
    if (prazoRestante < 0) {
      msg = `Ola ${nome}! O livro "${titulo}" esta com ${Math.abs(prazoRestante)} dias de atraso na devolucao.`
    } else {
      msg = `Ola ${nome}! Lembrando que o livro "${titulo}" deve ser devolvido em ${prazoRestante} dia(s).`
    }

    const tel = e.aluno?.whatsapp?.replace(/\D/g, "")
    if (!tel) {
      alert("Este aluno nao tem WhatsApp cadastrado.")
      return
    }
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  function diasDesde(data: string) {
    return Math.floor((Date.now() - new Date(data).getTime()) / 86400000)
  }

  function statusPrazo(dias: number) {
    const restante = 10 - dias
    if (restante < 0) return { label: `${Math.abs(restante)}d atrasado`, cor: "#8b1e1e", bg: "#fdf2f2", urgente: true }
    if (restante <= 2) return { label: `vence em ${restante}d`, cor: "#854d0e", bg: "#fff7e8", urgente: true }
    if (restante <= 5) return { label: `${restante}d restantes`, cor: "#854d0e", bg: "#fff7e8", urgente: false }
    return { label: `${restante}d restantes`, cor: "#166534", bg: "#f0faf4", urgente: false }
  }

  const filtrados = emprestimos.filter(
    (e) =>
      e.aluno?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      e.livro?.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      e.aluno?.matricula?.includes(busca)
  )

  const atrasados = emprestimos.filter((e) => diasDesde(e.dataEmprestimo) > 10)
  const vencendoHoje = emprestimos.filter((e) => {
    const r = 10 - diasDesde(e.dataEmprestimo)
    return r >= 0 && r <= 2
  })

  return (
    <div>
      <div className="page-header">
        <h1>Devolucoes</h1>
        <p>Gerencie devolucoes e renovacoes de emprestimos</p>
      </div>

      {(atrasados.length > 0 || vencendoHoje.length > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {atrasados.length > 0 && (
            <div className="surface-note error" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#8b1e1e" }}>{atrasados.length} emprestimo(s) em atraso</div>
            </div>
          )}

          {vencendoHoje.length > 0 && (
            <div className="surface-note warn" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 800, color: "#854d0e" }}>{vencendoHoje.length} emprestimo(s) vencendo em breve</div>
            </div>
          )}
        </div>
      )}

      {mensagem && (
        <div className={tipoMensagem === "ok" ? "mensagem-ok" : "mensagem-erro"} style={{ marginBottom: 24 }}>
          {mensagem}
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <input
            className="input-field"
            placeholder="Buscar por aluno, matricula ou livro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ maxWidth: 420 }}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Livro</th>
                <th>Emprestimo</th>
                <th>Prazo</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#b3a6a6", padding: 32 }}>
                    {busca ? "Nenhum resultado" : "Nenhum emprestimo em aberto!"}
                  </td>
                </tr>
              )}

              {filtrados.map((e: any) => {
                const prazo = statusPrazo(diasDesde(e.dataEmprestimo))
                return (
                  <tr key={e.id} style={{ background: prazo.urgente ? prazo.bg : undefined }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.aluno?.nome}</div>
                      <div style={{ fontSize: 12, color: "#a09191" }}>{e.aluno?.matricula}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.livro?.titulo}</div>
                      <div style={{ fontSize: 12, color: "#a09191" }}>{e.livro?.autor}</div>
                    </td>
                    <td style={{ color: "#7f6d6d" }}>
                      {new Date(e.dataEmprestimo).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: prazo.bg,
                          color: prazo.cor,
                        }}
                      >
                        {prazo.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn-primary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => registrarDevolucao(e.id, e.livro?.titulo)}>
                          Devolver
                        </button>
                        <button className="btn-secondary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => renovar(e.id, e.livro?.titulo)}>
                          Renovar
                        </button>
                        {e.aluno?.whatsapp && (
                          <button
                            onClick={() => abrirWhatsApp(e)}
                            style={{
                              padding: "7px 12px",
                              fontSize: 12,
                              background: "#25D366",
                              color: "white",
                              border: "none",
                              borderRadius: 12,
                              cursor: "pointer",
                              fontWeight: 700,
                              fontFamily: "'Source Sans 3', sans-serif",
                            }}
                          >
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
