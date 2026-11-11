import { prisma } from "@/lib/prisma"

export const MAX_TENTATIVAS = 5
export const BLOQUEIO_SEGUNDOS = 120
// Falhas antigas (sem bloqueio) deixam de contar depois desse tempo.
const ESQUECER_FALHAS_MS = 15 * 60 * 1000

// Identifica quem está tentando entrar (IP). Na Vercel o IP real vem em x-forwarded-for.
export function chaveDoCliente(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "desconhecido"
}

// Segundos que ainda faltam para o bloqueio acabar (0 = liberado).
export async function segundosDeBloqueio(chave: string): Promise<number> {
  const registro = await prisma.loginTentativa.findUnique({ where: { chave } })
  if (!registro?.bloqueadoAte) return 0
  const restante = Math.ceil((registro.bloqueadoAte.getTime() - Date.now()) / 1000)
  return restante > 0 ? restante : 0
}

export type ResultadoFalha = { bloqueado: boolean; segundos: number; restantes: number }

export async function registrarFalha(chave: string): Promise<ResultadoFalha> {
  const agora = new Date()
  const atual = await prisma.loginTentativa.findUnique({ where: { chave } })

  const contagemAntigaValida =
    !!atual && agora.getTime() - atual.atualizadoEm.getTime() < ESQUECER_FALHAS_MS
  const falhas = (contagemAntigaValida ? atual!.falhas : 0) + 1

  if (falhas >= MAX_TENTATIVAS) {
    const bloqueadoAte = new Date(agora.getTime() + BLOQUEIO_SEGUNDOS * 1000)
    await prisma.loginTentativa.upsert({
      where: { chave },
      create: { chave, falhas: 0, bloqueadoAte, atualizadoEm: agora },
      update: { falhas: 0, bloqueadoAte, atualizadoEm: agora },
    })
    return { bloqueado: true, segundos: BLOQUEIO_SEGUNDOS, restantes: 0 }
  }

  await prisma.loginTentativa.upsert({
    where: { chave },
    create: { chave, falhas, bloqueadoAte: null, atualizadoEm: agora },
    update: { falhas, bloqueadoAte: null, atualizadoEm: agora },
  })
  return { bloqueado: false, segundos: 0, restantes: MAX_TENTATIVAS - falhas }
}

export async function limparFalhas(chave: string) {
  await prisma.loginTentativa.deleteMany({ where: { chave } })
}
