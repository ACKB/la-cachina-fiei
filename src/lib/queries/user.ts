/**
 * Capa de acceso a datos — User
 *
 * Centraliza las queries de Prisma relacionadas al usuario autenticado.
 * Incluye la lógica de negocio para clasificar productos por estado.
 */
import prisma from "@/lib/prisma";
import type { ProductStatus } from "@prisma/client";

/**
 * Obtiene el usuario con todas sus publicaciones para el panel de control.
 * Retorna null si el usuario no existe.
 */
export async function getUserWithProducts(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      whatsappNumber: true,
      products: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export type UserWithProducts = NonNullable<
  Awaited<ReturnType<typeof getUserWithProducts>>
>;

export type UserProduct = UserWithProducts["products"][number];

/**
 * Regla de negocio: un producto está vencido si su status es EXPIRED
 * O si su fecha de expiración ya pasó (campo calculado).
 */
export function isProductExpired(product: {
  status: ProductStatus;
  expiresAt: Date;
}): boolean {
  return product.status === "EXPIRED" || product.expiresAt <= new Date();
}

/**
 * Calcula los días restantes de una publicación activa.
 * Retorna un número negativo si ya venció.
 */
export function getDaysRemaining(expiresAt: Date): number {
  return Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
