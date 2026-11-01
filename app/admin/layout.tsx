"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

type NomeIcone = "home" | "livros" | "emprestimos" | "usuarios" | "tcc" | "stats" | "news" | "virada" | "chave" | "sair"

const navItems: { href: string; label: string; icone: NomeIcone; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icone: "home", exact: true },
  { href: "/admin/livros", label: "Livros", icone: "livros" },
  { href: "/admin/emprestimos", label: "Empréstimos", icone: "emprestimos" },
  { href: "/admin/usuarios", label: "Usuários", icone: "usuarios" },
  { href: "/admin/tcc", label: "TCCs & Artigos", icone: "tcc" },
  { href: "/admin/stats", label: "Estatísticas", icone: "stats" },
  { href: "/admin/virada", label: "Virada de ano", icone: "virada" },
  { href: "/admin/biblionews", label: "BiblioNews", icone: "news" },
  { href: "/admin/trocar-senha", label: "Trocar senha", icone: "chave" },
]

function Icone({ nome }: { nome: NomeIcone }) {
  const comum = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (nome) {
    case "home":
      return (
        <svg {...comum}>
          <path d="M4 11l8-6.5L20 11" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      )
    case "livros":
      return (
        <svg {...comum}>
          <path d="M5 4h3.5v16H5zM10.5 4H14v16h-3.5z" />
          <path d="M15.8 5.4l3.3-.9 3 14.6-3.3.9z" />
        </svg>
      )
    case "emprestimos":
      return (
        <svg {...comum}>
          <path d="M4 8h13l-3-3" />
          <path d="M20 16H7l3 3" />
        </svg>
      )
    case "usuarios":
      return (
        <svg {...comum}>
          <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
          <path d="M6.5 11.8V16c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.2" />
          <path d="M21.5 9.5V15" />
        </svg>
      )
    case "tcc":
      return (
        <svg {...comum}>
          <path d="M7 3.5h7l4 4V20.5H7z" />
          <path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" />
        </svg>
      )
    case "stats":
      return (
        <svg {...comum}>
          <path d="M5 20V11M12 20V4M19 20v-6" />
        </svg>
      )
    case "news":
      return (
        <svg {...comum}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 12.5h8M8 16h5" />
        </svg>
      )
    case "virada":
      return (
        <svg {...comum}>
          <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
          <path d="M8 3.5v4M16 3.5v4M4 10h16" />
        </svg>
      )
    case "chave":
      return (
        <svg {...comum}>
          <circle cx="8" cy="15" r="3.5" />
          <path d="M10.5 12.5L19 4M16 7l2.5 2.5M13.5 9.5l2 2" />
        </svg>
      )
    default:
      return (
        <svg {...comum}>
          <path d="M10 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H10" />
          <path d="M15 8l4 4-4 4M19 12H9" />
        </svg>
      )
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuAberto, setMenuAberto] = useState(false) // só usado no celular (gaveta)

  if (pathname === "/admin/login") return <>{children}</>

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/")
  }

  return (
    <div className="admin-shell">
      {/* Barra lateral: fica recolhida (só ícones) e expande ao passar o mouse, como no site do Claude */}
      <aside className={`sidebar no-print${menuAberto ? " aberto" : ""}`} aria-label="Menu do painel">
        <div className="sb-brand">
          <span className="sb-logo">
            <img src="/logo-jpi.png" alt="" />
          </span>
          <span className="sb-brand-text sb-label">Biblioteca Escolar Emerson Teixeira</span>
        </div>

        <nav className="sb-nav">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`sb-item${active ? " active" : ""}`}
                onClick={() => setMenuAberto(false)}
              >
                <span className="sb-icon"><Icone nome={item.icone} /></span>
                <span className="sb-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button type="button" title="Sair" className="sb-item sb-logout" onClick={handleLogout}>
          <span className="sb-icon"><Icone nome="sair" /></span>
          <span className="sb-label">Sair</span>
        </button>
      </aside>

      {menuAberto && <div className="sb-backdrop no-print" onClick={() => setMenuAberto(false)} />}

      <header className="admin-topbar no-print">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <span /><span /><span />
          </button>
          <div>
            <h1 className="admin-topbar-title">Área de Admin</h1>
            <p className="admin-topbar-sub">Biblioteca Escolar Emerson Teixeira</p>
          </div>
        </div>

        <Link href="/" className="admin-back-btn">Voltar ao site</Link>
      </header>

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --vermelho: #8b1e1e;
          --vermelho-hover: #a52424;
          --vermelho-deep: #5e1212;
          --vermelho-soft: #f7e6e1;
          --off-white: #f4ede3;
          --off-white-strong: #fbf7f1;
          --cinza-escuro: #261111;
          --cinza-medio: #6b5757;
          --radius: 22px;
          --sombra: 0 18px 40px rgba(55, 18, 18, 0.08);
          --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        body {
          background: var(--off-white);
          color: var(--cinza-escuro);
          font-family: 'Source Sans 3', sans-serif;
        }
        .admin-shell {
          min-height: 100vh;
          background: linear-gradient(180deg, #f4ede3 0%, #f1e8dc 100%);
        }
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 200;
          width: 72px; padding: 14px 12px; overflow: hidden; white-space: nowrap;
          display: flex; flex-direction: column;
          background: linear-gradient(180deg, #5a1111 0%, #701717 55%, #5e1212 100%);
          color: #fff2ea;
          transition: width 0.26s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.26s ease;
        }
        .sidebar:hover, .sidebar:has(:focus-visible) { width: 272px; box-shadow: 18px 0 44px rgba(30, 6, 6, 0.3); }
        .sb-brand {
          display: flex; align-items: center; gap: 12px; min-height: 62px;
          padding-bottom: 16px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.13);
        }
        .sb-logo {
          flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; padding: 3px;
          background: #fff7ef; display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .sb-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .sb-brand-text { width: 188px; white-space: normal; font-family: 'Playfair Display', serif; font-weight: 800; font-size: 0.98rem; line-height: 1.2; color: #fff7ef; }
        .sb-nav { display: flex; flex-direction: column; gap: 4px; }
        .sb-item {
          display: flex; align-items: center; gap: 14px; height: 46px; padding: 0 12px; width: 100%;
          border: none; border-radius: 14px; background: transparent; cursor: pointer; text-align: left;
          color: rgba(255, 242, 234, 0.82); text-decoration: none;
          font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.96rem;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .sb-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .sb-item.active { background: rgba(255,255,255,0.15); color: #fff; }
        .sb-item.active .sb-icon { color: #f4c58c; }
        .sb-icon { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .sb-label { opacity: 0; transform: translateX(-6px); transition: opacity 0.18s ease 0.05s, transform 0.22s ease 0.05s; }
        .sidebar:hover .sb-label, .sidebar:has(:focus-visible) .sb-label { opacity: 1; transform: none; }
        .sb-logout { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.13); border-radius: 0 0 14px 14px; height: 56px; }
        .sb-backdrop { position: fixed; inset: 0; z-index: 190; background: rgba(30, 6, 6, 0.45); }

        .admin-topbar {
          position: sticky; top: 0; z-index: 100; margin-left: 72px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 14px 40px;
          background: rgba(244, 237, 227, 0.88); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(139, 30, 30, 0.1);
        }
        .admin-topbar-left { display: flex; align-items: center; gap: 14px; }
        .admin-topbar-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 800; color: #2d1414; line-height: 1.1; }
        .admin-topbar-sub { margin-top: 3px; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a1888b; }
        .admin-menu-btn {
          display: none; border: none; cursor: pointer; background: #7d1c1c;
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          align-items: center; justify-content: center; gap: 3px;
        }
        .admin-menu-btn span { width: 4px; height: 4px; border-radius: 50%; background: #fff2ea; display: block; }
        .admin-back-btn {
          text-decoration: none; background: #fffdf9; color: #6a2a2a;
          border: 1px solid rgba(139, 30, 30, 0.22); padding: 10px 20px; border-radius: 999px;
          font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.9rem;
          transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease; white-space: nowrap;
        }
        .admin-back-btn:hover { transform: translateY(-1px); background: #8b1e1e; color: #fff7ef; }
        .admin-main { margin-left: 72px; min-height: calc(100vh - 70px); }
        .admin-content { max-width: 1560px; margin: 0 auto; padding: 36px 48px 64px; }
        .page-header {
          background: linear-gradient(90deg, #681313 0%, #842020 42%, #932121 72%, #7a1818 100%);
          border-radius: var(--radius);
          padding: 34px 34px 28px;
          margin-bottom: 32px;
          box-shadow: var(--sombra);
        }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem;
          color: #fff8f1;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
        }
        .page-header p {
          color: rgba(255,255,255,0.78);
          font-size: 1rem;
          font-weight: 600;
        }
        .section-heading { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 24px; }
        .section-heading-bar {
          width: 16px; height: 42px; border-radius: 999px;
          background: linear-gradient(180deg, #5f1212 0%, #8f2222 100%);
          box-shadow: 0 8px 18px rgba(95,18,18,0.22); flex-shrink: 0;
        }
        .section-heading h2 { font-family: 'Playfair Display', serif; font-size: 2rem; color: #2d1414; line-height: 1.1; }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,245,0.9) 100%);
          border-radius: var(--radius);
          box-shadow: var(--sombra);
          padding: 28px;
          border: 1px solid rgba(120, 32, 32, 0.05);
          backdrop-filter: blur(6px);
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          color: #2d1414;
          margin-bottom: 18px;
        }
        .section-meta {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 0.9rem;
          color: #9c8d8d;
          font-weight: 600;
          margin-left: 8px;
        }
        .surface-strip {
          display: flex;
          gap: 6px;
          margin-bottom: 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,249,244,0.9) 100%);
          padding: 6px;
          border-radius: 18px;
          width: fit-content;
          box-shadow: 0 10px 24px rgba(55,18,18,0.06);
          border: 1px solid rgba(120,32,32,0.05);
        }
        .surface-strip button {
          padding: 10px 20px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          background: transparent;
          color: #6a5656;
          transition: all var(--transition);
        }
        .surface-strip button.active {
          background: linear-gradient(180deg, #992323 0%, #7e1717 100%);
          color: white;
          box-shadow: 0 12px 22px rgba(126,23,23,0.18);
        }
        .surface-note {
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 0.95rem;
          border: 1px solid rgba(120,32,32,0.08);
          background: rgba(255,255,255,0.62);
        }
        .surface-note.ok {
          background: #f0faf4;
          border-color: #86efac;
        }
        .surface-note.warn {
          background: #fff7e8;
          border-color: #f4d08c;
        }
        .surface-note.error {
          background: #fdf2f2;
          border-color: rgba(139,30,30,0.22);
        }
        .modal-surface {
          background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(252,248,246,0.95) 100%);
          border-radius: 22px;
          padding: 32px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.2);
          border: 1px solid rgba(120,32,32,0.06);
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        /* Modal largo: título e botões ficam sempre visíveis, só o miolo rola */
        .modal-surface.modal-surface--wide {
          max-width: 760px;
          max-height: calc(100dvh - 32px);
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px 14px;
          border-bottom: 1px solid rgba(120,32,32,0.1);
          flex-shrink: 0;
        }
        .modal-body {
          padding: 20px 28px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        .modal-foot {
          display: flex;
          gap: 10px;
          padding: 14px 28px;
          border-top: 1px solid rgba(120,32,32,0.1);
          background: rgba(255,255,255,0.97);
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .modal-head, .modal-body, .modal-foot { padding-left: 18px; padding-right: 18px; }
        }
        .admin-grid-2 {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          align-items: start;
        }
        .admin-grid-2-wide {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
          min-width: 0;
        }
        .input-group label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--cinza-medio);
          letter-spacing: 0.03em;
        }
        .input-field {
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
          border: 1px solid rgba(139,30,30,0.12);
          border-radius: 14px;
          font-size: 0.95rem;
          font-family: 'Source Sans 3', sans-serif;
          color: var(--cinza-escuro);
          transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
          background: rgba(255,255,255,0.76);
        }
        .input-field:focus {
          outline: none;
          border-color: var(--vermelho);
          box-shadow: 0 0 0 3px rgba(139,30,30,0.08);
          background: rgba(255,255,255,0.96);
        }
        textarea.input-field { resize: vertical; min-height: 100px; }
        select.input-field { cursor: pointer; }
        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(180deg, #992323 0%, #7e1717 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Source Sans 3', sans-serif;
          transition: transform var(--transition), box-shadow var(--transition);
          box-shadow: 0 12px 22px rgba(126,23,23,0.18);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(126,23,23,0.22);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          padding: 12px 24px;
          background: rgba(255,255,255,0.86);
          color: var(--vermelho);
          border: 1px solid rgba(139,30,30,0.16);
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Source Sans 3', sans-serif;
          transition: all var(--transition);
        }
        .btn-secondary:hover { background: var(--vermelho-soft); }
        .mensagem-ok {
          padding: 12px 16px;
          background: #f0faf4;
          border: 1px solid #86efac;
          border-radius: 14px;
          color: #166534;
          font-size: 0.95rem;
          margin-top: 16px;
        }
        .mensagem-erro {
          padding: 12px 16px;
          background: #fdf2f2;
          border: 1px solid rgba(139,30,30,0.2);
          border-radius: 14px;
          color: var(--vermelho);
          font-size: 0.95rem;
          margin-top: 16px;
        }
        .table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
          background: transparent;
        }
        th {
          text-align: left;
          padding: 12px 14px;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9d8b8b;
          border-bottom: 2px solid #efe2df;
        }
        td {
          padding: 14px;
          border-bottom: 1px solid #f3e8e5;
          color: var(--cinza-escuro);
          vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fffaf6; }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .badge-green { background: #f0faf4; color: #166534; }
        .badge-red { background: #fdf2f2; color: var(--vermelho); }
        .badge-yellow { background: #fefce8; color: #854d0e; }
        @media (max-width: 900px) {
          .sidebar { width: 272px; transform: translateX(-100%); transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1); }
          .sidebar.aberto { transform: none; box-shadow: 18px 0 44px rgba(30, 6, 6, 0.35); }
          .sb-label { opacity: 1; transform: none; }
          .admin-menu-btn { display: flex; }
          .admin-topbar, .admin-main { margin-left: 0; }
          .admin-topbar { padding: 12px 18px; }
          .admin-topbar-title { font-size: 1.15rem; }
          .admin-topbar-sub { display: none; }
          .admin-back-btn { padding: 9px 14px; font-size: 0.84rem; }
          .admin-content { padding: 20px 18px 32px; }
          .page-header { padding: 24px 22px 20px; }
          .page-header h1 { font-size: 2rem; }
          .admin-grid-2,
          .admin-grid-2-wide {
            grid-template-columns: 1fr;
          }
          .surface-strip {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}
