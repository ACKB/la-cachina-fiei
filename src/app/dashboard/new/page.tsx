import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllCategories } from "@/lib/queries/categories";
import Navbar from "@/components/navbar";
import ProductForm from "@/components/products/ProductForm";
import Link from "next/link";

/**
 * Página de publicación de nuevo producto.
 * Requiere autenticación. Sirve el formulario con las categorías disponibles.
 */
export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar showUserControls userEmail={session.user?.email} />

      <main className="mx-auto max-w-lg px-4 py-8">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
            aria-label="Volver al panel"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Publicar producto
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tu publicación estará visible 14 días en el catálogo.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <ProductForm categories={categories} />
        </div>
      </main>
    </div>
  );
}
