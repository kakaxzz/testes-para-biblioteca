"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/livros", label: "Livros", icon: "📚" },
  { href: "/admin/emprestimos", label: "Empréstimos", icon: "📖" },
  { href: "/admin/alunos", label: "Alunos", icon: "🎓" },
  { href: "/admin/tcc", label: "TCCs & Artigos", icon: "📄" },
  { href: "/admin/stats", label: "Estatísticas", icon: "📈" },
  { href: "/admin/biblionews", label: "BiblioNews", icon: "📰" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const admin = localStorage.getItem("admin")
    if (!admin && pathname !== "/admin/login") {
      router.replace("/admin/login")
    }
  }, [pathname, router])

  if (pathname === "/admin/login") return <>{children}</>

  function handleLogout() {
    localStorage.removeItem("admin")
    router.replace("/")
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-overlay" />

        <div className="sidebar-logo">
          <img src="/logo-jpi.png" alt="Logo da Biblioteca" className="sidebar-logo-image" />
          <div>
            <div className="sidebar-logo-title">Biblioteca</div>
            <div className="sidebar-logo-sub">Painel Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
        
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Voltar para o site</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main-hero" />
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
          --sidebar-w: 300px;
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
          display: flex;
          min-height: 100vh;
          background: linear-gradient(180deg, #f4ede3 0%, #f1e8dc 100%);
        }
        .sidebar {
          width: var(--sidebar-w);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #661414 0%, #7e1919 46%, #6a1414 100%);
          color: white;
          box-shadow: 12px 0 34px rgba(65, 11, 11, 0.16);
          overflow: hidden;
        }
        .sidebar-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 28%),
            linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0));
          pointer-events: none;
        }
        .sidebar-logo {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-logo-image {
          width: 38px;
          height: 38px;
          object-fit: contain;
          border-radius: 50%;
          background: rgba(255,255,255,0.88);
          padding: 4px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
        }
        .sidebar-logo-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff7ef;
          line-height: 1;
        }
        .sidebar-logo-sub {
          margin-top: 2px;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .sidebar-nav {
          position: relative;
          flex: 1;
          padding: 12px 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          overflow-x: visible;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 16px;
          text-decoration: none;
          color: rgba(255,255,255,0.82);
          font-size: 0.94rem;
          font-weight: 700;
          transition: all var(--transition);
          cursor: pointer;
          border: 1px solid transparent;
          background: transparent;
          width: 100%;
          text-align: left;
          white-space: nowrap;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          transform: translateX(2px);
        }
        .nav-item.active {
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.1) 100%);
          color: white;
          border-color: rgba(255,255,255,0.14);
          box-shadow: inset 3px 0 0 #f1d1ae;
        }
        .nav-item.ghost {
          color: rgba(255,255,255,0.74);
        }
        .nav-icon {
          width: 20px;
          text-align: center;
          font-size: 1rem;
        }
        .sidebar-footer {
          position: relative;
          padding: 10px 12px 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(0,0,0,0.06);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.08);
          color: #fff6ef;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all var(--transition);
          font-family: 'Source Sans 3', sans-serif;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.14);
        }
        .admin-main {
          margin-left: var(--sidebar-w);
          flex: 1;
          min-height: 100vh;
          position: relative;
          background: linear-gradient(180deg, #f4ede3 0%, #f0e7db 100%);
        }
        .admin-main-hero {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 240px;
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 24%),
            linear-gradient(90deg, #681313 0%, #842020 42%, #932121 72%, #7a1818 100%);
        }
        .admin-main-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0)),
            repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 52px,
              rgba(255,255,255,0.025) 52px,
              rgba(255,255,255,0.025) 53px
            );
        }
        .admin-content {
          position: relative;
          z-index: 1;
          padding: 42px;
        }
        .page-header {
          margin-bottom: 32px;
          padding: 26px 28px 12px;
        }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          color: #fff8f1;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
        }
        .page-header p {
          color: rgba(255,255,255,0.78);
          font-size: 1rem;
          font-weight: 600;
        }
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
          :root { --sidebar-w: 100%; }
          .admin-shell { flex-direction: column; }
          .sidebar {
            position: static;
            width: 100%;
            min-height: auto;
          }
          .admin-main {
            margin-left: 0;
          }
          .admin-content {
            padding: 20px 18px 32px;
          }
          .page-header {
            padding: 18px 0 6px;
          }
          .page-header h1 {
            font-size: 2.35rem;
          }
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