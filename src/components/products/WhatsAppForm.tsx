"use client";

/**
 * WhatsAppForm — Formulario para configurar el número de WhatsApp.
 *
 * Client Component con useActionState para mostrar el resultado inline.
 */

import { useActionState } from "react";
import { updateWhatsApp, type UpdateWhatsAppState } from "@/lib/actions/user";

interface WhatsAppFormProps {
  currentNumber?: string | null;
}

const INITIAL: UpdateWhatsAppState = {};

export default function WhatsAppForm({ currentNumber }: WhatsAppFormProps) {
  const [state, action, isPending] = useActionState(updateWhatsApp, INITIAL);

  // Mostrar el número local (sin código 51)
  const displayNumber = currentNumber?.startsWith("51")
    ? currentNumber.slice(2)
    : (currentNumber ?? "");

  return (
    <form action={action} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
            🇵🇪 +51
          </span>
          <input
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            pattern="[9][0-9]{8}"
            maxLength={9}
            defaultValue={displayNumber}
            placeholder="987654321"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-16 pr-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>
        {state.error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ Número guardado correctamente.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors whitespace-nowrap"
      >
        {isPending ? "Guardando..." : "Guardar número"}
      </button>
    </form>
  );
}
