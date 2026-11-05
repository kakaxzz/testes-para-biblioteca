"use client"

import { useEffect, useRef, useState } from "react"
import { Icone } from "@/components/Icone"

type Aviso = {
  chave: string
  id: number | null
  titulo: string
  mensagem: string
  tag: string
  data: string
  imagemUrl: string | null
  imagemNova: string | null
  removerImagem: boolean
}

type AvisoDaApi = {
  id: number
  titulo: string
  mensagem: string
  tag: string
  data: string
  imagemUrl: string | null
}

const CATEGORIAS_SUGERIDAS = ["Evento", "Novos livros", "Aviso", "Clube do Livro"]

function hoje() {
  return new Date().toLocaleDateString("en-CA")
}

function doServidor(a: AvisoDaApi): Aviso {
  return {
    chave: `a${a.id}`,
    id: a.id,
    titulo: a.titulo,
    mensagem: a.mensagem,
    tag: a.tag,
    data: a.data,
    imagemUrl: a.imagemUrl,
    imagemNova: null,
    removerImagem: false,
  }
}

async function comprimirImagem(arquivo: File, ladoMaximo = 1400, qualidade = 0.82): Promise<string> {
  const url = URL.createObjectURL(arquivo)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error("Não consegui abrir essa imagem. Use um arquivo JPG, PNG ou WebP."))
      i.src = url
    })
    const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height))
    const largura = Math.round(img.width * escala)
    const altura = Math.round(img.height * escala)
    const canvas = document.createElement("canvas")
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, largura, altura)
    ctx.drawImage(img, 0, 0, largura, altura)
    return canvas.toDataURL("image/jpeg", qualidade)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function AdminBiblioNews() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null)
  const contador = useRef(0)

  const carregar = async () => {
    try {
      const response = await fetch("/api/biblionews", { cache: "no-store" })
      const data = await response.json()
      setAvisos(Array.isArray(data) ? data.map(doServidor) : [])
    } catch {
      setAvisos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const atualizar = (chave: string, campos: Partial<Aviso>) => {
    setAvisos((prev) => prev.map((a) => (a.chave === chave ? { ...a, ...campos } : a)))
  }

  const adicionar = () => {
    contador.current += 1
    setAvisos((prev) => [
      {
        chave: `n${contador.current}`,
        id: null,
        titulo: "",
        mensagem: "",
        tag: "",
        data: hoje(),
        imagemUrl: null,
        imagemNova: null,
        removerImagem: false,
      },
      ...prev,
    ])
  }

  const remover = (chave: string) => {
    setAvisos((prev) => prev.filter((a) => a.chave !== chave))
  }

  const mover = (chave: string, direcao: -1 | 1) => {
    setAvisos((prev) => {
      const i = prev.findIndex((a) => a.chave === chave)
      const j = i + direcao
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const copia = [...prev]
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return copia
    })
  }

  const escolherImagem = async (chave: string, arquivo: File | undefined) => {
    if (!arquivo) return
    setMessage(null)
    try {
      const imagemNova = await comprimirImagem(arquivo)
      atualizar(chave, { imagemNova, removerImagem: false })
    } catch (erro) {
      setMessage({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível usar essa imagem." })
    }
  }

  const salvar = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/biblionews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          avisos.map((a) => ({
            id: a.id,
            titulo: a.titulo,
            mensagem: a.mensagem,
            tag: a.tag,
            data: a.data || null,
            imagem: a.imagemNova,
            removerImagem: a.removerImagem && !a.imagemNova,
          }))
        ),
      })

      if (!response.ok) {
        const erro = await response.json().catch(() => null)
        throw new Error(erro?.message ?? "Falha ao salvar.")
      }

      await carregar()
      setMessage({ tipo: "ok", texto: "Avisos salvos com sucesso." })
    } catch (erro) {
      setMessage({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Erro ao salvar os avisos. Tente novamente." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>BiblioNews</h1>
        <p>Cadastre os avisos que aparecem no BiblioNews da página inicial: imagem, categoria, data, título e texto.</p>
      </div>

      <div className="ab-panel">
        <div className="ab-toolbar">
          <button type="button" className="ab-btn-primary" onClick={adicionar}>
            + Novo aviso
          </button>
          <button type="button" className="ab-btn-secondary" onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
        <p className="ab-tip">
          O <strong>primeiro</strong> aviso da lista aparece em destaque (card grande, com a imagem) na página inicial. Use as setas para mudar a
          ordem. As alterações só valem depois de clicar em <strong>Salvar alterações</strong>.
        </p>

        {message && <div className={`ab-feedback ${message.tipo}`}>{message.texto}</div>}

        {loading ? (
          <div className="ab-feedback">Carregando avisos...</div>
        ) : avisos.length === 0 ? (
          <div className="ab-feedback">Nenhum aviso cadastrado. Clique em &ldquo;+ Novo aviso&rdquo; para começar.</div>
        ) : (
          <div className="ab-list">
            {avisos.map((aviso, indice) => {
              const previa = aviso.imagemNova ?? (aviso.removerImagem ? null : aviso.imagemUrl)
              return (
                <div key={aviso.chave} className="ab-card">
                  <div className="ab-card-top">
                    <span className={`ab-badge${indice === 0 ? " destaque" : ""}`}>{indice === 0 ? <><Icone nome="estrela" tamanho="1em" /> Destaque</> : `Aviso ${indice + 1}`}</span>
                    <div className="ab-card-actions">
                      <button type="button" className="ab-icon-btn" onClick={() => mover(aviso.chave, -1)} disabled={indice === 0} aria-label="Mover para cima">
                        <Icone nome="setaCima" tamanho={17} />
                      </button>
                      <button
                        type="button"
                        className="ab-icon-btn"
                        onClick={() => mover(aviso.chave, 1)}
                        disabled={indice === avisos.length - 1}
                        aria-label="Mover para baixo"
                      >
                        <Icone nome="setaBaixo" tamanho={17} />
                      </button>
                      <button type="button" className="ab-delete" onClick={() => remover(aviso.chave)}>
                        Remover aviso
                      </button>
                    </div>
                  </div>

                  <div className="ab-card-body">
                    <div className="ab-image-col">
                      <div className="ab-image-box">
                        {previa ? <img src={previa} alt="" /> : <span>Sem imagem</span>}
                      </div>
                      <label className="ab-btn-small">
                        {previa ? "Trocar imagem" : "Escolher imagem"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            escolherImagem(aviso.chave, e.target.files?.[0])
                            e.target.value = ""
                          }}
                        />
                      </label>
                      {previa && (
                        <button
                          type="button"
                          className="ab-btn-small ghost"
                          onClick={() => atualizar(aviso.chave, { imagemNova: null, removerImagem: true })}
                        >
                          Remover imagem
                        </button>
                      )}
                      <small>JPG, PNG ou WebP. A imagem é reduzida automaticamente.</small>
                    </div>

                    <div className="ab-fields">
                      <div className="ab-row-2">
                        <div className="ab-field">
                          <label>Categoria</label>
                          <input
                            list="ab-categorias"
                            value={aviso.tag}
                            maxLength={40}
                            placeholder="Ex.: Evento, Aviso, Novos livros"
                            onChange={(e) => atualizar(aviso.chave, { tag: e.target.value })}
                          />
                        </div>
                        <div className="ab-field">
                          <label>Data</label>
                          <input type="date" value={aviso.data} onChange={(e) => atualizar(aviso.chave, { data: e.target.value })} />
                        </div>
                      </div>
                      <div className="ab-field">
                        <label>Título</label>
                        <input value={aviso.titulo} maxLength={150} onChange={(e) => atualizar(aviso.chave, { titulo: e.target.value })} />
                      </div>
                      <div className="ab-field">
                        <label>Texto do aviso</label>
                        <textarea value={aviso.mensagem} maxLength={2000} onChange={(e) => atualizar(aviso.chave, { mensagem: e.target.value })} />
                        <small>{aviso.mensagem.length}/2000</small>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <datalist id="ab-categorias">
          {CATEGORIAS_SUGERIDAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <style>{`
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: #2d1414; margin-bottom: 8px; }
        .page-header p { color: #6d5f5f; font-size: 1rem; max-width: 640px; }
        .ab-panel { display: grid; gap: 18px; }
        .ab-toolbar { display: flex; gap: 12px; flex-wrap: wrap; }
        .ab-btn-primary, .ab-btn-secondary { border: none; border-radius: 999px; padding: 12px 22px; font-weight: 700; font-size: 0.95rem; cursor: pointer; font-family: 'Source Sans 3', sans-serif; }
        .ab-btn-primary { background: #8b1e1e; color: white; }
        .ab-btn-secondary { background: #f4ede3; color: #6a2a2a; border: 1px solid rgba(139,30,30,0.18); }
        .ab-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ab-tip { color: #7d6a6a; font-size: 0.92rem; line-height: 1.5; max-width: 760px; }
        .ab-feedback { padding: 16px 18px; background: #fff5f2; border: 1px solid rgba(139,30,30,0.16); border-radius: 16px; color: #8b1e1e; }
        .ab-feedback.ok { background: #f0faf4; border-color: #86efac; color: #166534; }
        .ab-list { display: grid; gap: 18px; }
        .ab-card { padding: 20px; border-radius: 22px; background: #fffdf8; border: 1px solid rgba(139,30,30,0.12); box-shadow: 0 14px 28px rgba(88,30,30,0.07); }
        .ab-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .ab-badge { font-size: 0.8rem; font-weight: 800; padding: 5px 12px; border-radius: 999px; background: #f4ede3; color: #7d6a6a; }
        .ab-badge.destaque { background: #f4e4c4; color: #8a5a12; }
        .ab-card-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ab-icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(139,30,30,0.18); background: #fff; color: #6a2a2a; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .ab-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ab-delete { border: none; background: rgba(255,230,226,0.95); color: #8b1e1e; padding: 9px 14px; border-radius: 999px; cursor: pointer; font-weight: 700; font-size: 0.88rem; }
        .ab-card-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 22px; align-items: start; }
        .ab-image-col { display: grid; gap: 8px; }
        .ab-image-col small { color: #8b7a74; font-size: 0.78rem; line-height: 1.35; }
        .ab-image-box { width: 100%; aspect-ratio: 16 / 10; border-radius: 14px; border: 1px dashed rgba(139,30,30,0.28); background: #f6efe6; display: flex; align-items: center; justify-content: center; color: #9c8a84; font-size: 0.9rem; overflow: hidden; }
        .ab-image-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ab-btn-small { display: block; text-align: center; border: none; border-radius: 999px; padding: 9px 14px; background: #8b1e1e; color: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; font-family: 'Source Sans 3', sans-serif; }
        .ab-btn-small.ghost { background: rgba(255,230,226,0.95); color: #8b1e1e; }
        .ab-fields { display: grid; gap: 14px; }
        .ab-row-2 { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; }
        .ab-field { display: grid; gap: 6px; }
        .ab-field label { font-size: 0.88rem; font-weight: 700; color: #5f4444; }
        .ab-field small { color: #8b7a74; font-size: 0.78rem; justify-self: end; }
        .ab-field input, .ab-field textarea { width: 100%; border: 1px solid rgba(139,30,30,0.18); border-radius: 14px; padding: 10px 12px; font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; color: #2e1414; background: #fff; }
        .ab-field textarea { min-height: 110px; resize: vertical; }
        @media (max-width: 760px) {
          .ab-card-body { grid-template-columns: minmax(0, 1fr); }
          .ab-row-2 { grid-template-columns: minmax(0, 1fr); }
          .ab-image-col { max-width: 320px; }
        }
      `}</style>
    </div>
  )
}
