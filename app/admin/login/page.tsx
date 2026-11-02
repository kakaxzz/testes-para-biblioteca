"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/PasswordInput"
import { Icone } from "@/components/Icone"

const CAMPO =
  "rounded-xl border border-[#8b1e1e]/15 bg-white/70 px-4 py-3.5 text-sm text-[#1a0f0f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition focus:border-[#8b1e1e] focus:ring-4 focus:ring-[#8b1e1e]/10"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setLoading(true)

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    })

    if (res.ok) router.replace("/admin")
    else setErro("Usuario ou senha incorretos.")

    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#561010_0%,#791818_44%,#962020_100%)] p-4 font-texto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');`}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_44%)]" />

      <img
        src="/logo-jpi.png"
        alt="Logo da Biblioteca Escolar Emerson Teixeira"
        className="pointer-events-none absolute w-[min(70vw,780px)] max-w-[780px] select-none object-contain opacity-[0.12] [filter:sepia(0.08)_saturate(0.8)_brightness(1.08)]"
      />

      <div className="relative z-10 w-full max-w-[402px] rounded-3xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(252,248,246,0.94)_100%)] px-6 py-10 text-center shadow-[0_30px_70px_rgba(39,8,8,0.26)] backdrop-blur-sm sm:px-[42px] sm:py-[46px]">
        <div className="mx-auto mb-[18px] flex size-[76px] items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(139,30,30,0.08),rgba(139,30,30,0.14))] text-[38px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <Icone nome="livros" tamanho={38} style={{ color: "#8b1e1e" }} />
        </div>

        <h1 className="mb-1.5 font-titulo text-[31px] font-black text-[#8b1e1e]">Area Admin</h1>
        <p className="mb-[30px] text-sm tracking-[0.01em] text-[#9b8f8f]">Biblioteca Escolar Emerson Teixeira</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <input
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
            autoFocus
            className={CAMPO}
          />

          <PasswordInput
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            inputClassName={`w-full ${CAMPO}`}
          />

          {erro && (
            <div className="rounded-xl border border-[#8b1e1e]/20 bg-[#fdf2f2] px-3.5 py-2.5 text-[13px] text-[#8b1e1e]">{erro}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 cursor-pointer rounded-xl bg-[linear-gradient(180deg,#992323_0%,#7e1717_100%)] p-3.5 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(126,23,23,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
