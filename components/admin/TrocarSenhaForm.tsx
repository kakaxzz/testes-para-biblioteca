"use client"

import { useState } from "react"
import { PasswordInput } from "@/components/PasswordInput"
import { SenhaChecklist } from "@/components/SenhaChecklist"
import { avaliarSenha } from "@/lib/senha-forte"

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

    if (!avaliarSenha(form.nova).forte) {
      setMsg({ ok: false, texto: "A nova senha ainda não atende a todos os requisitos." })
      return
    }

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
              required
            />
            {c.nome === "nova" && <SenhaChecklist senha={form.nova} />}
            {c.nome === "confirma" && form.confirma && (
              <p className="mt-1.5 text-[13px] font-semibold" style={{ color: form.confirma === form.nova ? "#166534" : "#8b1e1e" }}>
                {form.confirma === form.nova ? "✓ As senhas coincidem" : "As senhas ainda não coincidem"}
              </p>
            )}
          </div>
        ))}

        {msg && <div className={msg.ok ? "mensagem-ok" : "mensagem-erro"}>{msg.texto}</div>}

        <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={loading || !avaliarSenha(form.nova).forte || form.nova !== form.confirma}>
          {loading ? "Salvando..." : "Trocar senha"}
        </button>
      </form>
    </section>
  )
}
