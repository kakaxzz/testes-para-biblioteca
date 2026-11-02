import { CLASSIFICACAO_INFO, normalizarClassificacao } from "@/lib/classificacao"

// Selo colorido da classificação indicativa (L, 10, 12...). Não mostra nada se o livro não tem.
export function ClassificacaoBadge({ valor, className = "" }: { valor: unknown; className?: string }) {
  const c = normalizarClassificacao(valor)
  if (!c) return null
  const { rotulo, descricao, cor, fundo } = CLASSIFICACAO_INFO[c]
  return (
    // cor e fundo mudam por classificação, por isso ficam em style
    <span title={descricao} style={{ color: cor, background: fundo }} className={`rounded-md px-1.5 py-px text-[11px] font-extrabold ${className}`}>
      {rotulo}
    </span>
  )
}
