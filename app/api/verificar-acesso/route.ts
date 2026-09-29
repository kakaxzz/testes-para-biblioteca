import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const ok = cookieStore.get("tcc_access")?.value === "granted";
  return NextResponse.json({ ok });
}