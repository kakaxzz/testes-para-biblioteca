import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const token = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.accessToken.create({
    data: {
      token,
      expiresAt: new Date(Date.now() + 60 * 1000),
    },
  });

  return NextResponse.json({ token });
}