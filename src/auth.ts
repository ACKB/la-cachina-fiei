import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "@/auth.config"

/**
 * Instancia completa de Auth.js — Solo Node.js runtime.
 * Extiende authConfig con el PrismaAdapter para persistencia de sesiones.
 * Nunca debe importarse desde proxy.ts ni archivos del Edge Runtime.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
})
