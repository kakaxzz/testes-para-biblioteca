import crypto from "crypto"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export const RESET_VALIDADE_MINUTOS = 30
export const RESET_INTERVALO_SEGUNDOS = 120

export function gerarToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Só o hash do token vai para o banco; o token real existe apenas no link do e-mail.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function emailValido(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function mascararEmail(email: string): string {
  const [user, dominio] = email.split("@")
  if (!user || !dominio) return email
  return `${user.slice(0, 1)}${"*".repeat(Math.max(user.length - 1, 3))}@${dominio}`
}

export async function adminDaSessao() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = await verifySessionToken(token)
  if (!payload) return null
  return prisma.admin.findUnique({ where: { email: payload.usuario } })
}
