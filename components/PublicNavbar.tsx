"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Icone, type NomeIcone } from "@/components/Icone"

type Item = {
  href: string
  label: string
  icone: NomeIcone
  /** links com # são âncoras da página inicial: usam <a> para manter a rolagem suave */
  ancora?: boolean
  ativo?: (caminho: string) => boolean
}

const ITENS: Item[] = [
  { href: "/#catalogo", label: "Catálogo", icone: "livros", ancora: true, ativo: (p) => p.startsWith("/catalogo") || p.startsWith("/livro") },
  { href: "/#biblionews", label: "BiblioNews", icone: "news", ancora: true },
  { href: "/#sobre", label: "Sobre a biblioteca", icone: "info", ancora: true },
  { href: "/tcc", label: "TCC & Artigos", icone: "tcc", ativo: (p) => p.startsWith("/tcc") },
]

const ADMIN: Item = { href: "/admin/login", label: "Área do Admin", icone: "cadeado" }

export function PublicNavbar() {
  const caminho = usePathname() ?? "/"
  const [menuAberto, setMenuAberto] = useState(false)

  const fechar = () => setMenuAberto(false)
  const estaAtivo = (item: Item) => !!item.ativo?.(caminho)

  function renderLink(item: Item, classe: string, aoClicar?: () => void, tamanhoIcone = 17) {
    const conteudo = (
      <>
        <Icone nome={item.icone} tamanho={tamanhoIcone} />
        <span>{item.label}</span>
      </>
    )
    const props = {
      className: `${classe}${estaAtivo(item) ? " ativo" : ""}`,
      onClick: aoClicar,
      "aria-current": estaAtivo(item) ? ("page" as const) : undefined,
    }
    return item.ancora ? (
      <a key={item.href} href={item.href} {...props}>{conteudo}</a>
    ) : (
      <Link key={item.href} href={item.href} {...props}>{conteudo}</Link>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap');

        html { scroll-padding-top: 60px; }

        .pn-bar {
          position: sticky; top: 0; z-index: 100; width: 100%;
          background: rgba(120, 26, 26, 0.96); backdrop-filter: blur(12px);
          box-shadow: 0 8px 26px rgba(36, 10, 10, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-family: 'Source Sans 3', sans-serif;
        }
        .pn-inner {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px;
          padding: 12px 38px 12px 42px;
        }

        /* Nome da biblioteca: mesma fonte minimalista da área de admin, igual em todas as páginas */
        .pn-brand {
          min-width: 0; text-decoration: none; color: #fff7f0;
          font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.86rem;
          letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.25;
        }
        .pn-brand b { font-weight: 700; color: #f4c58c; }

        .pn-links { display: flex; align-items: center; gap: 8px; }
        .pn-link, .pn-admin {
          display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
          padding: 8px 14px; border-radius: 999px; text-decoration: none;
          font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.9rem;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .pn-link {
          color: #fff2ea; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.13);
        }
        .pn-link svg { opacity: 0.85; transition: opacity 0.2s ease; }
        .pn-link:hover { transform: translateY(-1px); background: rgba(255, 255, 255, 0.18); border-color: rgba(255, 255, 255, 0.26); }
        .pn-link:hover svg { opacity: 1; }
        .pn-link.ativo {
          background: #fff7ef; color: #6d1414; border-color: #fff7ef;
          box-shadow: 0 8px 18px rgba(36, 10, 10, 0.22);
        }
        .pn-link.ativo svg { opacity: 1; }

        .pn-admin {
          margin-left: 6px; color: #4a0e0e; border: 1px solid rgba(255, 255, 255, 0.4);
          background: linear-gradient(180deg, #f9deb2 0%, #f0bd7f 100%);
          box-shadow: 0 8px 18px rgba(36, 10, 10, 0.25);
        }
        .pn-admin:hover { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 12px 22px rgba(36, 10, 10, 0.3); }

        .pn-link:focus-visible, .pn-admin:focus-visible, .pn-menu-btn:focus-visible, .pn-menu-item:focus-visible, .pn-brand:focus-visible {
          outline: 2px solid #f4c58c; outline-offset: 3px;
        }

        /* menu do celular */
        .pn-mobile { position: relative; display: none; }
        .pn-menu-btn {
          width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.18); cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: #fff2ea;
          background: rgba(255, 255, 255, 0.12); transition: background 0.2s ease, transform 0.2s ease;
        }
        .pn-menu-btn:hover { background: rgba(255, 255, 255, 0.22); transform: translateY(-1px); }
        .pn-backdrop { position: fixed; inset: 0; z-index: 149; }
        .pn-menu {
          position: absolute; top: calc(100% + 10px); right: 0; z-index: 150; min-width: 236px;
          background: #fffdf9; border-radius: 18px; padding: 8px; border: 1px solid rgba(139, 30, 30, 0.1);
          box-shadow: 0 18px 40px rgba(36, 10, 10, 0.24);
          display: flex; flex-direction: column; gap: 2px; animation: pnPop 0.18s ease-out both;
        }
        @keyframes pnPop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .pn-menu-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 12px;
          text-decoration: none; color: #3b1616; font-weight: 700; font-size: 0.95rem;
          transition: background 0.18s ease;
        }
        .pn-menu-item svg { color: #8b1e1e; }
        .pn-menu-item:hover { background: rgba(139, 30, 30, 0.08); }
        .pn-menu-item.ativo { background: rgba(139, 30, 30, 0.12); color: #6d1414; }
        .pn-menu-sep { height: 1px; margin: 6px 4px; background: rgba(139, 30, 30, 0.12); }
        .pn-menu-item.admin { background: linear-gradient(180deg, #f9deb2 0%, #f0bd7f 100%); color: #4a0e0e; }
        .pn-menu-item.admin svg { color: #4a0e0e; }

        @media (max-width: 1240px) {
          .pn-links { display: none; }
          .pn-mobile { display: block; }
        }
        @media (max-width: 640px) {
          .pn-inner { padding: 9px 14px; gap: 12px; }
          .pn-brand { font-size: 0.7rem; letter-spacing: 0.08em; }
          .pn-menu-btn { width: 38px; height: 38px; }
        }
        @media (max-width: 420px) {
          .pn-brand span, .pn-brand b { display: block; }
        }
      `}</style>

      <header className="pn-bar">
        <div className="pn-inner">
          <Link href="/" className="pn-brand" aria-label="Biblioteca Escolar Emerson Teixeira — ir para o início">
            <span>Biblioteca Escolar</span> <b>Emerson Teixeira</b>
          </Link>

          <nav className="pn-links" aria-label="Navegação principal">
            {ITENS.map((item) => renderLink(item, "pn-link"))}
            {renderLink(ADMIN, "pn-admin")}
          </nav>

          <div className="pn-mobile">
            <button
              type="button"
              className="pn-menu-btn"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
            >
              <Icone nome={menuAberto ? "x" : "menu"} tamanho={20} />
            </button>
            {menuAberto && (
              <>
                <div className="pn-backdrop" onClick={fechar} />
                <div className="pn-menu">
                  {ITENS.map((item) => renderLink(item, "pn-menu-item", fechar, 19))}
                  <div className="pn-menu-sep" />
                  {renderLink(ADMIN, "pn-menu-item admin", fechar, 19)}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
