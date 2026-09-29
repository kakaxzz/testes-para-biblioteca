import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_USUARIO;
  const senhaHash = process.env.ADMIN_SENHA_HASH;


  if (!email || !senhaHash) {
    throw new Error("ADMIN_USUARIO ou ADMIN_SENHA_HASH não configurados no .env");
  }

  const existente = await prisma.admin.findUnique({ where: { email } });
  if (existente) {
    console.log("Admin já existe no banco, nada foi feito.");
    return;
  }

  await prisma.admin.create({
    data: { email, senha: senhaHash },
  });


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());