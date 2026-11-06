"use client"

import { useState } from "react"
import { PasswordInput } from "@/components/PasswordInput"

const VAZIO = { novo: "", senha: "" }

export function TrocarUsuarioForm() {
  const [form, setForm] = useState(VAZIO)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername: form.novo, currentPassword: form.senha }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ ok: true, texto: data.message || "Usuário alterado com sucesso" })
        setForm(VAZIO)
      } else {
        setMsg({ ok: false, texto: data.error || "Erro ao trocar usuário" })
      }
    } catch {
      setMsg({ ok: false, texto: "Erro de conexão. Tenta de novo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">Trocar usuário</h2>
      <p className="-mt-2 mb-5 text-sm text-[#7b5d5d]">Atualize o usuário usado para entrar no painel administrativo.</p>

      <form onSubmit={enviar}>
        <div className="input-group">
          <label htmlFor="usuario-novo">Novo usuário</label>
          <input
            id="usuario-novo"
            type="text"
            className="input-field"
            value={form.novo}
            onChange={(e) => setForm((f) => ({ ...f, novo: e.target.value }))}
            autoComplete="username"
            minLength={3}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="usuario-senha">Senha atual</label>
          <PasswordInput
            id="usuario-senha"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            autoComplete="current-password"
            required
          />
        </div>

        {msg && <div className={msg.ok ? "mensagem-ok" : "mensagem-erro"}>{msg.texto}</div>}

        <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvando..." : "Trocar usuário"}
        </button>
      </form>
    </section>
  )
}
