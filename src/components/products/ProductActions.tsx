"use client";

/**
 * ProductActions — Botones de gestión de una publicación (vender / eliminar).
 *
 * Client Component para manejar confirmaciones de acción destructiva
 * sin ninguna librería de modal externa.
 */

import { useTransition } from "react";
import { markAsSold, deleteProduct } from "@/lib/actions/products";

interface ProductActionsProps {
  productId: string;
  status: string;
  isSold: boolean;
  isExpired: boolean;
}

export default function ProductActions({
  productId,
  isSold,
  isExpired,
}: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleMarkSold() {
    if (!confirm("¿Confirmas que este producto ya fue vendido?")) return;
    startTransition(() => markAsSold(productId));
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    startTransition(() => deleteProduct(productId));
  }

  if (isSold) return null; // Ya vendido, sin acciones

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
      {!isExpired && (
        <button
          onClick={handleMarkSold}
          disabled={isPending}
          className="flex-1 text-xs py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
        >
          ✓ Marcar vendido
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex-1 text-xs py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
      >
        {isPending ? "..." : "🗑 Eliminar"}
      </button>
    </div>
  );
}
