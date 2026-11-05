"use client"

import { useEffect, useRef } from "react"

export default function TccLayout({ children }: { children: React.ReactNode }) {
  const saidaPendente = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saidaPendente.current) {
      clearTimeout(saidaPendente.current)
      saidaPendente.current = null
    }

    const encerrar = () => {
      if (navigator.sendBeacon) navigator.sendBeacon("/api/sair-tcc")
      else fetch("/api/sair-tcc", { method: "POST", keepalive: true }).catch(() => {})
    }

    window.addEventListener("pagehide", encerrar)

    const aoVoltar = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener("pageshow", aoVoltar)

    return () => {
      window.removeEventListener("pagehide", encerrar)
      window.removeEventListener("pageshow", aoVoltar)
      saidaPendente.current = setTimeout(encerrar, 100)
    }
  }, [])

  return <>{children}</>
}
