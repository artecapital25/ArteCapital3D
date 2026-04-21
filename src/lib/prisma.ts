import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // 1. OMITIMOS EL BLOQUEO: Si el URL incluye 'sslmode=require', 
  // Node "pg" se vuelve hiper-estricto y choca con el Pgbouncer de Supabase (self-signed certs).
  // Se lo podamos de la URL para que nuestras reglas relajadas del objeto 'ssl' tomen control total.
  const cleanDbUrl = connectionString
    .replace("&sslmode=require", "")
    .replace("?sslmode=require", "");

  const pool = new Pool({
    connectionString: cleanDbUrl,
    ssl: { rejectUnauthorized: false }, // ESTA REGLA AHORA SÍ DOMINARÁ (Evitando el self-signed error 401 en Vercel)
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
