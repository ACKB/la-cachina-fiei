/**
 * Module augmentation para NextAuth v5 (next-auth@beta).
 *
 * Por defecto, `Session.user.id` es `string | undefined`. El callback
 * `session()` en auth.ts garantiza que siempre existe cuando hay sesión
 * activa (se asigna desde el adaptador de Prisma). Este archivo le
 * informa a TypeScript de esa garantía para evitar non-null assertions
 * esparcidas por todo el código.
 */
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
