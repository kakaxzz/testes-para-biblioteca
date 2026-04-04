"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

    if (res.ok) {
      localStorage.setItem("admin", "true")
      router.replace("/admin")
    } else {
      setErro("Usuario ou senha incorretos.")
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #561010 0%, #791818 44%, #962020 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Source Sans 3', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.05), transparent 44%)",
        }}
      />

      <img
        src="/logo-jpi.png"
        alt="Logo da Biblioteca Emerson Teixeira"
        style={{
          position: "absolute",
          width: "min(70vw, 780px)",
          maxWidth: 780,
          opacity: 0.12,
          objectFit: "contain",
          filter: "sepia(0.08) saturate(0.8) brightness(1.08)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 402,
          padding: "46px 42px",
          borderRadius: 24,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(252,248,246,0.94) 100%)",
          border: "1px solid rgba(255,255,255,0.22)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 30px 70px rgba(39,8,8,0.26)",
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            margin: "0 auto 18px",
            background: "linear-gradient(180deg, rgba(139,30,30,0.08), rgba(139,30,30,0.14))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
          }}
        >
          📚
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 31,
            fontWeight: 900,
            color: "#8b1e1e",
            marginBottom: 6,
          }}
        >
          Area Admin
        </h1>

        <p
          style={{
            color: "#9b8f8f",
            fontSize: 14,
            marginBottom: 30,
            letterSpacing: "0.01em",
          }}
        >
          Biblioteca Emerson Teixeira
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <input
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            autoFocus
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid rgba(139,30,30,0.12)",
              fontSize: 14,
              fontFamily: "'Source Sans 3', sans-serif",
              outline: "none",
              background: "rgba(255,255,255,0.72)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
            }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid rgba(139,30,30,0.12)",
              fontSize: 14,
              fontFamily: "'Source Sans 3', sans-serif",
              outline: "none",
              background: "rgba(255,255,255,0.72)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
            }}
          />

          {erro && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fdf2f2",
                border: "1px solid rgba(139,30,30,0.18)",
                borderRadius: 12,
                color: "#8b1e1e",
                fontSize: 13,
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "linear-gradient(180deg, #992323 0%, #7e1717 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: "'Source Sans 3', sans-serif",
              marginTop: 6,
              boxShadow: "0 12px 22px rgba(126,23,23,0.24)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
