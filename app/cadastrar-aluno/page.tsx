"use client";

import { useState } from "react";

type Tipo = "ALUNO" | "FUNCIONARIO" | "RESPONSAVEL";

export default function CadastrarUsuario() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<Tipo>("ALUNO");
  const [matricula, setMatricula] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  const salvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipo,
          matricula: tipo === "ALUNO" ? matricula : undefined,
          cpf: tipo !== "ALUNO" ? cpf : undefined,
          whatsapp,
        }),
      });

      if (res.ok) {
        const novoUsuario = await res.json();
        setMensagem(`✅ Cadastrado com sucesso! O ID dele é: ${novoUsuario.id}`);
        setNome("");
        setMatricula("");
        setCpf("");
        setWhatsapp("");
      } else {
        const d = await res.json();
        setMensagem(`❌ ${d.error || "Erro ao cadastrar."}`);
      }
    } catch (err) {
      setMensagem("❌ Erro de conexão.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>Cadastrar Novo Usuário</h1>
      <form onSubmit={salvarUsuario} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo)}
          style={{ padding: "10px" }}
        >
          <option value="ALUNO">Aluno</option>
          <option value="FUNCIONARIO">Funcionário</option>
          <option value="RESPONSAVEL">Responsável</option>
        </select>

        <input
          placeholder="Nome Completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ padding: "10px" }}
        />

        {tipo === "ALUNO" ? (
          <input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
            style={{ padding: "10px" }}
          />
        ) : (
          <input
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            style={{ padding: "10px" }}
          />
        )}

        <input
          placeholder="WhatsApp (opcional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          style={{ padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
          Salvar
        </button>
      </form>
      {mensagem && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{mensagem}</p>}

      <div style={{ marginTop: "20px" }}>
        <a href="/teste-isbn">⬅️ Voltar para Busca de Livros</a>
      </div>
    </div>
  );
}
