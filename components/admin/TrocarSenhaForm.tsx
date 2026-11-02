"use client"

import { useState } from "react"
import { PasswordInput } from "@/components/PasswordInput"

const CAMPOS = [
  { nome: "atual", rotulo: "Senha atual", auto: "current-password" },
  { nome: "nova", rotulo: "Nova senha", auto: "new-password" },
  { nome: "confirma", rotulo: "Confirmar nova senha", auto: "new-password" },
] as const

const VAZIO = { atual: "", nova: "", confirma: "" }

export function TrocarSenhaForm() {
  const [form, setForm] = useState(VAZIO)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (form.nova !== form.confirma) {
      setMsg({ ok: false, texto: "A confirmação não bate com a nova senha" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.atual, newPassword: form.nova }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ ok: true, texto: data.message || "Senha alterada com sucesso" })
        setForm(VAZIO)
      } else {
        setMsg({ ok: false, texto: data.error || "Erro ao trocar senha" })
      }
    } catch {
      setMsg({ ok: false, texto: "Erro de conexão. Tenta de novo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">Trocar senha</h2>
      <p className="-mt-2 mb-5 text-sm text-[#7b5d5d]">Atualize a senha de acesso ao painel administrativo.</p>

      <form onSubmit={enviar}>
        {CAMPOS.map((c) => (
          <div key={c.nome} className="input-group">
            <label htmlFor={`senha-${c.nome}`}>{c.rotulo}</label>
            <PasswordInput
              id={`senha-${c.nome}`}
              value={form[c.nome]}
              onChange={(e) => setForm((f) => ({ ...f, [c.nome]: e.target.value }))}
              autoComplete={c.auto}
              minLength={c.nome === "atual" ? undefined : 8}
              required
            />
          </div>
        ))}

        {msg && <div className={msg.ok ? "mensagem-ok" : "mensagem-erro"}>{msg.texto}</div>}

        <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvando..." : "Trocar senha"}
        </button>
      </form>
    </section>
  )
}
