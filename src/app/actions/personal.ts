"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { personalSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function crearPersonal(
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(personalSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.personal.create({ data: parsed.data });
    revalidatePath("/maestros/personal");
    return { success: true, message: "Personal creado exitosamente" };
  } catch {
    return { success: false, message: "Error al crear el personal" };
  }
}

export async function editarPersonal(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(personalSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  try {
    await prisma.personal.update({ where: { id }, data: parsed.data });
    revalidatePath("/maestros/personal");
    return { success: true, message: "Personal actualizado exitosamente" };
  } catch {
    return { success: false, message: "Error al actualizar el personal" };
  }
}

export async function eliminarPersonal(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  try {
    await prisma.personal.delete({ where: { id } });
    revalidatePath("/maestros/personal");
    return { success: true, message: "Personal eliminado" };
  } catch {
    return { success: false, message: "Error al eliminar el personal" };
  }
}
