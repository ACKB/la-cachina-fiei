"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Props {
  userName?: string;
  userEmail?: string;
  signOutAction: () => Promise<void>;
}

export default function UserFloatingButtonClient({
  userName,
  userEmail,
  signOutAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initial = userName
    ? userName.charAt(0).toUpperCase()
    : userEmail?.charAt(0).toUpperCase() ?? "U";

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Menú de opciones — aparece encima del botón */}
      <div
        className={`flex flex-col gap-2 transition-all duration-200 origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 translate-y-4 pointer-events-none scale-95"
        }`}
      >
        {/* Nombre / email del usuario */}
        <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg text-xs text-zinc-500 dark:text-zinc-400 text-right min-w-[160px]">
          <p className="font-bold text-zinc-800 dark:text-zinc-100 truncate text-sm">
            {userName ?? "Usuario"}
          </p>
          {userEmail && (
            <p className="truncate text-[11px]">{userEmail}</p>
          )}
        </div>

        {/* Mi Panel */}
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-3 min-w-[160px] justify-center rounded-2xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-sm shadow-lg border border-zinc-200 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-transform"
        >
          📊 Mi Panel
        </Link>

        {/* Cerrar sesión */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-4 py-3 min-w-[160px] justify-center rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold text-sm shadow-lg border border-red-200 dark:border-red-800/50 hover:scale-105 active:scale-95 transition-transform"
          >
            🚪 Cerrar sesión
          </button>
        </form>
      </div>

      {/* Botón principal */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
          open
            ? "bg-zinc-800 dark:bg-white scale-95"
            : "bg-[#F07613] hover:scale-110 active:scale-95 shadow-orange-500/30"
        }`}
      >
        <span
          className={`font-black text-lg transition-all duration-200 ${
            open ? "text-white dark:text-zinc-900" : "text-white"
          }`}
        >
          {open ? "✕" : initial}
        </span>
      </button>
    </div>
  );
}
