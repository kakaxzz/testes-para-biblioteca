"use client";

import { useState } from "react";

export default function ConsultaLivro() {
  const [isbn, setIsbn] = useState("");
  const [livro, setLivro] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState("");

  const buscarLivro = async () => {
    setErro("");
    setLivro(null);
    setMensagemStatus("");
    if (!isbn.trim()) return;

    try {
      const res = await fetch(`/api/livros/${isbn.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Livro não encontrado.");
        return;
      }
      setLivro(data);
    } catch (err) {
      setErro("Erro ao conectar com o servidor.");
    }
  };

  const alterarStatus = async (novoStatus: string) => {
    // Atualiza visualmente na hora (otimista)
    setLivro((prev: any) => ({ ...prev, status: novoStatus }));
    setSalvandoStatus(true);
    setMensagemStatus("");

    try {
      const response = await fetch(`/api/livros/${livro.isbn}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        setMensagemStatus("✅ Status atualizado!");
      } else {
        setMensagemStatus("❌ Erro ao salvar status.");
      }
    } catch (error) {
      setMensagemStatus("❌ Erro de conexão.");
    } finally {
      setSalvandoStatus(false);
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMensagemStatus(""), 3000);
    }
  };

  const realizarEmprestimo = async () => {
    if (!alunoId) {
      alert("Por favor, digite o ID do Aluno.");
      return;
    }
    setCarregando(true);
    try {
      const response = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, livroId: livro.id })
      });

      if (response.ok) {
        alert("✅ Empréstimo registrado!");
        setAlunoId("");
        buscarLivro();
      } else {
        alert("❌ Erro ao realizar empréstimo.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  };

  // Verifica se o livro está disponível para empréstimo
  const podeEmprestar = livro?.quantidadeDisponivel > 0 && livro?.status === 'disponivel';

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "800px", 
      margin: "0 auto", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f4f7f6",
      minHeight: "100vh"
    }}>
      <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#333", marginBottom: "20px", textAlign: "center" }}>📚 Consulta de Acervo</h1>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="Digite o ISBN do livro..."
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarLivro()}
            style={{ 
              flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" 
            }}
          />
          <button 
            onClick={buscarLivro}
            style={{ 
              padding: "12px 25px", backgroundColor: "#0070f3", color: "#fff", 
              border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" 
            }}
          >
            Pesquisar
          </button>
        </div>

        {erro && (
          <div style={{ color: "#d32f2f", backgroundColor: "#fdecea", padding: "10px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" }}>
            {erro}
          </div>
        )}

        {livro && (
          <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
            {/* Cabeçalho com info do livro */}
            <div style={{ display: "flex", backgroundColor: "#fafafa", padding: "20px", gap: "20px", borderBottom: "1px solid #eee" }}>
              {livro.capa && (
                <img src={livro.capa} alt="Capa" style={{ width: "120px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 10px 0", color: "#222" }}>{livro.titulo}</h2>
                <p style={{ margin: "5px 0", color: "#666" }}><strong>Autor:</strong> {livro.autor}</p>
                <p style={{ margin: "5px 0", color: "#666" }}><strong>ISBN:</strong> {livro.isbn}</p>
                <div style={{ 
                  marginTop: "15px", display: "inline-block", padding: "5px 12px", borderRadius: "20px", 
                  backgroundColor: podeEmprestar ? "#e6fffa" : "#fff5f5",
                  color: podeEmprestar ? "#2c7a7b" : "#c53030",
                  fontWeight: "bold", fontSize: "14px", border: "1px solid"
                }}>
                  {livro.statusTexto}
                </div>
              </div>
            </div>

            {/* Área de ações */}
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>⚙️ Ações de Balcão</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* Select de status manual - AGORA FUNCIONAL */}
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>
                  Alterar Status Manualmente
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                  <select
                    value={livro.status || 'disponivel'}
                    onChange={(e) => alterarStatus(e.target.value)}
                    disabled={salvandoStatus}
                    style={{ 
                      padding: "10px", borderRadius: "8px", border: "1px solid #ddd", 
                      backgroundColor: "#fff", flex: 1,
                      cursor: salvandoStatus ? "wait" : "pointer"
                    }}
                  >
                    <option value="disponivel">Disponível para Empréstimo</option>
                    <option value="reservado">Reservado</option>
                  </select>
                  {salvandoStatus && (
                    <span style={{ color: "#888", fontSize: "14px" }}>Salvando...</span>
                  )}
                </div>
                {mensagemStatus && (
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold" }}>
                    {mensagemStatus}
                  </p>
                )}

                {/* Seção de empréstimo */}
                {podeEmprestar ? (
                  <div style={{ backgroundColor: "#f0f7ff", padding: "20px", borderRadius: "10px", border: "1px solid #cce3ff" }}>
                    <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#004085" }}>Registrar Saída para Aluno:</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="number"
                        placeholder="ID do Aluno (Ex: 1)"
                        value={alunoId}
                        onChange={(e) => setAlunoId(e.target.value)}
                        style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #b8daff" }}
                      />
                      <button 
                        onClick={realizarEmprestimo}
                        disabled={carregando}
                        style={{ 
                          padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", 
                          border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" 
                        }}
                      >
                        {carregando ? "Gravando..." : "Confirmar Saída"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#fff5f5", color: "#c53030", borderRadius: "8px", fontWeight: "bold" }}>
                    {livro.status === 'reservado' 
                      ? "🔒 Livro reservado — altere o status para liberar empréstimos."
                      : "🚫 Não há exemplares disponíveis para novos empréstimos."
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a href="/cadastrar-aluno" style={{ color: "#0070f3", textDecoration: "none", fontWeight: "bold" }}>+ Cadastrar Novo Aluno</a>
      </div>
    </div>
  );
}
