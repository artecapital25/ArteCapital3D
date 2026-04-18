"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { resinaSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function crearResina(formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(resinaSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.resina.create({ data: parsed.data });
    revalidatePath("/inventario/resinas");
    return { success: true, message: "Resina creada exitosamente" };
  } catch {
    return { success: false, message: "Error al crear la resina" };
  }
}

export async function editarResina(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(resinaSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.resina.update({ where: { id }, data: parsed.data });
    revalidatePath("/inventario/resinas");
    return { success: true, message: "Resina actualizada exitosamente" };
  } catch {
    return { success: false, message: "Error al actualizar la resina" };
  }
}

export async function eliminarResina(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const cotizaciones = await prisma.cotizacion.count({
    where: { resinaId: id },
  });

  if (cotizaciones > 0) {
    return {
      success: false,
      message: `No se puede eliminar: la resina está usada en ${cotizaciones} cotización(es)`,
    };
  }

  try {
    await prisma.resina.delete({ where: { id } });
    revalidatePath("/inventario/resinas");
    return { success: true, message: "Resina eliminada" };
  } catch {
    return { success: false, message: "Error al eliminar la resina" };
  }
}
