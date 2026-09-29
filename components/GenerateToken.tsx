"use client"

import { useState } from "react"

export default function GenerateToken() {
  const [token, setToken] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)

  async function handleGenerate() {
    const res = await fetch("/api/admin/gerar-token", { method: "POST" })
    const data = await res.json()
    setToken(data.token)

    setTimeLeft(60)
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setToken("")
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        onClick={handleGenerate}
        className="btn-primary"
      >
        Gerar token de acesso — TCCs
      </button>
      {token && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 42, fontFamily: "monospace", fontWeight: 800, letterSpacing: 8 }}>
            {token}
          </p>
          <p style={{ fontSize: 13, color: "#9c8d8d" }}>
            Expira em <span style={{ color: "#8b1e1e", fontWeight: 700 }}>{timeLeft}s</span>
          </p>
        </div>
      )}
    </div>
  )
}