import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export const TCC_COOKIE = "tcc_access"

// Só quem digitou um token válido (cookie de acesso). Usado pela página pública /tcc,
// para que ela sempre peça o token, mesmo com o admin logado no mesmo navegador.
export async function temTokenDeAcesso(): Promise<boolean> {
  const store = await cookies()
  return store.get(TCC_COOKIE)?.value === "granted"
}

// Pode ver os trabalhos quem validou um token de acesso OU está logado como admin
// (o admin precisa disso para listar/abrir os PDFs no painel)
export async function temAcessoAoTcc(): Promise<boolean> {
  const store = await cookies()
  if (store.get(TCC_COOKIE)?.value === "granted") return true

  const sessao = store.get(SESSION_COOKIE)?.value
  if (sessao && (await verifySessionToken(sessao))) return true

  return false
}
