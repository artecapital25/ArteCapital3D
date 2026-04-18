"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import {
  insumoSchema,
  stockUpdateSchema,
  parseFormData,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function crearInsumo(formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(insumoSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  // Verificar código único
  const existente = await prisma.insumo.findUnique({
    where: { codigoItem: data.codigoItem },
  });

  if (existente) {
    return {
      success: false,
      errors: { codigoItem: "Este código de item ya está en uso" },
    };
  }

  try {
    await prisma.insumo.create({
      data: {
        codigoItem: data.codigoItem,
        nombre: data.nombre,
        marca: data.marca || null,
        categoria: data.categoria || null,
        volumen: data.volumen ?? null,
        valor: data.valor,
        valorUnidad: data.valorUnidad,
        linkCompra: data.linkCompra || null,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
      },
    });

    revalidatePath("/inventario/insumos");
    return { success: true, message: "Insumo creado exitosamente" };
  } catch {
    return { success: false, message: "Error al crear el insumo" };
  }
}

export async function editarInsumo(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(insumoSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  // Verificar que el código no esté en uso por OTRO insumo
  const existente = await prisma.insumo.findFirst({
    where: { codigoItem: data.codigoItem, NOT: { id } },
  });

  if (existente) {
    return {
      success: false,
      errors: { codigoItem: "Este código ya está en uso por otro insumo" },
    };
  }

  try {
    await prisma.insumo.update({
      where: { id },
      data: {
        codigoItem: data.codigoItem,
        nombre: data.nombre,
        marca: data.marca || null,
        categoria: data.categoria || null,
        volumen: data.volumen ?? null,
        valor: data.valor,
        valorUnidad: data.valorUnidad,
        linkCompra: data.linkCompra || null,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
      },
    });

    revalidatePath("/inventario/insumos");
    return { success: true, message: "Insumo actualizado exitosamente" };
  } catch {
    return { success: false, message: "Error al actualizar el insumo" };
  }
}

export async function eliminarInsumo(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  try {
    await prisma.insumo.delete({ where: { id } });
    revalidatePath("/inventario/insumos");
    return { success: true, message: "Insumo eliminado" };
  } catch {
    return { success: false, message: "Error al eliminar el insumo" };
  }
}

export async function actualizarStock(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(stockUpdateSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { cantidad, tipo } = parsed.data;

  const insumo = await prisma.insumo.findUnique({ where: { id } });
  if (!insumo) {
    return { success: false, message: "Insumo no encontrado" };
  }

  const nuevoStock =
    tipo === "entrada" ? insumo.stock + cantidad : insumo.stock - cantidad;

  if (nuevoStock < 0) {
    return {
      success: false,
      message: `Stock insuficiente. Stock actual: ${insumo.stock}`,
    };
  }

  try {
    await prisma.insumo.update({
      where: { id },
      data: { stock: nuevoStock },
    });

    revalidatePath("/inventario/insumos");
    return {
      success: true,
      message: `Stock actualizado: ${insumo.stock} → ${nuevoStock}`,
    };
  } catch {
    return { success: false, message: "Error al actualizar el stock" };
  }
}

export async function generarCodigoInsumo(): Promise<string> {
  await requireAuth();

  const ultimo = await prisma.insumo.findFirst({
    orderBy: { codigoItem: "desc" },
    where: { codigoItem: { startsWith: "INS-" } },
  });

  if (!ultimo) return "INS-001";

  const numStr = ultimo.codigoItem.replace("INS-", "");
  const num = parseInt(numStr, 10);
  return `INS-${String(num + 1).padStart(3, "0")}`;
}
