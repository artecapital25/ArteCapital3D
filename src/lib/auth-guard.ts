"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Verifica que el usuario tenga una sesión activa.
 * Usar al inicio de cada Server Action para proteger la operación.
 * 
 * @throws Error si no hay sesión activa
 * @returns La sesión del usuario autenticado
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("No autorizado: debes iniciar sesión");
  }

  return session;
}

/**
 * Verifica que el usuario sea ADMIN.
 * Usar para operaciones sensibles (eliminar, configurar).
 * 
 * @throws Error si no tiene rol ADMIN
 * @returns La sesión del usuario admin
 */
export async function requireAdmin() {
  const session = await requireAuth();

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    throw new Error("No autorizado: se requiere rol de administrador");
  }

  return session;
}

/**
 * Rate limiter simple en memoria.
 * En producción usar Redis, pero para 2-5 usuarios esto es suficiente.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): Promise<boolean> {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Limpiar entradas expiradas cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
