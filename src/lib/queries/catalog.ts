/**
 * Capa de acceso a datos — Catalog
 *
 * Centraliza las queries de Prisma relacionadas al catálogo público.
 * Las páginas de UI no deben importar Prisma directamente.
 */
import prisma from "@/lib/prisma";

/**
 * Obtiene los productos disponibles y no vencidos para el catálogo público.
 * Ordenados por más recientes primero, con un límite de 50.
 */
export async function getAvailableProducts() {
  return prisma.product.findMany({
    where: {
      status: "AVAILABLE",
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      user: {
        select: { name: true, whatsappNumber: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export type AvailableProduct = Awaited<
  ReturnType<typeof getAvailableProducts>
>[number];
