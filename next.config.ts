import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * OPTIMIZACIONES — Vercel Free Tier + Móvil Gama Baja (Redmi Note 7, 3-4GB RAM)
   *
   * 1. images.formats: Genera WebP automáticamente (30-50% menos peso que JPEG/PNG).
   *    Crítico para conexiones 4G lentas y dispositivos con poca RAM.
   *
   * 2. images.deviceSizes: Breakpoints ajustados a pantallas móviles reales.
   *    Evita descargar imágenes 2x innecesarias en gama baja.
   *
   * 3. turbopack: Bundler por defecto en Next.js 16. Web Workers nativos
   *    sin configuración adicional — Fuse.js corre fuera del Main Thread.
   */
  turbopack: {},
  images: {
    formats: ["image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    // Supabase Storage (R2 origin) — permite optimización de imágenes de Vercel
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
