"use client"

import { useState, useRef } from "react"

export default function TesteIsbn() {
  const [isbn, setIsbn] = useState("")
  const [livro, setLivro] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")

  // Estados para edição manual
  const [capaManual, setCapaManual] = useState("")
  const [autorManual, setAutorManual] = useState("")
  const [sinopseManual, setSinopseManual] = useState("")
  const [categoriasManual, setCategoriasManual] = useState("")
  const [cddManual, setCddManual] = useState("") 
  const inputRef = useRef<HTMLInputElement>(null)

  async function buscarLivro(codigo?: string) {
    const codigoFinal = codigo || isbn
    if (!codigoFinal) return

    setLoading(true)
    setMensagem("")
    setLivro(null)

    const res = await fetch(`/api/buscar-isbn/${codigoFinal}`)
    const data = await res.json()

    if (res.ok) {
      setLivro({
        ...data,
        isbn: codigoFinal
      })

      setCapaManual(data.capa || "")
      setAutorManual(data.autor || "")
      setSinopseManual(data.sinopse || "")
      setCategoriasManual(
        data.assuntos ? data.assuntos.join(", ") : ""
      )
      setCddManual(data.cdd || "") 

    } else {
      setMensagem(data.error)
    }

    setLoading(false)
    setIsbn("")
    inputRef.current?.focus()
  }

  async function salvarLivro() {
    const confirmar = window.confirm("Deseja realmente salvar este livro no banco?")
    if (!confirmar) return

    const livroFinal = {
      ...livro,
      autor: autorManual,
      sinopse: sinopseManual,
      capa: capaManual,
      cdd: cddManual, 
      assuntos: categoriasManual
        .split(",")
        .map(cat => cat.trim())
        .filter(cat => cat !== "")
    }

    const res = await fetch("/api/livros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(livroFinal),
    })

    const data = await res.json()

    if (res.ok) {
      setMensagem("✅ Livro salvo com sucesso!")
      setLivro(null)
      setCapaManual("")
      setAutorManual("")
      setSinopseManual("")
      setCategoriasManual("")
      setCddManual("")
    } else {
      setMensagem(data.error)
    }

    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      buscarLivro()
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Scanner de ISBN</h1>

      <input
        ref={inputRef}
        autoFocus
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escaneie ou digite o ISBN"
        style={{ padding: 8, width: 300 }}
      />

      <button onClick={() => buscarLivro()} style={{ marginLeft: 10 }}>
        Buscar
      </button>

      {loading && <p>Carregando...</p>}
      {mensagem && <p style={{ fontWeight: 'bold' }}>{mensagem}</p>}

      {livro && (
        <div style={{ marginTop: 20, borderTop: '1px solid #ccc', paddingTop: 20 }}>
          <h2>{livro.titulo}</h2>
          <p><strong>ISBN:</strong> {livro.isbn}</p>

          {/* EDITAR AUTOR */}
          <div style={{ marginBottom: 15 }}>
            <strong>Autor:</strong><br />
            <input 
              value={autorManual}
              onChange={(e) => setAutorManual(e.target.value)}
              style={{ width: '100%', maxWidth: 500, padding: 8, marginTop: 5 }}
            />
          </div>

          {/* EDITAR CATEGORIAS */}
          <div style={{ marginBottom: 15 }}>
            <strong>Categorias (separe por vírgula):</strong><br />
            <input 
              value={categoriasManual}
              onChange={(e) => setCategoriasManual(e.target.value)}
              style={{ width: '100%', maxWidth: 500, padding: 8, marginTop: 5 }}
            />
          </div>

          {/* EDITAR SINOPSE */}
          <div style={{ marginBottom: 15 }}>
            <strong>Sinopse:</strong><br />
            <textarea 
              value={sinopseManual}
              onChange={(e) => setSinopseManual(e.target.value)}
              style={{ width: '100%', maxWidth: 500, height: 150, padding: 8, marginTop: 5 }}
            />
          </div>

          {/* EDITAR CDD */}
          <div style={{ marginBottom: 15 }}>
            <strong>CDD:</strong><br />
            <input 
              value={cddManual}
              onChange={(e) => setCddManual(e.target.value)}
              placeholder="Ex: 741.5"
              style={{ width: '100%', maxWidth: 500, padding: 8, marginTop: 5 }}
            />
          </div>

          {/* EDITAR CAPA */}
          <div style={{ marginBottom: 15 }}>
            <strong>Capa (URL):</strong><br />
            <input
              value={capaManual}
              onChange={(e) => setCapaManual(e.target.value)}
              placeholder="URL da imagem"
              style={{ width: '100%', maxWidth: 500, padding: 8, marginTop: 5 }}
            />
          </div>

          {capaManual && (
            <div style={{ marginBottom: 20 }}>
              <img 
                src={capaManual} 
                width={150} 
                alt="Preview da Capa" 
                style={{ borderRadius: 8 }} 
              />
            </div>
          )}

          <button 
            onClick={salvarLivro}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Confirmar e salvar no banco
          </button>
        </div>
      )}
    </div>
  )
}