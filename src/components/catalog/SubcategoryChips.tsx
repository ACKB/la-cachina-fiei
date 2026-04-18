"use client";

/**
 * SubcategoryChips.tsx — Chips de subcategoría (filtro secundario)
 *
 * Aparece con fade-in cuando hay una categoría activa. Permite afinar
 * el filtrado por modelo específico (ESP32, Raspberry Pi, etc.).
 */

import { CATEGORIES, type Subcategory } from "./CategoryBar";

interface SubcategoryChipsProps {
  activeCategory: string | null;
  activeSubcategory: string | null;
  onSelect: (id: string | null) => void;
}

export default function SubcategoryChips({
  activeCategory,
  activeSubcategory,
  onSelect,
}: SubcategoryChipsProps) {
  const category = CATEGORIES.find((c) => c.id === activeCategory);

  if (!category || category.subcategories.length === 0) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-top-2 duration-200 w-full overflow-x-auto scrollbar-hide py-1"
    >
      <div className="flex items-center gap-1.5 w-max px-1 pb-1">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1 shrink-0">
          Modelo:
        </span>

        {/* Chip "Todos" dentro de la subcategoría */}
        <button
          onClick={() => onSelect(null)}
          className={`
            px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border
            ${
              activeSubcategory === null
                ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 hover:text-orange-600"
            }
          `}
        >
          Todos
        </button>

        {category.subcategories.map((sub: Subcategory) => {
          const isActive = activeSubcategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(isActive ? null : sub.id)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border
                ${
                  isActive
                    ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 hover:text-orange-600"
                }
              `}
            >
              {sub.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
