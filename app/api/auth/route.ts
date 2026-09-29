import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  const { usuario, senha } = await request.json();

 

  if (typeof usuario !== "string" || typeof senha !== "string") {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({ where: { email: usuario } });

  
  if (!admin) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const senhaValida = await verifyPassword(senha, admin.senha);
  

  if (!senhaValida) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const token = await createSessionToken(admin.email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}