"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/livros", label: "Livros", icon: "📚" },
  { href: "/admin/emprestimos", label: "Empréstimos", icon: "📖" },
  { href: "/admin/usuarios", label: "Usuários", icon: "🎓" },
  { href: "/admin/tcc", label: "TCCs & Artigos", icon: "📄" },
  { href: "/admin/stats", label: "Estatísticas", icon: "📈" },
  { href: "/admin/biblionews", label: "BiblioNews", icon: "📰" },
  { href: "/admin/trocar-senha", label: "Trocar senha", icon: "🔑" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuAberto, setMenuAberto] = useState(false)

  if (pathname === "/admin/login") return <>{children}</>

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/")
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-menu-wrap">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label="Abrir menu"
            >
              <span /><span /><span />
            </button>
            {menuAberto && (
              <>
                <div className="admin-menu-backdrop" onClick={() => setMenuAberto(false)} />
                <div className="admin-menu-dropdown">
                  {navItems.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-menu-item${active ? " active" : ""}`}
                        onClick={() => setMenuAberto(false)}
                      >
                        <span className="admin-menu-icon">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  })}
                  <button type="button" className="admin-menu-item admin-menu-logout" onClick={handleLogout}>
                    <span className="admin-menu-icon">🚪</span>
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
          <h1 className="admin-topbar-title">Área de Admin</h1>
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
        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 32px;
          background: linear-gradient(90deg, #661414 0%, #7e1919 46%, #6a1414 100%);
          box-shadow: 0 10px 26px rgba(65, 11, 11, 0.18);
        }
        .admin-topbar-left { display: flex; align-items: center; gap: 16px; }
        .admin-topbar-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff7ef;
        }
        .admin-menu-wrap { position: relative; }
        .admin-menu-btn {
          border: none; cursor: pointer; background: rgba(255,255,255,0.14);
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; gap: 3px;
          transition: transform 0.22s ease, background 0.22s ease;
        }
        .admin-menu-btn span { width: 4px; height: 4px; border-radius: 50%; background: #fff2ea; display: block; }
        .admin-menu-btn:hover { transform: scale(1.06); background: rgba(255,255,255,0.24); }
        .admin-menu-backdrop { position: fixed; inset: 0; z-index: 149; }
        .admin-menu-dropdown {
          position: absolute; top: calc(100% + 10px); left: 0; z-index: 150;
          background: #fffdf9; border-radius: 14px; padding: 8px; min-width: 220px;
          box-shadow: 0 18px 40px rgba(36, 10, 10, 0.22); border: 1px solid rgba(139,30,30,0.08);
          display: flex; flex-direction: column; gap: 2px;
          animation: adminMenuPop 0.18s ease-out both;
        }
        @keyframes adminMenuPop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .admin-menu-item {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
          color: #3b1616; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.94rem;
          padding: 10px 12px; border-radius: 10px; border: none; background: transparent;
          cursor: pointer; width: 100%; text-align: left; transition: background 0.16s ease;
        }
        .admin-menu-item:hover { background: rgba(139,30,30,0.08); }
        .admin-menu-item.active { background: rgba(139,30,30,0.12); color: #6a2a2a; }
        .admin-menu-icon { width: 20px; text-align: center; font-size: 1rem; }
        .admin-menu-logout { border-top: 1px solid rgba(139,30,30,0.1); margin-top: 4px; padding-top: 12px; color: #8b1e1e; }
        .admin-back-btn {
          text-decoration: none; background: rgba(255,255,255,0.14); color: #fff7ef;
          border: 1px solid rgba(255,255,255,0.22); padding: 10px 20px; border-radius: 999px;
          font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.9rem;
          transition: transform 0.18s ease, background 0.18s ease; white-space: nowrap;
        }
        .admin-back-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.22); }
        .admin-main { min-height: calc(100vh - 68px); }
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
        }
        .input-group label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--cinza-medio);
          letter-spacing: 0.03em;
        }
        .input-field {
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
          .admin-topbar { padding: 14px 18px; }
          .admin-topbar-title { font-size: 1.15rem; }
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
