/**
 * Server Actions — Products
 *
 * Centraliza las mutaciones de datos relacionadas a productos.
 * Todas las funciones validan la sesión antes de operar.
 */
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Validaciones

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PRODUCT_EXPIRY_DAYS = 14;

// ---------------------------------------------------------------------------
// createProduct

export type CreateProductState = {
  error?: string;
  fieldErrors?: {
    title?: string;
    description?: string;
    price?: string;
    categoryId?: string;
    image?: string;
  };
};

/**
 * Server Action para publicar un producto nuevo.
 * Recibe un FormData con los campos del formulario de publicación.
 */
export async function createProduct(
  _prev: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // --- Extraer campos ---
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const priceRaw = (formData.get("price") as string | null)?.trim() ?? "";
  const categoryId =
    (formData.get("categoryId") as string | null)?.trim() ?? "";
  const images = formData.getAll("images") as File[];
  
  if (images.length === 0) {
    // maybe it's under 'image' still from old form temporarily? Let's check both
    const singleImage = formData.get("image") as File | null;
    if (singleImage && singleImage.size > 0) {
      images.push(singleImage);
    }
  }

  // --- Validar campos ---
  const fieldErrors: CreateProductState["fieldErrors"] = {};

  if (!title || title.length < 3) {
    fieldErrors.title = "El título debe tener al menos 3 caracteres.";
  }
  if (title.length > 80) {
    fieldErrors.title = "El título no puede superar 80 caracteres.";
  }
  if (!description || description.length < 10) {
    fieldErrors.description =
      "La descripción debe tener al menos 10 caracteres.";
  }
  if (description.length > 500) {
    fieldErrors.description =
      "La descripción no puede superar 500 caracteres.";
  }

  const priceNum = parseFloat(priceRaw);
  if (isNaN(priceNum) || priceNum <= 0) {
    fieldErrors.price = "El precio debe ser un número mayor a 0.";
  }
  if (priceNum > 9999) {
    fieldErrors.price = "El precio no puede superar S/ 9,999.";
  }

  if (!categoryId) {
    fieldErrors.categoryId = "Debes seleccionar una categoría.";
  }

  const validImages = images.filter((img) => img.size > 0);

  if (validImages.length === 0) {
    fieldErrors.image = "Debes subir al menos una imagen del producto.";
  } else if (validImages.length > 3) {
    fieldErrors.image = "Puedes subir un máximo de 3 imágenes.";
  } else {
    for (const img of validImages) {
      if (!ALLOWED_MIME_TYPES.includes(img.type)) {
        fieldErrors.image = "Solo se aceptan imágenes JPG, PNG o WebP.";
        break;
      }
      if (img.size > MAX_IMAGE_SIZE_BYTES) {
        fieldErrors.image = "Cada imagen no puede superar los 3 MB.";
        break;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // --- Verificar que la categoría existe ---
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!categoryExists) {
    return { error: "La categoría seleccionada no existe." };
  }

  // --- Subir imágenes a R2 ---
  let imageUrls: string[] = [];
  try {
    const uploadPromises = validImages.map(async (image) => {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = image.type.split("/")[1] || "webp";
      const key = `products/${userId}/${randomUUID()}.${ext}`;
      return uploadToR2(key, buffer, image.type);
    });
    imageUrls = await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploadToR2:", error);
    return { error: "Error subiendo las imágenes. Intenta de nuevo." };
  }

  // --- Calcular fechas ---
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + PRODUCT_EXPIRY_DAYS);

  // Precio en centavos (int)
  const priceInCentavos = Math.round(priceNum * 100);

  // --- Crear producto en DB ---
  try {
    await prisma.product.create({
      data: {
        title,
        description,
        price: priceInCentavos,
        imageUrls,
        categoryId,
        userId,
        expiresAt,
        tags: [], // Reservado para IA en Sprint futuro
      },
    });
  } catch {
    return { error: "Error guardando el producto. Intenta de nuevo." };
  }

  // --- Invalidar caché del catálogo ---
  revalidatePath("/");
  revalidatePath("/dashboard");

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// markAsSold

/**
 * Marca un producto del usuario como vendido.
 * Verifica que el producto pertenece al usuario autenticado.
 */
export async function markAsSold(productId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await prisma.product.updateMany({
    where: { id: productId, userId: session.user.id },
    data: { status: "SOLD" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// deleteProduct

/**
 * Elimina un producto del usuario.
 * Verifica que el producto pertenece al usuario autenticado.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await prisma.product.deleteMany({
    where: { id: productId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}
