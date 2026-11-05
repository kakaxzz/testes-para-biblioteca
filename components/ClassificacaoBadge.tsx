import { CLASSIFICACAO_INFO, normalizarClassificacao } from "@/lib/classificacao"

export function ClassificacaoBadge({ valor, className = "" }: { valor: unknown; className?: string }) {
  const c = normalizarClassificacao(valor)
  if (!c) return null
  const { rotulo, descricao, cor, fundo } = CLASSIFICACAO_INFO[c]
  return (
    <span title={descricao} style={{ color: cor, background: fundo }} className={`rounded-md px-1.5 py-px text-[11px] font-extrabold ${className}`}>
      {rotulo}
    </span>
  )
}
