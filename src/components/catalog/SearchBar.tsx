"use client";

/**
 * SearchBar.tsx — Barra de búsqueda de alto rendimiento
 *
 * Arquitectura:
 * - Debounce de 500ms para no enviar mensajes al worker en cada keystroke
 * - Web Worker con Fuse.js para no bloquear el Main Thread
 * - Máximo 10 resultados renderizados (slice en el Worker)
 * - Dropdown con backdrop-blur y animación
 * - Escape para cerrar
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { type SearchProduct } from "@/workers/search.worker";
import { formatPrice } from "@/lib/format";

interface SearchBarProps {
  /** Productos indexables — se pasan al Worker en el INIT */
  products: SearchProduct[];
  /** Callback cuando el usuario selecciona un resultado */
  onSelect?: (product: SearchProduct) => void;
  /** Callback con todos los IDs de resultados (para filtrar el grid) — null = limpiar búsqueda */
  onResults?: (ids: string[] | null) => void;
}

export default function SearchBar({ products, onSelect, onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar el Worker una sola vez
  useEffect(() => {
    const worker = new Worker(
      new URL("../../workers/search.worker.ts", import.meta.url)
    );

    worker.onmessage = (event: MessageEvent<{ type: "RESULTS"; results: SearchProduct[] }>) => {
      if (event.data.type === "RESULTS") {
        setResults(event.data.results);
        setIsLoading(false);
        // Notificar al padre con los IDs para filtrar el grid
        onResults?.(event.data.results.map((r) => r.id));
      }
    };

    // Inicializar con los productos del catálogo
    worker.postMessage({ type: "INIT", data: products });
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, [products]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Cancelar debounce previo
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      onResults?.(null); // Limpiar filtro de búsqueda en el padre
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    // Debounce estricto de 500ms
    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage({ type: "SEARCH", query: value });
    }, 500);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      setResults([]);
      inputRef.current?.blur();
    }
  }, []);

  const handleSelect = useCallback((product: SearchProduct) => {
    onSelect?.(product);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onResults?.(null); // Limpiar filtro en el padre
    inputRef.current?.focus();
  }, [onResults]);


  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none"
        />
        <input
          ref={inputRef}
          id="catalog-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar componentes, categorías…"
          className="
            w-full pl-9 pr-9 py-2.5 text-sm rounded-xl
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-700
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
            transition-all duration-200
          "
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          className="
            absolute top-full mt-2 left-0 right-0 z-50
            bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
            border border-zinc-200 dark:border-zinc-700
            rounded-xl shadow-xl shadow-zinc-900/10 dark:shadow-zinc-900/50
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          "
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce [animation-delay:0ms]" />
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce [animation-delay:150ms]" />
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No se encontraron productos para{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  &ldquo;{query}&rdquo;
                </span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Intenta con otro término o revisa la ortografía.
              </p>
            </div>
          ) : (
            <ul role="listbox" className="py-1 max-h-80 overflow-y-auto">
              {/* El slice ya viene del Worker, pero por seguridad hacemos otro */}
              {results.slice(0, 10).map((product) => (
                <li key={product.id} role="option">
                  <button
                    onClick={() => handleSelect(product)}
                    className="
                      w-full flex items-center gap-3 px-4 py-2.5
                      hover:bg-orange-50 dark:hover:bg-orange-950/30
                      transition-colors duration-100 text-left group
                    "
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                        {product.categoryName}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className="text-zinc-300 dark:text-zinc-600 group-hover:text-orange-500 transition-colors shrink-0"
                    />
                  </button>
                </li>
              ))}
              <li className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-400 text-center">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} — búsqueda local, sin peticiones al servidor
                </p>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
