import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";
import { chaveDoCliente, segundosDeBloqueio, registrarFalha, limparFalhas } from "@/lib/login-limite";

function respostaBloqueado(segundos: number) {
  return NextResponse.json(
    {
      error: "Muitas tentativas incorretas. Aguarde 2 minutos para tentar novamente.",
      bloqueadoSegundos: segundos,
    },
    { status: 429 }
  );
}

async function respostaCredenciaisInvalidas(chave: string) {
  const falha = await registrarFalha(chave);
  if (falha.bloqueado) return respostaBloqueado(falha.segundos);

  const plural = falha.restantes === 1 ? "tentativa" : "tentativas";
  return NextResponse.json(
    {
      error: `Usuário ou senha incorretos. Restam ${falha.restantes} ${plural}; ao errar 5 vezes, o login fica bloqueado por 2 minutos.`,
      tentativasRestantes: falha.restantes,
    },
    { status: 401 }
  );
}

export async function POST(request: Request) {
  const chave = chaveDoCliente(request);

  // Enquanto estiver bloqueado, nem confere a senha (mesmo que esteja certa).
  const bloqueio = await segundosDeBloqueio(chave);
  if (bloqueio > 0) return respostaBloqueado(bloqueio);

  const { usuario, senha } = await request.json();

  if (typeof usuario !== "string" || typeof senha !== "string") {
    return respostaCredenciaisInvalidas(chave);
  }

  const admin = await prisma.admin.findUnique({ where: { email: usuario } });
  if (!admin) return respostaCredenciaisInvalidas(chave);

  const senhaValida = await verifyPassword(senha, admin.senha);
  if (!senhaValida) return respostaCredenciaisInvalidas(chave);

  await limparFalhas(chave);

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
