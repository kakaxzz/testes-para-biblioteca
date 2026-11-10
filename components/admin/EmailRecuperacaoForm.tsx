"use client"

import { useEffect, useState } from "react"
import { PasswordInput } from "@/components/PasswordInput"

const VAZIO = { email: "", senha: "" }

export function EmailRecuperacaoForm() {
  const [form, setForm] = useState(VAZIO)
  const [cadastrado, setCadastrado] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/recovery-email")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCadastrado(d?.email ?? null))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/recovery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, currentPassword: form.senha }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ ok: true, texto: data.message || "E-mail de recuperação salvo com sucesso" })
        setCadastrado(data.email ?? null)
        setForm(VAZIO)
      } else {
        setMsg({ ok: false, texto: data.error || "Erro ao salvar o e-mail" })
      }
    } catch {
      setMsg({ ok: false, texto: "Erro de conexão. Tenta de novo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">E-mail de recuperação de senha</h2>
      <p className="-mt-2 mb-5 text-sm text-[#7b5d5d]">
        Se você esquecer a senha, o link para criar uma nova será enviado para este e-mail.
      </p>

      <div className={`surface-note ${cadastrado ? "ok" : "warn"} mb-5`}>
        {carregando
          ? "Carregando..."
          : cadastrado
            ? <>E-mail cadastrado: <strong>{cadastrado}</strong></>
            : "Nenhum e-mail cadastrado ainda."}
      </div>

      <form onSubmit={enviar}>
        <div className="input-group">
          <label htmlFor="email-recuperacao">{cadastrado ? "Novo e-mail" : "E-mail"}</label>
          <input
            id="email-recuperacao"
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
            placeholder="exemplo@gmail.com"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email-recuperacao-senha">Senha de admin (para confirmar)</label>
          <PasswordInput
            id="email-recuperacao-senha"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            autoComplete="current-password"
            required
          />
        </div>

        {msg && <div className={msg.ok ? "mensagem-ok" : "mensagem-erro"}>{msg.texto}</div>}

        <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvando..." : cadastrado ? "Trocar e-mail" : "Salvar e-mail"}
        </button>
      </form>
    </section>
  )
}
