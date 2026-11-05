import type { CSSProperties, ReactNode } from "react"

export type NomeIcone =
  | "home" | "livros" | "emprestimos" | "usuarios" | "tcc" | "stats" | "news" | "config" | "sair"
  | "livro" | "olho" | "etiqueta" | "editar" | "lixeira" | "salvar" | "lista" | "impressora"
  | "busca" | "enviar" | "menu" | "cadeado"
  | "check" | "checkCirculo" | "xCirculo" | "x" | "alerta" | "info" | "proibido" | "estrela"
  | "setaEsquerda" | "setaDireita" | "setaCima" | "setaBaixo" | "chevronCima" | "chevronBaixo"

const ICONES: Record<NomeIcone, ReactNode> = {
  home: (
    <>
      <path d="M4 11l8-6.5L20 11" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  livros: (
    <>
      <path d="M5 4h3.5v16H5zM10.5 4H14v16h-3.5z" />
      <path d="M15.8 5.4l3.3-.9 3 14.6-3.3.9z" />
    </>
  ),
  emprestimos: (
    <>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </>
  ),
  usuarios: (
    <>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
      <path d="M6.5 11.8V16c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.2" />
      <path d="M21.5 9.5V15" />
    </>
  ),
  tcc: (
    <>
      <path d="M7 3.5h7l4 4V20.5H7z" />
      <path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" />
    </>
  ),
  stats: <path d="M5 20V11M12 20V4M19 20v-6" />,
  news: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  ),
  config: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  sair: (
    <>
      <path d="M10 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H10" />
      <path d="M15 8l4 4-4 4M19 12H9" />
    </>
  ),

  livro: (
    <>
      <path d="M6.5 4H18v13H6.5A1.5 1.5 0 005 18.5v-13A1.5 1.5 0 016.5 4z" />
      <path d="M5 18.5A1.5 1.5 0 006.5 20H18v-3M9.5 8h5" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 17.9 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  etiqueta: (
    <>
      <path d="M3.5 12.2V4.5a1 1 0 011-1h7.7a1 1 0 01.7.3l7.6 7.6a1 1 0 010 1.4l-7.7 7.7a1 1 0 01-1.4 0L3.8 12.9a1 1 0 01-.3-.7z" />
      <circle cx="8.2" cy="8.2" r="1.2" />
    </>
  ),
  editar: (
    <>
      <path d="M4 20l1-4.2L16.3 4.5a2.1 2.1 0 013 3L8.2 19z" />
      <path d="M14.5 6.3l3.2 3.2" />
    </>
  ),
  lixeira: (
    <>
      <path d="M4 7h16M10 3.5h4" />
      <path d="M6.5 7l.8 12a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-12" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  salvar: (
    <>
      <path d="M5 4h11l3 3v12a1 1 0 01-1 1H6a1 1 0 01-1-1z" />
      <path d="M8 4v5h7V4M8 20v-6h8v6" />
    </>
  ),
  lista: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  impressora: (
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M7 14h10v6.5H7z" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  enviar: (
    <>
      <path d="M20.5 3.5L3.5 10.2l6.8 3.2 3.2 6.9z" />
      <path d="M20.5 3.5l-10.2 9.9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  cadeado: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
    </>
  ),

  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCirculo: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </>
  ),
  xCirculo: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  alerta: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11v5M12 7.5h.01" />
    </>
  ),
  proibido: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.7 5.7l12.6 12.6" />
    </>
  ),
  estrela: <path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />,

  setaEsquerda: <path d="M19 12H5M11 6l-6 6 6 6" />,
  setaDireita: <path d="M5 12h14M13 6l6 6-6 6" />,
  setaCima: <path d="M12 19V5M6 11l6-6 6 6" />,
  setaBaixo: <path d="M12 5v14M6 13l6 6 6-6" />,
  chevronCima: <path d="M6 15l6-6 6 6" />,
  chevronBaixo: <path d="M6 9l6 6 6-6" />,
}

type Props = {
  nome: NomeIcone
  tamanho?: number | string
  className?: string
  style?: CSSProperties
}

export function Icone({ nome, tamanho = 22, className, style }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", verticalAlign: "-0.2em", flexShrink: 0, ...style }}
    >
      {ICONES[nome]}
    </svg>
  )
}
