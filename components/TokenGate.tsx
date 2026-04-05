"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TokenGate() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/validar-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()

    if (res.ok) {
      router.refresh()
    } else {
      setError(data.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Acesso restrito</h2>
      <p className="text-gray-500">Digite o token fornecido pela biblioteca.</p>
      <input
        type="text"
        maxLength={6}
        placeholder="000000"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="border rounded px-4 py-2 text-center text-2xl tracking-widest w-40"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading || token.length < 6}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Verificando..." : "Entrar"}
      </button>
    </div>
  )
}