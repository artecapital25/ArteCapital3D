import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Instanciamos Prisma limpio y nativo, sin adaptadores Pg externos
// Esto permite que el motor en Rust de Prisma se encargue de los 
// certificados SSL generados por el Pooler de Supabase automáticamente.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
