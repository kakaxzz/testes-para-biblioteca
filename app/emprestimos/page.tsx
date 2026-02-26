"use client"

import { useEffect, useState } from "react"

type Emprestimo = {
  id: number
  dataEmprestimo: string
  dataDevolucao: string | null
  aluno: { nome: string }
  livro: { titulo: string }
}

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchEmprestimos() {
    setLoading(true)
    const res = await fetch("/api/emprestimos")
    const data = await res.json()
    setEmprestimos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEmprestimos()
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Empréstimos</h1>

      {loading && <p>Carregando...</p>}

      {!loading && emprestimos.length === 0 && (
        <p>Nenhum empréstimo cadastrado.</p>
      )}

      {!loading && emprestimos.map((emprestimo) => (
        <div
          key={emprestimo.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 15,
            borderRadius: 4
          }}
        >

          <p><strong>ID:</strong> {emprestimo.id}</p>
          <p><strong>Livro:</strong> {emprestimo.livro.titulo}</p>
          <p><strong>Aluno:</strong> {emprestimo.aluno.nome}</p>
          <p><strong>Emprestado em:</strong> {new Date(emprestimo.dataEmprestimo).toLocaleDateString()}</p>

          {emprestimo.dataDevolucao ? (
            <p style={{ color: "green" }}>
              ✅ Devolvido em {new Date(emprestimo.dataDevolucao).toLocaleDateString()}
            </p>
          ) : (
            <>
              <p style={{ color: "red" }}>📕 Ainda não devolvido</p>

              <button
                onClick={async () => {
                  await fetch(`/api/emprestimos/devolver/${emprestimo.id}`, {
                    method: "PATCH"
                  })
                  fetchEmprestimos()
                }}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Devolver
              </button>
            </>
          )}

        </div>
      ))}
    </div>
  )
}