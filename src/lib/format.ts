/**
 * Capa de formato — centraliza todas las transformaciones de presentación
 * para evitar implementaciones inconsistentes en los componentes de UI.
 */

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 0,
});

/**
 * Convierte un precio almacenado en centavos a soles peruanos formateados.
 * @param centavos - Precio en centavos (entero). Ej: 1500 → "S/ 15"
 */
export function formatPrice(centavos: number): string {
  return PEN_FORMATTER.format(centavos / 100);
}

/**
 * Construye la URL de WhatsApp con el mensaje prellenado para contactar
 * al vendedor de un producto.
 * @param phone - Número de teléfono del vendedor (puede incluir espacios/guiones)
 * @param productTitle - Título del producto
 * @param priceCentavos - Precio en centavos
 */
export function buildWhatsAppUrl(
  phone: string,
  productTitle: string,
  priceCentavos: number
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = `Hola, vi tu publicación en La Cachina de FIEI: "${productTitle}" a ${formatPrice(priceCentavos)}. ¿Sigue disponible?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
