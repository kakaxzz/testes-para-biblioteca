// Regras de senha forte. Sem imports de servidor: usado na tela (checklist) e nas APIs.

export const SENHA_MIN = 8
export const SENHA_MAX = 72 // limite do bcrypt

export type RegraSenha = { id: string; rotulo: string; ok: (senha: string) => boolean }

export const REGRAS_SENHA: RegraSenha[] = [
  { id: "tamanho", rotulo: `Pelo menos ${SENHA_MIN} caracteres`, ok: (s) => s.length >= SENHA_MIN },
  { id: "maiuscula", rotulo: "Uma letra maiúscula (A-Z)", ok: (s) => /[A-ZÀ-ÖØ-Þ]/.test(s) },
  { id: "minuscula", rotulo: "Uma letra minúscula (a-z)", ok: (s) => /[a-zß-öø-ÿ]/.test(s) },
  { id: "numero", rotulo: "Um número (0-9)", ok: (s) => /[0-9]/.test(s) },
  { id: "simbolo", rotulo: "Um símbolo (ex.: ! @ # $ % & *)", ok: (s) => /[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s]/.test(s) },
  { id: "semEspaco", rotulo: "Sem espaços", ok: (s) => !/\s/.test(s) },
]

export function avaliarSenha(senha: string) {
  const resultados = REGRAS_SENHA.map((r) => ({ ...r, atendida: r.ok(senha) }))
  const atendidas = resultados.filter((r) => r.atendida).length
  return {
    resultados,
    atendidas,
    total: REGRAS_SENHA.length,
    forte: atendidas === REGRAS_SENHA.length && senha.length <= SENHA_MAX,
  }
}

// Mensagem de erro para as APIs (null = senha ok).
export function erroSenhaFraca(senha: unknown): string | null {
  if (typeof senha !== "string") return "Senha inválida."
  if (senha.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`
  const faltando = REGRAS_SENHA.filter((r) => !r.ok(senha)).map((r) => r.rotulo.charAt(0).toLowerCase() + r.rotulo.slice(1))
  if (faltando.length === 0) return null
  return `Senha fraca. Falta: ${faltando.join("; ")}.`
}
