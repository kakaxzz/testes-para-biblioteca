"use client"

import { useState } from "react"
import { Icone } from "@/components/Icone"

type Props = {
  generos: string[]
  selectedGeneros: string[]
  onChangeGeneros: (generos: string[]) => void
  soDisponiveis: boolean
  onChangeSoDisponiveis: (valor: boolean) => void
  /** true quando há busca, assunto ou "disponíveis" ativos (mostra o botão Limpar filtros) */
  temFiltroAtivo: boolean
  onLimpar: () => void
}

// Os filtros do catálogo ficam aqui para a página inicial e o catálogo completo
// serem sempre apresentados exatamente do mesmo jeito.
export function FiltrosCatalogo({
  generos,
  selectedGeneros,
  onChangeGeneros,
  soDisponiveis,
  onChangeSoDisponiveis,
  temFiltroAtivo,
  onLimpar,
}: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="filters-panel">
      <style>{`
        .filters-panel { margin-bottom: 26px; }
        .filters-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filters-dropdown-wrap { position: relative; }
        .filters-toggle { display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(139, 30, 30, 0.18); background: white; color: #6a2a2a; border-radius: 999px; padding: 10px 18px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; }
        .filters-toggle:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(101, 33, 33, 0.09); }
        .filters-toggle.filters-toggle--on { background: #8b1e1e; color: #fff; border-color: #8b1e1e; }
        .filters-backdrop { position: fixed; inset: 0; z-index: 59; }
        .filters-dropdown { position: absolute; top: calc(100% + 10px); left: 0; z-index: 60; background: #fffdfa; border: 1px solid rgba(139, 30, 30, 0.14); border-radius: 16px; padding: 10px; min-width: 240px; max-width: 300px; max-height: 320px; overflow-y: auto; box-shadow: 0 18px 40px rgba(60,14,14,0.14); animation: filtrosPop 0.18s ease-out both; }
        @keyframes filtrosPop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .filters-dropdown-title { font-family: 'Source Sans 3', sans-serif; font-size: 0.78rem; font-weight: 800; color: #a1888b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; padding: 4px 10px 0; }
        .filters-options { display: flex; flex-direction: column; gap: 1px; }
        .filters-option { text-align: left; border: none; background: transparent; cursor: pointer; padding: 9px 10px; border-radius: 10px; font-family: 'Source Sans 3', sans-serif; font-size: 0.92rem; color: #3b1616; transition: background 0.15s ease; }
        .filters-option:hover { background: rgba(139, 30, 30, 0.06); }
        .filters-option.active { background: rgba(139, 30, 30, 0.12); font-weight: 700; color: #6a2a2a; }
        .selected-filters { display: flex; flex-wrap: wrap; gap: 8px; }
        .filter-chip { display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer; background: #f4e6df; color: #6a2a2a; border-radius: 999px; padding: 8px 12px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; font-size: 0.88rem; transition: transform 0.18s ease, background 0.18s ease; }
        .filter-chip:hover { transform: translateY(-1px); background: #e9d2c8; }
        .filter-clear { border: none; cursor: pointer; color: #8b1e1e; background: rgba(255, 230, 226, 0.95); padding: 10px 16px; border-radius: 999px; font-family: 'Source Sans 3', sans-serif; font-weight: 700; transition: transform 0.18s ease, background 0.18s ease; }
        .filter-clear:hover { transform: translateY(-1px); background: rgba(255, 215, 208, 0.96); }
        .filters-empty { font-family: 'Source Sans 3', sans-serif; color: #8c7474; font-size: 0.94rem; padding: 10px; }

        @media (max-width: 640px) {
          .filters-toggle, .filter-clear { padding: 7px 12px; font-size: 0.8rem; }
          .filter-chip { padding: 5px 10px; font-size: 0.76rem; }
        }
      `}</style>

      <div className="filters-row">
        <div className="filters-dropdown-wrap">
          <button type="button" className="filters-toggle" onClick={() => setAberto((prev) => !prev)}>
            {aberto ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          {aberto && (
            <>
              <div className="filters-backdrop" onClick={() => setAberto(false)} />
              <div className="filters-dropdown">
                <div className="filters-dropdown-title">Filtrar por assunto</div>
                {generos.length > 0 ? (
                  <div className="filters-options">
                    <button
                      type="button"
                      className={`filters-option${selectedGeneros.length === 0 ? " active" : ""}`}
                      onClick={() => { onChangeGeneros([]); setAberto(false) }}
                    >
                      Todos os assuntos
                    </button>
                    {generos.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`filters-option${selectedGeneros[0] === g ? " active" : ""}`}
                        onClick={() => { onChangeGeneros([g]); setAberto(false) }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="filters-empty">Nenhum assunto encontrado.</div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className={`filters-toggle${soDisponiveis ? " filters-toggle--on" : ""}`}
          aria-pressed={soDisponiveis}
          onClick={() => onChangeSoDisponiveis(!soDisponiveis)}
        >
          {soDisponiveis && <Icone nome="check" tamanho="1.05em" />}
          Livros disponíveis
        </button>

        {selectedGeneros.length > 0 && (
          <div className="selected-filters">
            {selectedGeneros.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChangeGeneros(selectedGeneros.filter((item) => item !== g))}
                className="filter-chip"
                aria-label={`Remover filtro ${g}`}
              >
                {g}
                <Icone nome="x" tamanho="0.95em" />
              </button>
            ))}
          </div>
        )}

        {temFiltroAtivo && (
          <button type="button" onClick={onLimpar} className="filter-clear">Limpar filtros</button>
        )}
      </div>
    </div>
  )
}
