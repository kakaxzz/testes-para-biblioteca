
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const senha = process.argv[2]

if (!senha) {
  console.error("Uso: node scripts/gerar-credenciais-admin.js \"sua-senha-aqui\"")
  process.exit(1)
}

const hash = bcrypt.hashSync(senha, 12)
const sessionSecret = crypto.randomBytes(32).toString("hex")

console.log("\n=== Variáveis para configurar na Vercel ===\n")
console.log("ADMIN_SENHA_HASH=" + hash)
console.log("SESSION_SECRET=" + sessionSecret)
console.log("\nMantenha ADMIN_USUARIO como já está.")
console.log("Depois de configurar, REMOVA a variável antiga ADMIN_SENHA (texto puro).\n")   