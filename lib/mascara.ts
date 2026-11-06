import { formatarCpf, somenteDigitos } from "@/lib/cpf"

// CPF: mostra só os 6 dígitos do meio -> ***.456.789-**
export function mascararCpf(valor: unknown): string {
  const d = somenteDigitos(valor)
  if (d.length !== 11) return typeof valor === "string" && valor ? "•".repeat(Math.min(valor.length, 11)) : "-"
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

// WhatsApp: mostra DDD e os 4 últimos dígitos -> (21) *****-1234
export function mascararWhatsapp(valor: unknown): string {
  const d = somenteDigitos(valor)
  if (!d) return "-"
  if (d.length < 6) return "•".repeat(d.length)
  const semPais = d.length > 11 && d.startsWith("55") ? d.slice(2) : d
  const ddd = semPais.slice(0, 2)
  const fim = semPais.slice(-4)
  const ocultos = Math.max(semPais.length - 6, 1)
  return `(${ddd}) ${"*".repeat(ocultos)}-${fim}`
}

export { formatarCpf }
