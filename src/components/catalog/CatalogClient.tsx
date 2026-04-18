"use client";

/**
 * CatalogClient.tsx — Orquestador client-side del catálogo
 *
 * Recibe todos los productos desde el Server Component y gestiona:
 * - Estado del filtro de categoría activo
 * - Estado del filtro de subcategoría activo
 * - Estado de búsqueda (sincronizado desde SearchBar)
 * - Filtrado reactivo del grid sin peticiones adicionales al servidor
 */

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import CategoryBar, { CATEGORIES } from "./CategoryBar";
import SubcategoryChips from "./SubcategoryChips";
import SearchBar from "./SearchBar";
import { buildWhatsAppUrl, formatPrice } from "@/lib/format";
import Link from "next/link";

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  tags: string[]; // Subcategorías — llenado automáticamente por IA
  user: { name: string | null; whatsappNumber: string | null };
  category: { name: string };
}

export interface SearchableProduct {
  id: string;
  title: string;
  categoryName: string;
}

interface CatalogClientProps {
  products: CatalogProduct[];
  searchProducts: SearchableProduct[];
}

export default function CatalogClient({ products, searchProducts }: CatalogClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchResultIds, setSearchResultIds] = useState<Set<string> | null>(null);

  // Cuando cambia la categoría principal, resetear subcategoría
  const handleCategorySelect = useCallback((id: string | null) => {
    setActiveCategory(id);
    setActiveSubcategory(null);
    setSearchResultIds(null);
  }, []);

  // Cuando se selecciona resultado en SearchBar, filtrar el grid
  const handleSearchSelect = useCallback((product: SearchableProduct) => {
    setSearchResultIds(new Set([product.id]));
    setActiveCategory(null);
    setActiveSubcategory(null);
  }, []);

  // Cuando el SearchBar retorna resultados generales (buscar sin seleccionar)
  // — lo manejamos directamente desde el worker en SearchBar
  // Aquí exponemos un callback para que SearchBar actualice el set de IDs visibles
  const handleSearchResults = useCallback((ids: string[] | null) => {
    setSearchResultIds(ids ? new Set(ids) : null);
    if (ids) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    }
  }, []);

  // Filtrado reactivo memoizado — O(n) client-side sin peticiones extra
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filtro por búsqueda
    if (searchResultIds !== null) {
      result = result.filter((p) => searchResultIds.has(p.id));
      return result;
    }

    // Filtro por categoría
    if (activeCategory !== null) {
      const cat = CATEGORIES.find((c) => c.id === activeCategory);
      if (cat) {
        if (cat.match.length === 0) {
          // "Otros" — todo lo que no matchea ninguna categoría conocida
          const allKnownMatches = CATEGORIES.flatMap((c) => c.match).filter((m) => m.length > 0);
          result = result.filter((p) => {
            const catName = p.category.name.toLowerCase();
            return !allKnownMatches.some((m) => catName.includes(m));
          });
        } else {
          result = result.filter((p) => {
            const catName = p.category.name.toLowerCase();
            return cat.match.some((m) => catName.includes(m));
          });
        }
      }

      // Filtro por subcategoría usando los tags del producto
      // (filtrado exacto contra el array tags, no inferencia por título)
      if (activeSubcategory !== null && cat) {
        const sub = cat.subcategories.find((s) => s.id === activeSubcategory);
        if (sub) {
          result = result.filter((p) => {
            // Comparamos los match de la subcategoría contra los tags del producto
            const productTags = p.tags.map((t) => t.toLowerCase());
            return sub.match.some((m) =>
              productTags.some((tag) => tag.includes(m))
            );
          });
        }
      }
    }

    return result;
  }, [products, activeCategory, activeSubcategory, searchResultIds]);

  const totalLabel = searchResultIds !== null
    ? `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? "s" : ""} encontrado${filteredProducts.length !== 1 ? "s" : ""}`
    : activeCategory
    ? `${filteredProducts.length} producto${filteredProducts.length !== 1 ? "s" : ""} en "${CATEGORIES.find((c) => c.id === activeCategory)?.label}"`
    : `${products.length} productos disponibles`;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar Izquierdo: Categorías y Filtros */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5 sticky top-24">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white hidden lg:block">
          Catálogo de Componentes
        </h2>
        
        {/* Barra de búsqueda integrada al sidebar (o arriba en mobile) */}
        <div className="flex flex-col gap-3">
          <SearchBar
            products={searchProducts}
            onSelect={handleSearchSelect}
            onResults={handleSearchResults}
          />
          {(activeCategory || searchResultIds) && (
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveSubcategory(null);
                setSearchResultIds(null);
              }}
              className="text-xs text-zinc-500 hover:text-primary transition-colors text-left"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Lista de Categorías (Sidebar mode) */}
        <div className="hidden lg:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider">
            Categorías
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === null
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Todas
              </button>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-white font-medium shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Responsive CategoryBar para mobile (visible solo en <= lg) */}
        <div className="block lg:hidden w-full overflow-hidden">
          <CategoryBar
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Subcategorías Chips (Debajo de categorías en sidebar) */}
        <div className="w-full overflow-hidden">
          <SubcategoryChips
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelect={setActiveSubcategory}
          />
        </div>
      </aside>

      {/* Contenido Principal Derecho: Grilla de Productos */}
      <main className="flex-1 w-full flex flex-col gap-4">
        {/* Conteo superior y Header Mobile */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white lg:hidden">
            Catálogo
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {totalLabel}
          </p>
        </div>

        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Sin resultados
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              No hay productos que coincidan con tus filtros actuales.
            </p>
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveSubcategory(null);
                setSearchResultIds(null);
              }}
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Carrusel Swipeable de Imágenes */}
                <div className="relative h-56 bg-zinc-100 dark:bg-zinc-800 overflow-hidden group/carousel">
                  <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide hide-scrollbar">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      product.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-full h-full shrink-0 snap-center">
                          <Image
                            src={url}
                            alt={`${product.title} - ${idx + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  
                  {/* Etiqueta de categoría permanente */}
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-zinc-900 dark:bg-zinc-900/90 dark:text-white px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm z-10 pointer-events-none">
                    {product.category.name}
                  </span>
                  
                  {/* Indicadores de carrusel visuales (si hay más de 1 imagen) */}
                  {product.imageUrls && product.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none opacity-60 group-hover/carousel:opacity-100 transition-opacity">
                      {product.imageUrls.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white shadow-sm border border-black/10"></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Textual */}
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="font-bold text-zinc-900 dark:text-white text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-400 mb-0.5 tracking-wide">PRECIO</span>
                      <span className="text-xl font-black text-primary leading-none">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      👤 {product.user.name?.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* CTA — WhatsApp */}
                {product.user.whatsappNumber ? (
                  <a
                    href={buildWhatsAppUrl(
                      product.user.whatsappNumber,
                      product.title,
                      product.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold py-3.5 transition-colors border-t border-zinc-200 dark:border-zinc-800"
                  >
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <div className="block bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-center text-sm font-medium py-3.5 border-t border-zinc-200 dark:border-zinc-800">
                    Contacto no configurado
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
