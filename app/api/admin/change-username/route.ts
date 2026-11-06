import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  verifySessionToken,
  verifyPassword,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
    }

    const { currentPassword, newUsername } = await request.json();

    if (typeof currentPassword !== "string" || typeof newUsername !== "string") {
      return NextResponse.json(
        { error: "Preencha o novo usuário e a senha atual" },
        { status: 400 }
      );
    }

    const novoUsuario = newUsername.trim();

    if (novoUsuario.length < 3) {
      return NextResponse.json(
        { error: "O novo usuário precisa ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (/\s/.test(novoUsuario)) {
      return NextResponse.json(
        { error: "O usuário não pode ter espaços" },
        { status: 400 }
      );
    }

    if (novoUsuario === payload.usuario) {
      return NextResponse.json(
        { error: "O novo usuário precisa ser diferente do atual" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email: payload.usuario },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 });
    }

    const senhaValida = await verifyPassword(currentPassword, admin.senha);
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
    }

    const jaExiste = await prisma.admin.findUnique({
      where: { email: novoUsuario },
    });
    if (jaExiste) {
      return NextResponse.json({ error: "Esse usuário já está em uso" }, { status: 409 });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { email: novoUsuario },
    });

    // O JWT guarda o usuário antigo; emite um novo para a sessão continuar válida.
    const novoToken = await createSessionToken(novoUsuario);
    const response = NextResponse.json({
      success: true,
      message: "Usuário alterado com sucesso",
      usuario: novoUsuario,
    });
    response.cookies.set(SESSION_COOKIE, novoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Erro ao trocar usuário:", error);
    return NextResponse.json({ error: "Erro interno ao trocar o usuário" }, { status: 500 });
  }
}
