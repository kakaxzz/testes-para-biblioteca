import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { TCC_COOKIE, criarCookieDeAcessoTcc } from "@/lib/acesso-tcc";

export async function POST(req: Request) {
  const corpo = await req.json().catch(() => null);
  const token = corpo?.token;

  if (typeof token !== "string" || !/^\d{6}$/.test(token))
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  const record = await prisma.accessToken.findUnique({ where: { token } });

  if (!record)
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  if (record.used)
    return NextResponse.json({ error: "Token já utilizado." }, { status: 401 });

  if (record.expiresAt < new Date())
    return NextResponse.json({ error: "Token expirado." }, { status: 401 });

  const consumido = await prisma.accessToken.updateMany({
    where: { id: record.id, used: false },
    data: { used: true },
  });

  if (consumido.count === 0)
    return NextResponse.json({ error: "Token já utilizado." }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set(TCC_COOKIE, await criarCookieDeAcessoTcc(record.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
