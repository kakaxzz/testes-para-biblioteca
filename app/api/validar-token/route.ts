import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();

  const record = await prisma.accessToken.findUnique({ where: { token } });

  if (!record)
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  if (record.used)
    return NextResponse.json({ error: "Token já utilizado." }, { status: 401 });

  if (record.expiresAt < new Date())
    return NextResponse.json({ error: "Token expirado." }, { status: 401 });

  await prisma.accessToken.update({
    where: { token },
    data: { used: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("tcc_access", "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
    // "/" para que as rotas /api/tcc e /api/verificar-acesso também recebam o cookie
    path: "/",
  });

  return NextResponse.json({ ok: true });
}