import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TCC_COOKIE } from "@/lib/acesso-tcc";

export const dynamic = "force-dynamic";

// Encerra o acesso aos TCCs (apaga o cookie do token). É chamada quando a pessoa sai da
// área de TCCs, para que voltar exija um novo token. Só mexe no cookie de acesso:
// a sessão do admin não é afetada.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(TCC_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
