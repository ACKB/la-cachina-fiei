import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

/**
 * Proxy (Next.js 16) — Corre en el Edge Runtime.
 *
 * Usa `authConfig` directamente (sin PrismaAdapter) para ser compatible
 * con el Edge Runtime. Solo verifica el JWT de sesión en la cookie —
 * no realiza ninguna consulta a la base de datos.
 */
const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  if (isAuthPage) {
    if (isAuth) {
      return Response.redirect(new URL('/', req.nextUrl))
    }
    return null
  }

  // Si no está autenticado y no está en login, enviar a login (incluso si está en "/")
  if (!isAuth) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
