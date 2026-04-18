import { signIn } from "@/auth";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// En Next.js 15+, searchParams es una Promise que debe awaitearse.
type SearchParams = Promise<{ error?: string }>;

const getPlatformMetrics = unstable_cache(
  async () => {
    const [totalUsers, totalSold] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { status: "SOLD" } }),
    ]);
    return { totalUsers, totalSold };
  },
  ["platform-metrics"],
  { revalidate: 600 } // Cachear por 10 minutos
);

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

  // Extraer métricas históricas de la plataforma directamente desde la base de datos (cacheadas en Edge)
  const { totalUsers, totalSold } = await getPlatformMetrics();

  return (
    <div className="flex min-h-screen w-full flex-col relative bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header fijo: Logos UNFV (Izq) y FIEI (Der) */}
      <header className="w-full px-6 py-6 sm:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
            <Image
              src="/UNFV.svg"
              alt="Universidad Nacional Federico Villarreal"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="hidden sm:block text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase max-w-[150px] leading-tight">
            Universidad Nac. Federico Villarreal
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-right">
          <span className="hidden sm:block text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase max-w-[150px] leading-tight">
            Facultad de Ing. Electrónica e Informática
          </span>
          <div className="w-12 h-12 relative flex-shrink-0 bg-white rounded-full p-2 shadow-sm">
            <Image
              src="/FIEI.png"
              alt="Logo FIEI"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
        </div>
      </header>

      {/* Contenedor Central */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 w-full max-w-4xl mx-auto text-center mt-[-4rem]">
        
        {/* Badge Institucional */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-primary/20 text-primary text-sm font-medium mb-8 shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Plataforma Exclusiva FIEI
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 mb-6 drop-shadow-sm">
          Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500">HardSwap</span>
        </h1>
        
        {/* Descripción descriptiva */}
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl leading-relaxed">
          El marketplace oficial de hardware, componentes y herramientas para 
          estudiantes de la FIEI. Economiza tus proyectos y dale una segunda vida 
          a tu inventario.
        </p>

        {/* Mensaje de Error (si existe) */}
        {errorMessage && (
          <div className="mb-8 w-full max-w-md p-4 bg-red-50/80 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-2xl text-sm backdrop-blur-md shadow-sm">
            {errorMessage}
          </div>
        )}

        {/* Botón de Inicio de Sesión */}
        <div className="w-full max-w-sm mb-12">
          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="group relative w-full flex items-center justify-center gap-4 px-6 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg
                className="w-6 h-6 shrink-0 relative z-10"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="font-semibold text-lg relative z-10 transition-colors">
                Iniciar Sesión @unfv.edu.pe
              </span>
            </button>
          </form>
        </div>

        {/* Métricas Globales / Impacto Social */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-zinc-500 dark:text-zinc-500 text-sm font-medium bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Únete a <span className="font-bold text-zinc-900 dark:text-zinc-300">{totalUsers} estudiantes</span> en la plataforma
          </div>
          <div className="hidden sm:block w-px h-6 bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Descubre <span className="font-bold text-zinc-900 dark:text-zinc-300">{totalSold} componentes</span> vendidos exitosamente
          </div>
        </div>
      </main>
      
      {/* Footer Legal Mini */}
      <footer className="w-full text-center py-6 text-xs text-zinc-400 absolute bottom-0">
        * Acceso exclusivo para la comunidad universitaria UNFV. El correo institucional verifica tu identidad.
      </footer>
    </div>
  );
}
