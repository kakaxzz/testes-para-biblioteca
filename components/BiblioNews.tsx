"use client"

import { useEffect, useMemo, useState } from "react"
import { Icone as IconeUI } from "@/components/Icone"

type Aviso = {
  id: number
  titulo: string
  mensagem: string
  tag: string
  data: string
  imagemUrl: string | null
}

type NomeIcone = "livros" | "relogio" | "calendario" | "livro-aberto" | "megafone"
type Categoria = "novos-livros" | "aviso" | "evento" | "clube" | "outro"

const ESTILOS: Record<Categoria, { fundo: string; cor: string; icone: NomeIcone }> = {
  "novos-livros": { fundo: "#e1ede5", cor: "#2f6b45", icone: "livros" },
  aviso: { fundo: "#f8d6d2", cor: "#a32424", icone: "relogio" },
  evento: { fundo: "#f4e4c4", cor: "#8a5a12", icone: "calendario" },
  clube: { fundo: "#f3e3c0", cor: "#8a5a12", icone: "livro-aberto" },
  outro: { fundo: "#f1e0dc", cor: "#7a2a2a", icone: "megafone" },
}

const ROTULO_FILTRO: Record<Exclude<Categoria, "outro">, string> = {
  "novos-livros": "Novos livros",
  aviso: "Avisos",
  evento: "Eventos",
  clube: "Clube do Livro",
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

function categoriaDaTag(tag: string): Categoria {
  const t = normalizar(tag)
  if (t.includes("clube")) return "clube"
  if (t.includes("livro") && t.includes("novo")) return "novos-livros"
  if (t.includes("aviso") || t.includes("comunicado")) return "aviso"
  if (t.includes("evento") || t.includes("encontro") || t.includes("feira")) return "evento"
  return "outro"
}

function chaveDoFiltro(tag: string) {
  const categoria = categoriaDaTag(tag)
  return categoria === "outro" ? `outro:${normalizar(tag)}` : categoria
}

function formatarData(texto: string) {
  const [ano, mes, dia] = texto.split("-").map(Number)
  if (!ano || !mes || !dia) return ""
  const opcoes: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }
  if (ano !== new Date().getFullYear()) opcoes.year = "numeric"
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", opcoes)
}

function Icone({ nome, tamanho = 30 }: { nome: NomeIcone; tamanho?: number }) {
  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (nome) {
    case "livros":
      return (
        <svg {...comum}>
          <path d="M4.5 4h3.5v16H4.5zM9.5 4H13v16H9.5z" />
          <path d="M14.6 5.6l3.3-.9 3.2 14.7-3.3.9z" />
        </svg>
      )
    case "relogio":
      return (
        <svg {...comum}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      )
    case "calendario":
      return (
        <svg {...comum}>
          <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
          <path d="M8 3.5v4M16 3.5v4M4 10.5h16" />
          <rect x="8" y="13.5" width="4" height="3" rx="0.6" />
        </svg>
      )
    case "livro-aberto":
      return (
        <svg {...comum}>
          <path d="M3 5.5c3-1.2 6.2-.9 9 1 2.8-1.9 6-2.2 9-1v13c-3-1.2-6.2-.9-9 1-2.8-1.9-6-2.2-9-1z" />
          <path d="M12 6.5v13" />
        </svg>
      )
    default:
      return (
        <svg {...comum}>
          <path d="M4 10v4h3l7 4V6L7 10z" />
          <path d="M17.5 9.5a4 4 0 010 5" />
        </svg>
      )
  }
}

function Etiqueta({ tag }: { tag: string }) {
  if (!tag) return null
  const estilo = ESTILOS[categoriaDaTag(tag)]
  return (
    <span className="bn-pill" style={{ background: estilo.fundo, color: estilo.cor }}>
      {tag}
    </span>
  )
}

export function BiblioNews() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState("todos")
  const [aberto, setAberto] = useState<Aviso | null>(null)
  const [verTodos, setVerTodos] = useState(false)

  useEffect(() => {
    fetch("/api/biblionews", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setAvisos(Array.isArray(data) ? data : []))
      .catch(() => setAvisos([]))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(null)
    }
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", aoTeclar)
    return () => {
      window.removeEventListener("keydown", aoTeclar)
      document.body.style.overflow = overflowAnterior
    }
  }, [aberto])

  const filtros = useMemo(() => {
    const vistos = new Map<string, string>()
    avisos.forEach((a) => {
      const chave = chaveDoFiltro(a.tag)
      if (vistos.has(chave)) return
      const categoria = categoriaDaTag(a.tag)
      vistos.set(chave, categoria === "outro" ? a.tag || "Outros" : ROTULO_FILTRO[categoria])
    })
    return Array.from(vistos, ([chave, rotulo]) => ({ chave, rotulo }))
  }, [avisos])

  const visiveis = filtro === "todos" ? avisos : avisos.filter((a) => chaveDoFiltro(a.tag) === filtro)
  const destaque = visiveis[0]
  const laterais = visiveis.slice(1, 4)
  const extras = visiveis.slice(4)

  const cartaoCompacto = (aviso: Aviso) => {
    const estilo = ESTILOS[categoriaDaTag(aviso.tag)]
    return (
      <button key={aviso.id} type="button" className="bn-compact" onClick={() => setAberto(aviso)}>
        <span className="bn-tile" style={{ background: estilo.fundo, color: estilo.cor }}>
          {aviso.imagemUrl ? <img src={aviso.imagemUrl} alt="" /> : <Icone nome={estilo.icone} />}
        </span>
        <span className="bn-compact-info">
          <Etiqueta tag={aviso.tag} />
          <strong>{aviso.titulo}</strong>
          <small>{formatarData(aviso.data)}</small>
        </span>
      </button>
    )
  }

  return (
    <div className="bn">
      <style>{`
        .bn-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-bottom: 28px; }
        .bn-head .notice-header { margin-bottom: 0; }
        .bn-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .bn-chip { border: none; cursor: pointer; font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; font-weight: 700; padding: 8px 18px; border-radius: 999px; background: #f4dcd8; color: #7a2a2a; transition: background 0.2s ease, transform 0.2s ease; }
        .bn-chip:hover { transform: translateY(-1px); background: #efcdc8; }
        .bn-chip.ativo { background: #6b1a17; color: #fff7ef; }

        .bn-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 24px; align-items: start; }
        .bn-grid.solo { grid-template-columns: minmax(0, 1fr); }

        .bn-feature { background: #fffdfa; border: 1px solid #eadfd4; border-radius: 24px; overflow: hidden; box-shadow: 0 14px 32px rgba(60,14,14,0.07); }
        .bn-feature-media { height: clamp(200px, 24vw, 260px); background: linear-gradient(160deg, #8a3a36 0%, #6f2a27 100%); color: #f0c58a; display: flex; align-items: center; justify-content: center; }
        .bn-feature-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bn-feature-body { padding: 24px 28px 28px; }
        .bn-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
        .bn-date { font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; color: #8b7a74; }
        .bn-pill { display: inline-block; font-family: 'Source Sans 3', sans-serif; font-size: 0.86rem; font-weight: 700; padding: 5px 14px; border-radius: 999px; }
        .bn-feature h3 { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 2.4vw, 1.95rem); line-height: 1.15; color: #2d1414; margin-bottom: 10px; }
        .bn-desc { font-family: 'Source Sans 3', sans-serif; font-size: 1.02rem; line-height: 1.55; color: #8b7a74; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; }
        .bn-read { border: none; background: none; padding: 0; cursor: pointer; font-family: 'Source Sans 3', sans-serif; font-size: 1rem; font-weight: 700; color: #6b1a17; }
        .bn-read:hover { text-decoration: underline; }

        .bn-side { display: flex; flex-direction: column; gap: 16px; }
        .bn-compact { display: flex; align-items: center; gap: 20px; width: 100%; text-align: left; padding: 18px; font: inherit; cursor: pointer; background: #fffdfa; border: 1px solid #eadfd4; border-radius: 22px; transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .bn-compact:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgba(60,14,14,0.1); }
        .bn-tile { flex-shrink: 0; width: 112px; height: 112px; border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .bn-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bn-compact-info { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; }
        .bn-compact-info strong { font-family: 'Source Sans 3', sans-serif; font-size: 1.12rem; line-height: 1.25; color: #2d1414; overflow-wrap: anywhere; }
        .bn-compact-info small { font-family: 'Source Sans 3', sans-serif; font-size: 0.95rem; color: #8b7a74; }

        .bn-extras { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 16px; }
        .bn-more { display: block; margin: 22px auto 0; border: 1px solid rgba(139,30,30,0.22); background: #fffdfa; color: #6b1a17; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.95rem; padding: 10px 22px; border-radius: 999px; cursor: pointer; transition: background 0.2s ease; }
        .bn-more:hover { background: #f8ece8; }
        .bn-vazio { font-family: 'Source Sans 3', sans-serif; color: #8b7a74; background: #fffdfa; border: 1px solid #eadfd4; border-radius: 22px; padding: 28px; text-align: center; }

        .bn-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(36,10,10,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; animation: bnFade 0.18s ease-out both; }
        .bn-modal { position: relative; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; background: #fffdfa; border-radius: 24px; box-shadow: 0 30px 70px rgba(20,4,4,0.35); }
        .bn-modal-img { width: 100%; max-height: 300px; object-fit: cover; display: block; }
        .bn-modal-body { padding: 24px 28px 30px; }
        .bn-modal h3 { font-family: 'Playfair Display', serif; font-size: 1.8rem; line-height: 1.15; color: #2d1414; margin-bottom: 14px; }
        .bn-modal-text { font-family: 'Source Sans 3', sans-serif; font-size: 1.05rem; line-height: 1.65; color: #4a3535; white-space: pre-wrap; overflow-wrap: anywhere; }
        .bn-close { position: absolute; top: 12px; right: 12px; width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer; background: rgba(255,253,250,0.92); color: #6b1a17; font-size: 1.5rem; line-height: 1; box-shadow: 0 6px 16px rgba(0,0,0,0.18); }
        @keyframes bnFade { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 900px) {
          .bn-tile { width: 92px; height: 92px; }
          .bn-feature-body { padding: 20px 20px 24px; }
          .bn-modal-body { padding: 20px 20px 26px; }
        }

        @media (max-width: 640px) {
          .bn-grid { gap: 10px; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
          .bn-chip { font-size: 0.78rem; padding: 5px 12px; }
          .bn-feature { border-radius: 14px; }
          .bn-feature-media { height: 110px; }
          .bn-feature-body { padding: 10px 12px 14px; }
          .bn-meta { gap: 6px; margin-bottom: 6px; }
          .bn-date { font-size: 0.68rem; }
          .bn-pill { font-size: 0.62rem; padding: 2px 8px; }
          .bn-feature h3 { font-size: 0.95rem; margin-bottom: 6px; }
          .bn-desc { font-size: 0.74rem; line-height: 1.4; margin-bottom: 8px; -webkit-line-clamp: 4; }
          .bn-read { font-size: 0.74rem; }
          .bn-side { gap: 8px; }
          .bn-compact { gap: 8px; padding: 8px; border-radius: 14px; }
          .bn-tile { width: 44px; height: 44px; border-radius: 10px; }
          .bn-compact-info { gap: 2px; }
          .bn-compact-info strong { font-size: 0.76rem; line-height: 1.2; }
          .bn-compact-info small { font-size: 0.64rem; }
          .bn-extras { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-top: 8px; }
          .bn-more { font-size: 0.8rem; padding: 8px 16px; margin-top: 14px; }
        }
      `}</style>

      <div className="bn-head">
        <div className="notice-header">
          <div className="catalog-accent" />
          <div>
            <h2 className="catalog-title">BiblioNews</h2>
            <p className="notice-subtitle">Fique por dentro das novidades, avisos e comunicados da biblioteca.</p>
          </div>
        </div>

        {filtros.length > 1 && (
          <div className="bn-chips">
            <button type="button" className={`bn-chip${filtro === "todos" ? " ativo" : ""}`} onClick={() => setFiltro("todos")}>
              Todos
            </button>
            {filtros.map((f) => (
              <button key={f.chave} type="button" className={`bn-chip${filtro === f.chave ? " ativo" : ""}`} onClick={() => setFiltro(f.chave)}>
                {f.rotulo}
              </button>
            ))}
          </div>
        )}
      </div>

      {carregando ? (
        <div className="bn-vazio">Carregando avisos...</div>
      ) : !destaque ? (
        <div className="bn-vazio">Nenhum aviso publicado por enquanto.</div>
      ) : (
        <>
          <div className={`bn-grid${laterais.length === 0 ? " solo" : ""}`}>
            <article className="bn-feature">
              <div className="bn-feature-media">
                {destaque.imagemUrl ? (
                  <img src={destaque.imagemUrl} alt={destaque.titulo} />
                ) : (
                  <Icone nome={ESTILOS[categoriaDaTag(destaque.tag)].icone} tamanho={64} />
                )}
              </div>
              <div className="bn-feature-body">
                <div className="bn-meta">
                  <Etiqueta tag={destaque.tag} />
                  <span className="bn-date">{formatarData(destaque.data)}</span>
                </div>
                <h3>{destaque.titulo}</h3>
                <p className="bn-desc">{destaque.mensagem}</p>
                <button type="button" className="bn-read" onClick={() => setAberto(destaque)}>
                  Ler aviso <IconeUI nome="setaDireita" tamanho="1em" />
                </button>
              </div>
            </article>

            {laterais.length > 0 && <div className="bn-side">{laterais.map(cartaoCompacto)}</div>}
          </div>

          {extras.length > 0 && (
            <>
              {verTodos && <div className="bn-extras">{extras.map(cartaoCompacto)}</div>}
              <button type="button" className="bn-more" onClick={() => setVerTodos((v) => !v)}>
                {verTodos ? "Mostrar menos" : `Ver mais avisos (${extras.length})`}
              </button>
            </>
          )}
        </>
      )}

      {aberto && (
        <div className="bn-overlay" onClick={() => setAberto(null)} role="presentation">
          <div className="bn-modal" role="dialog" aria-modal="true" aria-label={aberto.titulo} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="bn-close" onClick={() => setAberto(null)} aria-label="Fechar aviso">
              ×
            </button>
            {aberto.imagemUrl && <img className="bn-modal-img" src={aberto.imagemUrl} alt="" />}
            <div className="bn-modal-body">
              <div className="bn-meta">
                <Etiqueta tag={aberto.tag} />
                <span className="bn-date">{formatarData(aberto.data)}</span>
              </div>
              <h3>{aberto.titulo}</h3>
              <p className="bn-modal-text">{aberto.mensagem}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
