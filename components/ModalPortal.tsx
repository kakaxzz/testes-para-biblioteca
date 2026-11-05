"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [montado, setMontado] = useState(false)
  useEffect(() => { setMontado(true) }, [])
  if (!montado) return null
  return createPortal(children, document.body)
}
