/**
 * Capa de acceso a datos — Categories
 *
 * Centraliza las queries de Prisma relacionadas a las categorías.
 */
import prisma from "@/lib/prisma";

/**
 * Retorna todas las categorías ordenadas alfabéticamente.
 * Usado para el selector del formulario de publicación.
 */
export async function getAllCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type CategoryOption = Awaited<
  ReturnType<typeof getAllCategories>
>[number];
