import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWithProducts, isProductExpired, getDaysRemaining } from "@/lib/queries/user";
import { formatPrice } from "@/lib/format";
import Navbar from "@/components/navbar";

/**
 * Panel de control del usuario autenticado.
 * El proxy (proxy.ts) ya protege esta ruta, pero se valida defensivamente
 * para garantizar que siempre hay sesión antes de hacer la query.
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
      label: "Publicaciones activas",
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Panel de usuario
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Hola, {user.name?.split(" ")[0]} 👋 — Gestiona tus publicaciones
            </p>
          </div>
          {/* TODO V2: Botón de creación de producto */}
          <div className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
            📌 Publicar productos disponible en V2
          </div>
        </div>

        {/* Alerta de WhatsApp faltante */}
        {!user.whatsappNumber && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                Número de WhatsApp no configurado
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                Debes agregar tu número para que los compradores puedan
                contactarte. (Disponible en V2)
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 flex flex-col items-center text-center`}
            >
              <span className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Lista de publicaciones */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Mis publicaciones
          </h2>

          {user.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-5xl mb-3">🗂️</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Aún no tienes publicaciones. Estará disponible en V2.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {user.products.map((product) => {
                const expired = isProductExpired(product);
                const daysLeft = getDaysRemaining(product.expiresAt);

                return (
                  <div
                    key={product.id}
                    className="flex gap-4 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg shrink-0 bg-zinc-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {product.category.name}
                      </p>
                      <p className="text-sm font-bold text-orange-600 mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          product.status === "SOLD"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : expired
                              ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                      >
                        {product.status === "SOLD"
                          ? "Vendido"
                          : expired
                            ? "Vencido"
                            : `${daysLeft}d restantes`}
                      </span>
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
