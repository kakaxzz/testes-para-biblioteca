import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export const TCC_COOKIE = "tcc_access"

export const TCC_ACESSO_SEGUNDOS = 15 * 60

function chaveDoAcesso() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado no ambiente. Gere um valor aleatório e defina essa variável."
    )
  }
  return new TextEncoder().encode(`${secret}|tcc-acesso`)
}

export async function criarCookieDeAcessoTcc(tokenId: string): Promise<string> {
  return new SignJWT({ acesso: "tcc" })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(tokenId)
    .setIssuedAt()
    .setExpirationTime(`${TCC_ACESSO_SEGUNDOS}s`)
    .sign(chaveDoAcesso())
}

export async function temTokenDeAcesso(): Promise<boolean> {
  const store = await cookies()
  const valor = store.get(TCC_COOKIE)?.value
  if (!valor) return false
  try {
    const { payload } = await jwtVerify(valor, chaveDoAcesso())
    return payload.acesso === "tcc"
  } catch {
    return false
  }
}

export async function ehAdmin(): Promise<boolean> {
  const store = await cookies()
  const sessao = store.get(SESSION_COOKIE)?.value
  return !!sessao && !!(await verifySessionToken(sessao))
}

export async function temAcessoAoTcc(): Promise<boolean> {
  return (await temTokenDeAcesso()) || (await ehAdmin())
}
