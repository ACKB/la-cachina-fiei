import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

/**
 * Singleton de PrismaClient para el runtime de Node.js.
 *
 * Prisma v7 requiere un Driver Adapter en lugar de una URL de conexión
 * directa en el schema o en el constructor. Usamos `@prisma/adapter-pg`
 * (el adaptador oficial para PostgreSQL nativo de Node.js).
 *
 * @see https://pris.ly/d/prisma7-client-config
 * @see https://www.prisma.io/docs/orm/overview/databases/postgresql#using-the-pg-driver
 */
const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
