import type { NextAuthConfig } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

/**
 * Configuración de Auth.js compatible con el Edge Runtime.
 *
 * ⚠️ IMPORTANTE: Este archivo NO debe importar `prisma` ni ningún módulo
 * que use APIs de Node.js (fs, net, crypto nativo, etc.).
 * Es usado por `proxy.ts` que corre en el Edge Runtime de Next.js.
 *
 * El PrismaAdapter se agrega exclusivamente en `auth.ts` (Node.js runtime).
 */
export const authConfig = {
  session: {
    /**
     * "jwt" obliga a que la sesión viaje como JWE firmado en la cookie,
     * compatible con el Edge Runtime del proxy (que no tiene PrismaAdapter).
     * El adapter sigue guardando User y Account en la DB para OAuth.
     */
    strategy: "jwt",
  } as const,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && user.email.endsWith("@unfv.edu.pe")) {
        return true
      }
      return false
    },
    /**
     * JWT callback: persiste el `id` del usuario en el token la primera vez
     * que se hace login (`user` solo existe en ese primer call).
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    /**
     * Session callback: expone el `id` desde el token JWT a los componentes
     * del servidor (pages, Server Components).
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
