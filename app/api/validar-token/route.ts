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

  // Marca como usado só se ainda não estava: se duas pessoas digitarem o mesmo token
  // ao mesmo tempo, apenas uma consegue entrar
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
    // Sem maxAge: é um cookie de sessão, some quando o navegador fecha.
    // O prazo máximo fica dentro do próprio cookie (TCC_ACESSO_SEGUNDOS).
    // "/" para que as rotas /api/tcc e /api/verificar-acesso também recebam o cookie
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
