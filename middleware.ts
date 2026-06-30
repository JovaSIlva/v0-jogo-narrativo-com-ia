import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/register']
const SESSION_COOKIE = 'cronnicas_session'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cronnicas-do-destino-secret-key-change-in-production'
)

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string; name: string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    // Se já está logado, redireciona para o jogo
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    return NextResponse.next()
  }

  // Rota protegida: verifica autenticação
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, ícones
     * - /api/auth (rotas públicas de auth)
     * - arquivos com extensão
     */
    '/((?!_next/static|_next/image|favicon|icon|apple-icon|.*\\.png$|.*\\.svg$|.*\\.jpg$|api/auth).*)',
  ],
}
