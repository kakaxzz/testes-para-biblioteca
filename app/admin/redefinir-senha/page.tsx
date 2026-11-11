"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PasswordInput } from "@/components/PasswordInput"
import { Icone } from "@/components/Icone"
import { SenhaChecklist } from "@/components/SenhaChecklist"
import { avaliarSenha } from "@/lib/senha-forte"

const CAMPO =
  "rounded-xl border border-[#8b1e1e]/15 bg-white/70 px-4 py-3.5 text-sm text-[#1a0f0f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition focus:border-[#8b1e1e] focus:ring-4 focus:ring-[#8b1e1e]/10"

function RedefinirSenhaForm() {
  const token = useSearchParams().get("token") ?? ""
  const router = useRouter()
  const [status, setStatus] = useState<"verificando" | "valido" | "invalido" | "concluido">("verificando")
  const [nova, setNova] = useState("")
  const [confirma, setConfirma] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("invalido")
      return
    }
    fetch(`/api/auth/redefinir-senha?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setStatus(d.valido ? "valido" : "invalido"))
      .catch(() => setStatus("invalido"))
  }, [token])

  useEffect(() => {
    if (status !== "concluido") return
    const t = setTimeout(() => router.replace("/admin/login"), 3000)
    return () => clearTimeout(t)
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (!avaliarSenha(nova).forte) {
      setErro("A nova senha ainda não atende a todos os requisitos.")
      return
    }

    if (nova !== confirma) {
      setErro("A confirmação não bate com a nova senha.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha: nova }),
      })
      const data = await res.json()
      if (res.ok) setStatus("concluido")
      else setErro(data.error || "Erro ao redefinir a senha.")
    } catch {
      setErro("Erro de conexão. Tente de novo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="mb-1.5 font-titulo text-[28px] font-black text-[#8b1e1e]">Nova senha</h1>
      <p className="mb-[26px] text-sm tracking-[0.01em] text-[#9b8f8f]">Biblioteca Escolar Emerson Teixeira</p>

      {status === "verificando" && <p className="text-sm text-[#6b5757]">Verificando link...</p>}

      {status === "invalido" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#8b1e1e]/20 bg-[#fdf2f2] px-3.5 py-3 text-[13px] text-[#8b1e1e]">
            Este link é inválido ou já expirou. Volte ao login e clique em “Esqueci a senha” para receber um novo.
          </div>
          <Link href="/admin/login" className="text-[13px] font-semibold text-[#8b1e1e] hover:underline">
            Voltar ao login
          </Link>
        </div>
      )}

      {status === "concluido" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#86efac] bg-[#f0faf4] px-3.5 py-3 text-[13px] text-[#166534]">
            Senha redefinida com sucesso! Você será levado ao login em instantes.
          </div>
          <Link href="/admin/login" className="text-[13px] font-semibold text-[#8b1e1e] hover:underline">
            Ir para o login agora
          </Link>
        </div>
      )}

      {status === "valido" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <PasswordInput
            placeholder="Nova senha"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            autoComplete="new-password"
            required
            autoFocus
            inputClassName={`w-full ${CAMPO}`}
          />
          <SenhaChecklist senha={nova} />
          <PasswordInput
            placeholder="Confirmar nova senha"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            autoComplete="new-password"
            required
            inputClassName={`w-full ${CAMPO}`}
          />
          {confirma && (
            <p className="-mt-1.5 text-left text-[13px] font-semibold" style={{ color: confirma === nova ? "#166534" : "#8b1e1e" }}>
              {confirma === nova ? "✓ As senhas coincidem" : "As senhas ainda não coincidem"}
            </p>
          )}

          {erro && (
            <div className="rounded-xl border border-[#8b1e1e]/20 bg-[#fdf2f2] px-3.5 py-2.5 text-left text-[13px] text-[#8b1e1e]">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !avaliarSenha(nova).forte || nova !== confirma}
            className="mt-1.5 cursor-pointer rounded-xl bg-[linear-gradient(180deg,#992323_0%,#7e1717_100%)] p-3.5 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(126,23,23,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      )}
    </>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#561010_0%,#791818_44%,#962020_100%)] p-4 font-texto">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');`}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_44%)]" />

      <img
        src="/logo-jpi.png"
        alt=""
        className="pointer-events-none absolute w-[min(70vw,780px)] max-w-[780px] select-none object-contain opacity-[0.12] [filter:sepia(0.08)_saturate(0.8)_brightness(1.08)]"
      />

      <div className="relative z-10 w-full max-w-[402px] rounded-3xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(252,248,246,0.94)_100%)] px-6 py-10 text-center shadow-[0_30px_70px_rgba(39,8,8,0.26)] backdrop-blur-sm sm:px-[42px] sm:py-[46px]">
        <div className="mx-auto mb-[18px] flex size-[76px] items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(139,30,30,0.08),rgba(139,30,30,0.14))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <Icone nome="livros" tamanho={38} style={{ color: "#8b1e1e" }} />
        </div>

        <Suspense fallback={<p className="text-sm text-[#6b5757]">Carregando...</p>}>
          <RedefinirSenhaForm />
        </Suspense>
      </div>
    </div>
  )
}
