"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { maquinaSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function crearMaquina(formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(maquinaSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.maquina.create({ data: parsed.data });
    revalidatePath("/maestros/maquinaria");
    return { success: true, message: "Máquina creada exitosamente" };
  } catch {
    return { success: false, message: "Error al crear la máquina" };
  }
}

export async function editarMaquina(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(maquinaSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.maquina.update({ where: { id }, data: parsed.data });
    revalidatePath("/maestros/maquinaria");
    return { success: true, message: "Máquina actualizada exitosamente" };
  } catch {
    return { success: false, message: "Error al actualizar la máquina" };
  }
}

export async function eliminarMaquina(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const cotizaciones = await prisma.cotizacion.count({
    where: { maquinaId: id },
  });

  if (cotizaciones > 0) {
    return {
      success: false,
      message: `No se puede eliminar: la máquina está usada en ${cotizaciones} cotización(es)`,
    };
  }

  try {
    await prisma.maquina.delete({ where: { id } });
    revalidatePath("/maestros/maquinaria");
    return { success: true, message: "Máquina eliminada" };
  } catch {
    return { success: false, message: "Error al eliminar la máquina" };
  }
}
