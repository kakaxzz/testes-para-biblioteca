import { NextResponse } from "next/server";
import { temTokenDeAcesso } from "@/lib/acesso-tcc";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: await temTokenDeAcesso() });
}
