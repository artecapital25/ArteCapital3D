import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Arte Capital | Precisión Creativa",
  description:
    "Sistema de administración de Arte Capital — Cotizaciones, pedidos, inventario y gestión integral de impresión 3D.",
  keywords: ["Arte Capital", "impresión 3D", "cotizaciones", "administración", "precisión creativa", "pwa"],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo1.png",
    apple: "/logo1.png",
  },
};

export const viewport = {
  themeColor: "#00b4d8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
