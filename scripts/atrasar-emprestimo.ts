import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Uso: npx tsx scripts/atrasar-emprestimo.ts <idDoEmprestimo> [diasAtras=15]
// Para voltar ao normal:  npx tsx scripts/atrasar-emprestimo.ts <id> 0
async function main() {
  const id = Number(process.argv[2])
  const diasAtras = process.argv[3] !== undefined ? Number(process.argv[3]) : 15
  if (!id) throw new Error("Informe o id do empréstimo. Ex.: npx tsx scripts/atrasar-emprestimo.ts 12")

  const data = new Date()
  data.setDate(data.getDate() - diasAtras)

  const e = await prisma.emprestimo.update({ where: { id }, data: { dataEmprestimo: data } })
  console.log(`Empréstimo ${e.id}: dataEmprestimo agora é ${e.dataEmprestimo.toLocaleDateString("pt-BR")}`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
