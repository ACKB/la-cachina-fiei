import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getUserWithProducts,
  isProductExpired,
  getDaysRemaining,
} from "@/lib/queries/user";
import { formatPrice } from "@/lib/format";
import Navbar from "@/components/navbar";
import ProductActions from "@/components/products/ProductActions";
import WhatsAppForm from "@/components/products/WhatsAppForm";
import Link from "next/link";
import Image from "next/image";

/**
 * Panel de control del usuario autenticado.
 * El proxy (proxy.ts) ya protege esta ruta, pero se valida defensivamente.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserWithProducts(session.user.id);
  if (!user) redirect("/login");

  const activeProducts = user.products.filter(
    (p) => p.status === "AVAILABLE" && !isProductExpired(p)
  );
  const expiredProducts = user.products.filter(isProductExpired);
  const soldProducts = user.products.filter((p) => p.status === "SOLD");

  const stats = [
    {
      label: "Activas",
      value: activeProducts.length,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Vencidas",
      value: expiredProducts.length,
      color: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
    },
    {
      label: "Vendidas",
      value: soldProducts.length,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar showUserControls userEmail={user.email} />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Hola, {user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
              Gestiona tus publicaciones
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-orange-200 dark:shadow-none"
          >
            <span className="text-base">+</span>
            Publicar producto
          </Link>
        </div>

        {/* Configuración de WhatsApp faltante */}
        {!user.whatsappNumber && (
          <div className="mb-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-orange-500">📱</span> Configuración de contacto
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4 max-w-sm">
              Agrega tu número para que los compradores puedan contactarte sobre tus productos.
            </p>
            <WhatsAppForm />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-[2rem] p-4 flex flex-col items-center text-center shadow-sm border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors`}
            >
              <span className={`text-3xl font-black ${stat.color} drop-shadow-sm`}>
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Configuración WhatsApp (si ya tiene número) */}
        {user.whatsappNumber && (
          <div className="mb-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-green-500">📱</span> Número de contacto
            </p>
            <WhatsAppForm currentNumber={user.whatsappNumber} />
          </div>
        )}

        {/* Lista de publicaciones */}
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            Mis publicaciones
          </h2>

          {user.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
              <div className="text-6xl mb-4 grayscale opacity-50">🗂️</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium">
                Aún no tienes publicaciones activas en la plataforma.
              </p>
              <Link
                href="/dashboard/new"
                className="px-6 py-3 rounded-full bg-primary hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Publicar mi primer producto
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {user.products.map((product) => {
                const expired = isProductExpired(product);
                const daysLeft = getDaysRemaining(product.expiresAt);
                const isSold = product.status === "SOLD";

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      {/* Imagen */}
                      <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={product.imageUrls[0] || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white text-base truncate mb-0.5">
                          {product.title}
                        </p>
                        <p className="inline-block text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full mb-2">
                          {product.category.name}
                        </p>
                        <p className="text-base font-black text-primary leading-none">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="shrink-0 self-start">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${
                            isSold
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : expired
                                ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          }`}
                        >
                          {isSold
                            ? "Vendido"
                            : expired
                              ? "Vencido"
                              : `${daysLeft}d restantes`}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4">
                      <ProductActions
                        productId={product.id}
                        status={product.status}
                        isSold={isSold}
                        isExpired={expired}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
