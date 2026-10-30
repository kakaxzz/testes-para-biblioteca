import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export const TCC_COOKIE = "tcc_access"

// Pode ver os trabalhos quem validou um token de acesso OU está logado como admin
export async function temAcessoAoTcc(): Promise<boolean> {
  const store = await cookies()
  if (store.get(TCC_COOKIE)?.value === "granted") return true

  const sessao = store.get(SESSION_COOKIE)?.value
  if (sessao && (await verifySessionToken(sessao))) return true

  return false
}
