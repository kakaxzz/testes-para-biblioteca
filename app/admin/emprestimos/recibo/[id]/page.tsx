"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

// Largura do rolo térmico. Troque para "58mm" se a impressora usar bobina menor.
const LARGURA_PAPEL = "80mm"

const LABEL_TIPO: Record<string, string> = {
  ALUNO: "Aluno",
  FUNCIONARIO: "Funcionário",
  RESPONSAVEL: "Responsável",
}

export default function ReciboEmprestimo() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const autoPrint = searchParams.get("auto") === "1"

  const [emprestimo, setEmprestimo] = useState<any>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    async function carregar() {
      const res = await fetch(`/api/emprestimos/${id}`)
      if (res.ok) {
        setEmprestimo(await res.json())
      } else {
        setErro("Não foi possível carregar os dados do empréstimo.")
      }
    }
    carregar()
  }, [id])

  // Dispara a impressão automaticamente quando vem do fluxo de confirmação
  useEffect(() => {
    if (emprestimo && autoPrint) {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [emprestimo, autoPrint])

  if (erro) {
    return <div className="surface-note error">{erro}</div>
  }

  if (!emprestimo) {
    return <div style={{ padding: 40, textAlign: "center", color: "#9c8d8d" }}>Carregando recibo...</div>
  }

  const usuario = emprestimo.usuario
  const documento = usuario?.matricula
    ? { label: "Matrícula", valor: usuario.matricula }
    : { label: "CPF", valor: usuario?.cpf }

  const dataEmprestimo = new Date(emprestimo.dataEmprestimo)
  const prazoDevolucao = new Date(dataEmprestimo)
  prazoDevolucao.setDate(prazoDevolucao.getDate() + 10)

  return (
    <div className="recibo-page">
      {/* Ações — somem na impressão */}
      <div className="acoes-tela no-print">
        <button className="btn-primary" onClick={() => window.print()}>
          🖨️ Imprimir recibo
        </button>
      </div>

      <div className="cupom">
        <div className="cupom-header">
          <div className="cupom-titulo">Biblioteca Escolar Emerson Teixeira</div>
          <div className="cupom-subtitulo">Comprovante de Empréstimo</div>
        </div>

        <div className="linha-tracejada" />

        <div className="cupom-linha">
          <span>Contrato Nº</span>
          <span>{String(emprestimo.id).padStart(6, "0")}</span>
        </div>
        <div className="cupom-linha">
          <span>Data</span>
          <span>{dataEmprestimo.toLocaleDateString("pt-BR")} {dataEmprestimo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        <div className="linha-tracejada" />

        <div className="cupom-secao-titulo">{LABEL_TIPO[usuario?.tipo] || "Usuário"}</div>
        <div className="cupom-linha">
          <span>Nome</span>
          <span>{usuario?.nome}</span>
        </div>
        <div className="cupom-linha">
          <span>{documento.label}</span>
          <span>{documento.valor}</span>
        </div>

        <div className="linha-tracejada" />

        <div className="cupom-secao-titulo">Livro</div>
        <div className="cupom-item-titulo">{emprestimo.livro?.titulo}</div>
        <div className="cupom-linha">
          <span>Autor</span>
          <span>{emprestimo.livro?.autor}</span>
        </div>
        <div className="cupom-linha">
          <span>Tombo</span>
          <span>#{String(emprestimo.tomboExemplar).padStart(7, "0")}</span>
        </div>

        <div className="linha-tracejada" />

        <div className="cupom-linha destaque">
          <span>Devolver até</span>
          <span>{prazoDevolucao.toLocaleDateString("pt-BR")}</span>
        </div>

        <div className="linha-tracejada" />

        <div className="cupom-rodape">
          Conserve este comprovante.<br />
          Prazo de empréstimo: 10 dias.
        </div>
      </div>

      <style>{`
        .no-print { }
        .recibo-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }
        .acoes-tela {
          display: flex;
          gap: 10px;
        }
        .cupom {
          width: ${LARGURA_PAPEL};
          max-width: 100%;
          background: white;
          padding: 14px 12px;
          font-family: 'Courier New', Courier, monospace;
          color: #111;
          font-size: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border: 1px solid #ddd;
        }
        .cupom-header {
          text-align: center;
          margin-bottom: 6px;
        }
        .cupom-titulo {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1.3;
        }
        .cupom-subtitulo {
          font-size: 11px;
          margin-top: 2px;
        }
        .linha-tracejada {
          border-top: 1px dashed #888;
          margin: 8px 0;
        }
        .cupom-linha {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin: 2px 0;
        }
        .cupom-linha.destaque {
          font-weight: 800;
          font-size: 13px;
        }
        .cupom-secao-titulo {
          font-weight: 800;
          text-transform: uppercase;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .cupom-item-titulo {
          font-weight: 700;
          margin-bottom: 2px;
        }
        .cupom-rodape {
          text-align: center;
          font-size: 10.5px;
          margin-top: 4px;
        }

        @media print {
          /* Esconde a navegação do painel admin ao imprimir */
          .sidebar, .admin-main-hero, .no-print { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-content { padding: 0 !important; }
          body, .admin-shell { background: white !important; }

          .recibo-page { padding: 0; gap: 0; }
          .cupom {
            box-shadow: none;
            border: none;
            width: ${LARGURA_PAPEL};
            padding: 0;
          }

          @page {
            size: ${LARGURA_PAPEL} auto;
            margin: 2mm;
          }
        }
      `}</style>
    </div>
  )
}
