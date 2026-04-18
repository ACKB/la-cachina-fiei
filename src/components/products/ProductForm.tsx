"use client";

/**
 * ProductForm — Formulario de publicación de producto.
 *
 * Client Component optimizado para móvil gama baja:
 * - Sin librerías de formularios pesadas (solo React hooks)
 * - Vista previa de imagen procesada en cliente antes de subir
 * - Compresión de imagen a WebP vía Canvas API (nativa, sin dependencias)
 * - useActionState para manejo de errores inline del Server Action
 */

import { useActionState, useRef, useState, useTransition } from "react";
import { createProduct, type CreateProductState } from "@/lib/actions/products";
import type { CategoryOption } from "@/lib/queries/categories";
import Image from "next/image";

interface ProductFormProps {
  categories: CategoryOption[];
}

const INITIAL_STATE: CreateProductState = {};

// Comprime imagen a WebP usando Canvas API (funciona en todos los móviles modernos)
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800; // px máximos (lado largo)
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          resolve(
            blob
              ? new File([blob], "image.webp", { type: "image/webp" })
              : file
          );
        },
        "image/webp",
        0.82 // calidad 82% — buen balance tamaño/calidad
      );
    };
    img.src = url;
  });
}

export default function ProductForm({ categories }: ProductFormProps) {
  const [state, action] = useActionState(createProduct, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [charCount, setCharCount] = useState(0);

  // Manejar selección y compresión de imagen
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Permitir un máximo de 3 imágenes
    const availableSlots = 3 - compressedFiles.length;
    const filesToProcess = files.slice(0, availableSlots);

    const newCompressed: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesToProcess) {
      const compressed = await compressImage(file);
      newCompressed.push(compressed);
      
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(compressed);
      });
      newPreviews.push(previewUrl);
    }

    setCompressedFiles((prev) => [...prev, ...newCompressed]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setCompressedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Submit: inyectar el archivo comprimido al FormData antes de enviarlo
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    fd.delete("image"); // Eliminar si existiera
    
    compressedFiles.forEach((file) => {
      fd.append("images", file, "image.webp");
    });

    startTransition(() => {
      action(fd);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error global */}
      {state.error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
          ⚠️ {state.error}
        </div>
      )}

      {/* Imagen */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Fotos del producto (Max 3) <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative w-32 h-32 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden group">
              <Image
                src={preview}
                alt={`Vista previa ${index + 1}`}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}

          {compressedFiles.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 shrink-0 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-orange-400 transition-colors flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">📷</span>
              <span className="text-[10px] text-zinc-500 font-medium">Agregar foto</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="image"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleImageChange}
          aria-label="Seleccionar imagen del producto"
        />
        {state.fieldErrors?.image && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.image}
          </p>
        )}
      </div>

      {/* Título */}
      <div>
        <label
          htmlFor="product-title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="product-title"
          name="title"
          type="text"
          placeholder="Ej. Arduino Uno R3 con cable USB"
          maxLength={80}
          required
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label
          htmlFor="product-category"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          id="product-category"
          name="categoryId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none"
        >
          <option value="" disabled>
            Selecciona una categoría...
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.categoryId && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.categoryId}
          </p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label
          htmlFor="product-price"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Precio (S/) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm select-none">
            S/
          </span>
          <input
            id="product-price"
            name="price"
            type="number"
            step="0.50"
            min="0.50"
            max="9999"
            placeholder="0.00"
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>
        {state.fieldErrors?.price && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.price}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="product-desc"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="product-desc"
          name="description"
          rows={4}
          maxLength={500}
          placeholder="Estado, accesorios incluidos, motivo de venta..."
          required
          onChange={(e) => setCharCount(e.target.value.length)}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          {state.fieldErrors?.description ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.description}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-zinc-400 ml-auto">
            {charCount}/500
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        {isPending ? "Publicando..." : "Publicar producto"}
      </button>
    </form>
  );
}
