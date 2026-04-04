"use client";

import { useState } from "react";

export default function CadastrarAluno() {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  const salvarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, matricula, whatsapp }),
      });

      if (res.ok) {
        const novoAluno = await res.json();
        setMensagem(`✅ Aluno cadastrado com sucesso! O ID dele é: ${novoAluno.id}`);
        setNome("");
        setMatricula("");
        setWhatsapp("");
      } else {
        setMensagem("❌ Erro ao cadastrar aluno.");
      }
    } catch (err) {
      setMensagem("❌ Erro de conexão.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>Cadastrar Novo Aluno</h1>
      <form onSubmit={salvarAluno} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          placeholder="Nome Completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ padding: "10px" }}
        />
        <input
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
          style={{ padding: "10px" }}
        />
        <input
          placeholder="WhatsApp (opcional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          style={{ padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
          Salvar Aluno
        </button>
      </form>
      {mensagem && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{mensagem}</p>}
      
      <div style={{ marginTop: "20px" }}>
        <a href="/teste-isbn">⬅️ Voltar para Busca de Livros</a>
      </div>
    </div>
  );
}