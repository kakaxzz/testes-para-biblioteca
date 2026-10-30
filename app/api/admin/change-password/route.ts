import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma"; // ajusta se o path do teu client for outro
import {
  SESSION_COOKIE,
  verifySessionToken,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Confirma que tem admin logado, lendo o cookie de sessão
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // 2. Validações básicas
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Preencha a senha atual e a nova senha" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "A nova senha precisa ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "A nova senha precisa ser diferente da atual" },
        { status: 400 }
      );
    }

   const admin = await prisma.admin.findUnique({
  where: { email: payload.usuario },
});

    if (!admin) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 });
    }

    // 4. Confere a senha atual
    const senhaValida = await verifyPassword(currentPassword, admin.senha);
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
    }

    // 5. Faz o hash da nova senha e salva
    const novoHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { senha: novoHash },
    });

    return NextResponse.json({ success: true, message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return NextResponse.json({ error: "Erro interno ao trocar a senha" }, { status: 500 });
  }
}