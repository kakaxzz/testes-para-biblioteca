import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE = "session"

const PROTECTED_API_ROUTES: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /^\/api\/admin\/gerar-token$/, methods: ["POST"] },
  { pattern: /^\/api\/livros$/, methods: ["POST"] },
  { pattern: /^\/api\/livros\/[^/]+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^\/api\/devolucoes$/, methods: ["POST"] },
  { pattern: /^\/api\/usuarios\/[^/]+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^\/api\/biblionews$/, methods: ["PUT"] },
  { pattern: /^\/api\/tcc$/, methods: ["POST"] },
  { pattern: /^\/api\/emprestimos\/renovar$/, methods: ["POST"] },
  { pattern: /^\/api\/emprestimos$/, methods: ["POST"] },
]

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false

  const secret = process.env.SESSION_SECRET
  if (!secret) return false

  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const valid = await hasValidSession(request)
    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  const match = PROTECTED_API_ROUTES.find(
    (r) => r.pattern.test(pathname) && r.methods.includes(request.method)
  )
  if (match) {
    const valid = await hasValidSession(request)
    if (!valid) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login como admin." },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
