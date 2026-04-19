"use client"

import { useEffect, useState } from "react"

type Notice = {
  id: number
  titulo: string
  mensagem: string
  tag: string
}

export default function AdminBiblioNews() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/biblionews")
      .then((r) => r.json())
      .then((data) => setNotices(data))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false))
  }, [])

  const updateNotice = (id: number, field: keyof Notice, value: string) => {
    setNotices((prev) => prev.map((notice) => (notice.id === id ? { ...notice, [field]: value } : notice)))
  }

  const addNotice = () => {
    setNotices((prev) => [
      ...prev,
      { id: Date.now(), titulo: "", mensagem: "", tag: "" },
    ])
  }

  const removeNotice = (id: number) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id))
  }

  const saveNotices = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/biblionews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notices),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar.")
      }

      setMessage("Avisos salvos com sucesso.")
    } catch {
      setMessage("Erro ao salvar os avisos. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>BiblioNews</h1>
        <p>Edite os avisos que aparecem na página inicial do BiblioNews.</p>
      </div>

      <div className="admin-panel">
        <div className="panel-header">
          <button type="button" className="primary-button" onClick={addNotice}>
            + Novo aviso
          </button>
          <button type="button" className="secondary-button" onClick={saveNotices} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        {message && <div className="feedback-box">{message}</div>}

        {loading ? (
          <div className="feedback-box">Carregando avisos...</div>
        ) : (
          <div className="notice-editor-grid">
            {notices.map((notice) => (
              <div key={notice.id} className="editor-card">
                <div className="editor-card-row">
                  <label>Título</label>
                  <input
                    value={notice.titulo}
                    onChange={(e) => updateNotice(notice.id, "titulo", e.target.value)}
                  />
                </div>
                <div className="editor-card-row">
                  <label>Mensagem</label>
                  <textarea
                    value={notice.mensagem}
                    onChange={(e) => updateNotice(notice.id, "mensagem", e.target.value)}
                  />
                </div>
                <div className="editor-card-row">
                  <label>Tag</label>
                  <input
                    value={notice.tag}
                    onChange={(e) => updateNotice(notice.id, "tag", e.target.value)}
                  />
                </div>
                <button type="button" className="delete-button" onClick={() => removeNotice(notice.id)}>
                  Remover aviso
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: #2d1414; margin-bottom: 8px; }
        .page-header p { color: #6d5f5f; font-size: 1rem; max-width: 640px; }
        .admin-panel { display: grid; gap: 18px; }
        .panel-header { display: flex; gap: 12px; flex-wrap: wrap; }
        .primary-button, .secondary-button { border: none; border-radius: 999px; padding: 12px 20px; font-weight: 700; cursor: pointer; }
        .primary-button { background: #8b1e1e; color: white; }
        .secondary-button { background: #f4ede3; color: #6a2a2a; }
        .feedback-box { padding: 16px 18px; background: #fff5f2; border: 1px solid rgba(139,30,30,0.16); border-radius: 16px; color: #8b1e1e; }
        .notice-editor-grid { display: grid; gap: 18px; }
        .editor-card { padding: 20px; border-radius: 22px; background: #fffdf8; border: 1px solid rgba(139,30,30,0.12); box-shadow: 0 14px 28px rgba(88,30,30,0.07); }
        .editor-card-row { display: grid; gap: 8px; margin-bottom: 14px; }
        .editor-card-row label { font-size: 0.88rem; font-weight: 700; color: #5f4444; }
        .editor-card-row input,
        .editor-card-row textarea { width: 100%; border: 1px solid rgba(139,30,30,0.18); border-radius: 14px; padding: 10px 12px; font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; color: #2e1414; background: #fff; }
        .editor-card-row textarea { min-height: 90px; resize: vertical; }
        .delete-button { border: none; background: rgba(255,230,226,0.95); color: #8b1e1e; padding: 10px 14px; border-radius: 999px; cursor: pointer; font-weight: 700; }
      `}</style>
    </div>
  )
}
