"use client"

import { useState } from "react"

export default function TesteISBN() {
  const [isbn, setIsbn] = useState("")
  const [livro, setLivro] = useState<any>(null)
  const [erro, setErro] = useState("")

  async function buscarLivro() {
    setErro("")
    setLivro(null)

    const res = await fetch(`/api/livros/${isbn}`)

    if (!res.ok) {
      setErro("Livro não encontrado")
      return
    }

    const data = await res.json()
    setLivro(data)
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Buscar Livro por ISBN</h2>

      <input
        type="text"
        placeholder="Digite o ISBN"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
      />

      <button onClick={buscarLivro}>Buscar</button>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {livro && (
        <div>
          <p><strong>Título:</strong> {livro.titulo}</p>
          <p><strong>Autor:</strong> {livro.autor}</p>
          <p><strong>ISBN:</strong> {livro.isbn}</p>
        </div>
      )}
    </div>
  )
}