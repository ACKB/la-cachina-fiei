import { auth, signOut } from "@/auth";
import Link from "next/link";

interface NavbarProps {
  /** Muestra el correo del usuario y el botón de cerrar sesión (modo dashboard) */
  showUserControls?: boolean;
  /** Email del usuario a mostrar (sólo cuando showUserControls=true) */
  userEmail?: string | null;
}

/**
 * Navbar compartido entre el catálogo público y el panel de usuario.
 * Es un Server Component que llama a auth() para mostrar el CTA correcto.
 */
export default async function Navbar({
  showUserControls = false,
  userEmail,
}: NavbarProps) {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-600 text-white font-bold text-sm select-none">
            FIEI
          </div>
          <Link
            href="/"
            className="font-bold text-zinc-900 dark:text-white text-lg hidden sm:block hover:text-orange-600 transition-colors"
          >
            La Cachina
          </Link>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-3">
          {showUserControls && userEmail ? (
            // Modo dashboard: muestra el email y botón de cerrar sesión
            <>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block truncate max-w-[200px]">
                {userEmail}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : session?.user ? (
            // Visitante autenticado en modo catálogo
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 transition-colors"
            >
              Mi Panel
            </Link>
          ) : (
            // Visitante anónimo
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
