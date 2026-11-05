"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist"
import { CABECALHO_LEITOR } from "@/lib/tcc"

type Trabalho = {
  titulo: string
  autor: string
  ano: number
  tipo: string
}

const PROPORCAO_A4 = 297 / 210

function Pagina({ doc, numero, proporcaoInicial }: { doc: PDFDocumentProxy; numero: number; proporcaoInicial: number }) {
  const caixa = useRef<HTMLDivElement>(null)
  const tela = useRef<HTMLCanvasElement>(null)
  const [proporcao, setProporcao] = useState(proporcaoInicial)

  useEffect(() => {
    const caixaEl = caixa.current
    const telaEl = tela.current
    if (!caixaEl || !telaEl) return

    let tarefa: RenderTask | null = null
    let desenhando = false
    let desenhada = false
    let noVisor = false
    let encerrado = false

    async function desenhar() {
      if (desenhada || desenhando || !telaEl || !caixaEl) return
      desenhando = true
      try {
        const pagina = await doc.getPage(numero)
        if (encerrado || !noVisor) return

        const base = pagina.getViewport({ scale: 1 })
        setProporcao(base.height / base.width)

        const pixels = Math.min(window.devicePixelRatio || 1, 2)
        const larguraAlvo = Math.min(caixaEl.clientWidth || 800, 1100) * pixels
        const viewport = pagina.getViewport({ scale: larguraAlvo / base.width })

        telaEl.width = Math.floor(viewport.width)
        telaEl.height = Math.floor(viewport.height)

        tarefa = pagina.render({ canvasContext: telaEl.getContext("2d")!, viewport })
        await tarefa.promise
        desenhada = true
      } catch {
      } finally {
        desenhando = false
        tarefa = null
        if (!noVisor && !encerrado) soltar()
      }
    }

    function soltar() {
      tarefa?.cancel()
      desenhada = false
      if (telaEl) {
        telaEl.width = 0
        telaEl.height = 0
      }
    }

    const observador =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entrada]) => {
              noVisor = entrada.isIntersecting
              if (noVisor) desenhar()
              else soltar()
            },
            { rootMargin: "1200px 0px" }
          )

    if (observador) observador.observe(caixaEl)
    else {
      noVisor = true
      desenhar()
    }

    return () => {
      encerrado = true
      observador?.disconnect()
      tarefa?.cancel()
    }
  }, [doc, numero])

  return (
    <div ref={caixa} className="leitor-pagina" style={{ aspectRatio: `1 / ${proporcao}` }}>
      <canvas ref={tela} />
    </div>
  )
}

export default function LeitorTcc() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [proporcaoInicial, setProporcaoInicial] = useState(PROPORCAO_A4)
  const [erro, setErro] = useState("")

  useEffect(() => {
    let cancelado = false
    let aberto: PDFDocumentProxy | null = null

    async function abrir() {
      try {
        const meta = await fetch(`/api/tcc/${id}`)
        if (meta.status === 401) return router.replace("/tcc")
        if (!meta.ok) return setErro("Trabalho não encontrado.")
        const dados: Trabalho = await meta.json()
        if (cancelado) return
        setTrabalho(dados)

        const resposta = await fetch(`/api/tcc/${id}/arquivo`, { headers: { [CABECALHO_LEITOR]: "1" } })
        if (resposta.status === 401) return router.replace("/tcc")
        if (!resposta.ok) return setErro("Não foi possível abrir este trabalho.")
        const bytes = new Uint8Array(await resposta.arrayBuffer())
        if (cancelado) return

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString()

        aberto = await pdfjs.getDocument({ data: bytes }).promise
        if (cancelado) {
          aberto.destroy()
          return
        }

        const primeira = await aberto.getPage(1)
        const v = primeira.getViewport({ scale: 1 })
        setProporcaoInicial(v.height / v.width)
        setDoc(aberto)
      } catch {
        if (!cancelado) setErro("Não foi possível abrir este trabalho.")
      }
    }

    abrir()
    return () => {
      cancelado = true
      aberto?.destroy()
    }
  }, [id, router])

  useEffect(() => {
    const bloquearAtalhos = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault()
    }
    const bloquearMenu = (e: Event) => e.preventDefault()
    window.addEventListener("keydown", bloquearAtalhos)
    window.addEventListener("contextmenu", bloquearMenu)
    return () => {
      window.removeEventListener("keydown", bloquearAtalhos)
      window.removeEventListener("contextmenu", bloquearMenu)
    }
  }, [])

  return (
    <div className="leitor">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4ede3; }
        .leitor { min-height: 100vh; background: #f4ede3; color: #241616; font-family: 'Source Sans 3', sans-serif; }
        .leitor-topo {
          position: sticky; top: 0; z-index: 10; background: rgba(120, 26, 26, 0.96); backdrop-filter: blur(12px);
          padding: 12px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 26px rgba(36, 10, 10, 0.12);
        }
        .leitor-voltar {
          flex-shrink: 0; text-decoration: none; color: #fff3eb; font-size: 0.95rem; font-weight: 700;
          padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.12);
        }
        .leitor-voltar:hover { background: rgba(255,255,255,0.2); }
        .leitor-info { min-width: 0; color: #fff7f0; }
        .leitor-titulo { font-family: 'Lora', serif; font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .leitor-autor { font-size: 0.85rem; color: rgba(255,255,255,0.78); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .leitor-aviso { text-align: center; font-size: 0.85rem; font-weight: 600; color: #8a7474; padding: 14px 18px 0; }
        .leitor-paginas { max-width: 900px; margin: 0 auto; padding: 18px 16px 64px; display: flex; flex-direction: column; gap: 14px; }
        .leitor-pagina {
          width: 100%; background: #fff; border-radius: 4px; overflow: hidden;
          box-shadow: 0 6px 22px rgba(55, 18, 18, 0.14);
          -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
        }
        .leitor-pagina canvas { display: block; width: 100%; height: 100%; pointer-events: none; }
        .leitor-msg { text-align: center; padding: 90px 20px; font-weight: 700; color: #8f7e7e; }
        .leitor-msg.erro { color: #a32424; }
        .leitor-impressao { display: none; }
        @media print {
          .leitor > *:not(.leitor-impressao) { display: none !important; }
          .leitor-impressao { display: block; padding: 40px; text-align: center; font-family: sans-serif; }
        }
        @media (max-width: 600px) {
          .leitor-topo { padding: 10px 14px; gap: 10px; }
          .leitor-paginas { padding: 12px 8px 48px; }
        }
      `}</style>

      <header className="leitor-topo">
        <Link href="/tcc" className="leitor-voltar">← Voltar</Link>
        {trabalho && (
          <div className="leitor-info">
            <div className="leitor-titulo">{trabalho.titulo}</div>
            <div className="leitor-autor">{trabalho.autor} • {trabalho.ano}</div>
          </div>
        )}
      </header>

      {erro ? (
        <div className="leitor-msg erro">{erro}</div>
      ) : !doc ? (
        <div className="leitor-msg">Carregando trabalho...</div>
      ) : (
        <>
          <p className="leitor-aviso">Leitura somente online. O download deste trabalho não está disponível.</p>
          <div className="leitor-paginas">
            {Array.from({ length: doc.numPages }, (_, i) => (
              <Pagina key={i + 1} doc={doc} numero={i + 1} proporcaoInicial={proporcaoInicial} />
            ))}
          </div>
        </>
      )}

      <div className="leitor-impressao">A impressão deste trabalho não está disponível.</div>
    </div>
  )
}
