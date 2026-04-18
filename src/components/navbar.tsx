import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Lado Izquierdo: UNFV */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 relative flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
              <Image
                src="/UNFV.svg"
                alt="UNFV"
                fill
                className="object-contain p-0.5"
                sizes="40px"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col text-[10px] sm:text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase leading-snug">
              <span>Universidad Nacional</span>
              <span>Federico Villarreal</span>
            </div>
            <span className="sm:hidden text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">
              UNFV
            </span>
          </Link>
        </div>

        {/* Centro: HardSwap */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500 transition-transform hover:scale-105">
              HardSwap
            </span>
          </Link>
        </div>

        {/* Lado Derecho: FIEI */}
        <div className="flex items-center gap-2 sm:gap-3 text-right">
          <Link href="/" className="flex items-center gap-2 group justify-end">
            <span className="sm:hidden text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">
              FIEI
            </span>
            <div className="hidden sm:flex flex-col text-[10px] sm:text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase leading-snug text-right">
              <span>Facultad de Ingeniería</span>
              <span>Electrónica e Informática</span>
            </div>
            <div className="w-10 h-10 relative flex-shrink-0 bg-white rounded-full p-1 shadow-sm">
              <Image
                src="/FIEI.webp"
                alt="FIEI"
                fill
                className="object-contain p-0.5"
                sizes="40px"
                priority
              />
            </div>
          </Link>
        </div>

      </div>
    </nav>
  );
}
