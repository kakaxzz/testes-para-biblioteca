import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "session"
export const SESSION_DURATION_SECONDS = 60 * 60 * 8 // 8 horas

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado no ambiente. Gere um valor aleatório e defina essa variável."
    )
  }
  return new TextEncoder().encode(secret)
}

export async function hashPassword(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12)
}

export async function verifyPassword(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}

export async function createSessionToken(usuario: string): Promise<string> {
  return new SignJWT({ usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { usuario: string }
  } catch {
    return null
  }
}
