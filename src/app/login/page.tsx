import { signIn } from "@/auth";

// En Next.js 15+, searchParams es una Promise que debe awaitearse.
type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  const errorMessage =
    error === "AccessDenied"
      ? "Acceso restringido. Solo correos @unfv.edu.pe son permitidos."
      : error;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-zinc-950">
      {/* Columna Izquierda (Branding) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-orange-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-700 via-orange-600 to-amber-500 z-0" />

        <div className="relative z-20 text-white p-12 flex flex-col justify-center h-full max-w-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-white text-orange-600 font-bold rounded-lg text-2xl">
              FIEI
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            La Cachina de FIEI
          </h1>
          <p className="text-lg text-orange-50 mb-8 max-w-md">
            La plataforma exclusiva para estudiantes de la Facultad de
            Ingeniería Electrónica e Informática de la UNFV. Encuentra
            circuitos, componentes, y más.
          </p>
        </div>
      </div>

      {/* Columna Derecha (Formulario Login) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl opacity-20 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-20 -ml-20 -mb-20" />

        <div className="z-10 w-full max-w-md p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-white/5">
          {/* Logo visible solo en mobile */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="p-2 bg-orange-600 text-white font-bold rounded-lg text-2xl">
              FIEI
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Inicia sesión para descubrir hardware de segunda mano y
              materiales de estudio.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full relative flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm group"
            >
              <svg
                className="w-6 h-6 shrink-0"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="font-medium text-lg">
                Ingresar con @unfv.edu.pe
              </span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/30 rounded-xl transition-all pointer-events-none" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            * Servicio exclusivo para la comunidad universitaria de la UNFV. Al
            ingresar aceptas nuestras normativas de convivencia interna.
          </p>
        </div>
      </div>
    </div>
  );
}
