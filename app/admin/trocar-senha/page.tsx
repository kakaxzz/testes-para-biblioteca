"use client";

import { useState } from "react";

export default function TrocarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "erro"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "erro", text: "A confirmação não bate com a nova senha" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "erro", text: data.error || "Erro ao trocar senha" });
      } else {
        setMessage({ type: "ok", text: data.message || "Senha alterada com sucesso" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "erro", text: "Erro de conexão. Tenta de novo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Trocar senha</h1>
        <p>Atualize a senha de acesso ao painel administrativo</p>
      </div>

      <div className="admin-grid-2">
        <div className="card">
          <h2 className="section-title">Alterar credenciais</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Senha atual</label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Nova senha</label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirmar nova senha</label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {message && (
              <div className={message.type === "ok" ? "mensagem-ok" : "mensagem-erro"}>
                {message.text}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Trocar senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}