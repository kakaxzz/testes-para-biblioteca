"use client"

import { useEffect, useRef } from "react"

// Cobre /tcc (lista) e /tcc/[id] (leitor). O acesso liberado por token só vale enquanto a
// pessoa está nesta área: ao sair (fechar a aba, recarregar, ir para outra página do site),
// o cookie é apagado e entrar de novo pede um token novo.
export default function TccLayout({ children }: { children: React.ReactNode }) {
  const saidaPendente = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Em desenvolvimento o React monta, desmonta e monta de novo; isso cancela a saída "falsa"
    if (saidaPendente.current) {
      clearTimeout(saidaPendente.current)
      saidaPendente.current = null
    }

    const encerrar = () => {
      if (navigator.sendBeacon) navigator.sendBeacon("/api/sair-tcc")
      else fetch("/api/sair-tcc", { method: "POST", keepalive: true }).catch(() => {})
    }

    // Fechar a aba ou recarregar
    window.addEventListener("pagehide", encerrar)

    // Voltar com o botão do navegador pode restaurar a página antiga da memória, já sem acesso:
    // recarrega para cair na tela do token em vez de mostrar uma página quebrada
    const aoVoltar = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener("pageshow", aoVoltar)

    return () => {
      window.removeEventListener("pagehide", encerrar)
      window.removeEventListener("pageshow", aoVoltar)
      // Saiu da área de TCCs navegando pelo site (ex.: botão "Voltar")
      saidaPendente.current = setTimeout(encerrar, 100)
    }
  }, [])

  return <>{children}</>
}
