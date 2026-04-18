import Navbar from "@/components/navbar";
import {
  getAvailableProducts,
  getCatalogForSearch,
} from "@/lib/queries/catalog";
import CatalogClient from "@/components/catalog/CatalogClient";

/**
 * ESTRATEGIA DE OPTIMIZACIÓN — Vercel Free Tier + Móvil Gama Baja
 *
 * 1. ISR (Incremental Static Regeneration): El catálogo se sirve como página
 *    estática que Vercel cachea en el Edge. Una sola invocación de Supabase
 *    cada 5 minutos para TODOS los usuarios, no por usuario.
 *    → Reduce drásticamente las invocaciones serverless (~288/día vs. N×usuarios)
 *
 * 2. Promise.all: Ambas queries (grid completo + índice de búsqueda) se ejecutan
 *    en paralelo en una sola conexión Prisma.
 *
 * 3. Búsqueda 100% client-side: Fuse.js en Web Worker. Después de la carga inicial,
 *    CERO peticiones adicionales al servidor para búsquedas o filtros.
 *
 * 4. Filtrado de categorías/subcategorías: Array.filter() en memoria — O(n) client-side.
 *    Sin roundtrips al servidor.
 */
export const revalidate = 300; // 5 minutos — reduce invocaciones serverless en Vercel Free

export default async function CatalogPage() {
  const [products, searchProducts] = await Promise.all([
    getAvailableProducts(),
    getCatalogForSearch(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Catálogo de Componentes
          </h1>

        </div>
      </div>



      {/* Catálogo + Filtros + Búsqueda — todo interactivo en el Client Component */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <CatalogClient
          products={products}
          searchProducts={searchProducts}
        />
      </main>


    </div>
  );
}
