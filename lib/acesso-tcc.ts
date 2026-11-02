import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export const TCC_COOKIE = "tcc_access"

// Quanto tempo, no máximo, um token digitado libera os trabalhos. Além disso, o acesso
// é encerrado assim que a pessoa sai da área de TCCs (ver app/tcc/layout.tsx).
export const TCC_ACESSO_SEGUNDOS = 15 * 60

// O cookie de acesso é assinado (antes era o texto fixo "granted", que qualquer um
// podia criar no navegador e entrar sem token). A chave é derivada do SESSION_SECRET
// com um sufixo próprio: assim, um cookie de TCC nunca vale como sessão de admin.
function chaveDoAcesso() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado no ambiente. Gere um valor aleatório e defina essa variável."
    )
  }
  return new TextEncoder().encode(`${secret}|tcc-acesso`)
}

// Valor do cookie entregue depois que um token válido é digitado
export async function criarCookieDeAcessoTcc(tokenId: string): Promise<string> {
  return new SignJWT({ acesso: "tcc" })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(tokenId)
    .setIssuedAt()
    .setExpirationTime(`${TCC_ACESSO_SEGUNDOS}s`)
    .sign(chaveDoAcesso())
}

// Só quem digitou um token válido (cookie de acesso). Usado pela página pública /tcc,
// para que ela sempre peça o token, mesmo com o admin logado no mesmo navegador.
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

// Logado como admin (o painel precisa listar, editar e abrir os PDFs)
export async function ehAdmin(): Promise<boolean> {
  const store = await cookies()
  const sessao = store.get(SESSION_COOKIE)?.value
  return !!sessao && !!(await verifySessionToken(sessao))
}

// Pode ver os trabalhos quem validou um token de acesso OU está logado como admin
export async function temAcessoAoTcc(): Promise<boolean> {
  return (await temTokenDeAcesso()) || (await ehAdmin())
}
