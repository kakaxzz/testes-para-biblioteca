export function somenteDigitos(valor: unknown): string {
  return typeof valor === "string" ? valor.replace(/\D/g, "") : ""
}

export function formatarCpf(valor: unknown): string {
  const d = somenteDigitos(valor).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function digitoVerificador(base: string): number {
  let soma = 0
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (base.length + 1 - i)
  }
  const resto = (soma * 10) % 11
  return resto === 10 ? 0 : resto
}

export function cpfValido(valor: unknown): boolean {
  const d = somenteDigitos(valor)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  return (
    digitoVerificador(d.slice(0, 9)) === Number(d[9]) &&
    digitoVerificador(d.slice(0, 10)) === Number(d[10])
  )
}

export function erroDoCpf(valor: unknown, forcar = false): string | null {
  const d = somenteDigitos(valor)
  if (cpfValido(d)) return null
  if (d.length === 0 && forcar) return "Informe o CPF."
  if (d.length >= 11 || forcar) return "CPF inválido. Confira os números."
  return null
}

export function variantesDoCpf(valor: unknown): string[] {
  const bruto = typeof valor === "string" ? valor.trim() : ""
  const digitos = somenteDigitos(bruto)
  const lista = [bruto]
  if (digitos.length === 11) lista.push(digitos, formatarCpf(digitos))
  return [...new Set(lista.filter(Boolean))]
}
