import { NextResponse } from "next/server";
import { temAcessoAoTcc } from "@/lib/acesso-tcc";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: await temAcessoAoTcc() });
}
