import Navbar from "@/components/navbar";
import { getAvailableProducts } from "@/lib/queries/catalog";
import { buildWhatsAppUrl, formatPrice } from "@/lib/format";
import Link from "next/link";

export default async function CatalogPage() {
  const products = await getAvailableProducts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Catálogo de Componentes
          </h1>
          <p className="text-orange-100 text-base sm:text-lg max-w-2xl">
            Compra y vende componentes electrónicos de segunda mano entre
            estudiantes de la FIEI — UNFV.
          </p>
        </div>
      </div>

      {/* Disclaimer legal */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
        <p className="mx-auto max-w-7xl text-xs text-amber-800 dark:text-amber-300 text-center">
          ⚠️ <strong>Aviso:</strong> La UNFV no se hace responsable por las
          transacciones realizadas en esta plataforma. Los intercambios deben
          efectuarse de forma presencial en la facultad (contra entrega). Evita
          transferencias previas sin ver el producto.
        </p>
      </div>

      {/* Catálogo */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              No hay productos disponibles
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
              Sé el primero en publicar un componente. Inicia sesión con tu
              correo UNFV para comenzar.
            </p>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Publicar ahora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Imagen */}
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 px-2 py-0.5 rounded-full">
                    {product.category.name}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-4">
                  <h2 className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">
                    {product.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-orange-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      por {product.user.name?.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* CTA — WhatsApp */}
                {product.user.whatsappNumber ? (
                  <a
                    href={buildWhatsAppUrl(
                      product.user.whatsappNumber,
                      product.title,
                      product.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-green-500 hover:bg-green-600 text-white text-center text-sm font-semibold py-2.5 transition-colors"
                  >
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <div className="block bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-center text-sm py-2.5">
                    Sin contacto disponible
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-4 mt-10">
        <p className="text-center text-xs text-zinc-400">
          La Cachina de FIEI &mdash; Proyecto académico UNFV &bull; No es una
          pasarela de pagos oficial.
        </p>
      </footer>
    </div>
  );
}
