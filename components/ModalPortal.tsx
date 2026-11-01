"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

// Desenha o modal direto no <body>. Dentro de um cartão com blur/animação, o "position: fixed"
// passa a se referir ao cartão (e não à tela), e o modal aparecia no meio da página.
export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [montado, setMontado] = useState(false)
  useEffect(() => { setMontado(true) }, [])
  if (!montado) return null
  return createPortal(children, document.body)
}
