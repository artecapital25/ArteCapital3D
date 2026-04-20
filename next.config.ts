import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },

  // ==========================================
  // SECURITY HEADERS
  // ==========================================
  async headers() {
    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: solo self + next.js inline (necesario para HMR en dev)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Estilos: self + inline (necesario para styled-jsx)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fuentes
      "font-src 'self' https://fonts.gstatic.com",
      // Imágenes: self + data URIs
      "img-src 'self' data: blob:",
      // Conexiones: self + Supabase + NextAuth
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // Sin iframes externos
      "frame-src 'none'",
      // Sin objetos embebidos
      "object-src 'none'",
      // Base URI restringida
      "base-uri 'self'",
      // Formularios solo al mismo origen
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
