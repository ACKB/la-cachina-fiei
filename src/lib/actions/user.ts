/**
 * Server Actions — User
 *
 * Mutaciones relacionadas al perfil del usuario autenticado.
 */
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UpdateWhatsAppState = {
  error?: string;
  success?: boolean;
};

/**
 * Actualiza el número de WhatsApp del usuario autenticado.
 * Valida que el número sea un número peruano válido (9 dígitos empezando en 9).
 */
export async function updateWhatsApp(
  _prev: UpdateWhatsAppState,
  formData: FormData
): Promise<UpdateWhatsAppState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const raw = (formData.get("whatsapp") as string | null)?.trim() ?? "";
  // Limpiar todo lo que no sea dígito
  const digits = raw.replace(/\D/g, "");

  // Aceptar número con o sin código de país (51)
  const local = digits.startsWith("51") ? digits.slice(2) : digits;

  if (!/^9\d{8}$/.test(local)) {
    return {
      error: "Ingresa un número de celular peruano válido (ej. 987654321).",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { whatsappNumber: `51${local}` }, // Guardar con código de país
  });

  revalidatePath("/dashboard");
  return { success: true };
}
