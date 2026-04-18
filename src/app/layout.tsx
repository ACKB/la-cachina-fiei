import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import UserFloatingButton from "@/components/UserFloatingButton";

export const metadata: Metadata = {
  title: "HardSwap - FIEI UNFV",
  description:
    "Plataforma exclusiva de compraventa de segunda mano para la comunidad de la Facultad de Ingeniería Electrónica e Informática de la UNFV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <UserFloatingButton />
      </body>
    </html>
  );
}
