import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Verificar variables críticas al arrancar (aparecerá en Vercel Function Logs)
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[NextAuth] FATAL: NEXTAUTH_SECRET no está definido");
}
if (!process.env.DATABASE_URL) {
  console.error("[NextAuth] FATAL: DATABASE_URL no está definido");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Forzar Node.js runtime (NO Edge) — necesario para bcrypt y pg
export const runtime = "nodejs";
