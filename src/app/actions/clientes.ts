"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { clienteSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function crearCliente(formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(clienteSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  // Verificar código único
  const existente = await prisma.cliente.findUnique({
    where: { codigo: data.codigo },
  });

  if (existente) {
    return {
      success: false,
      errors: { codigo: "Este código ya está en uso" },
    };
  }

  try {
    await prisma.cliente.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        nit: data.nit || null,
        telefono: data.telefono || null,
        correo: data.correo || null,
        informacion: data.informacion || null,
      },
    });

    revalidatePath("/clientes");
    return { success: true, message: "Cliente creado exitosamente" };
  } catch {
    return { success: false, message: "Error al crear el cliente" };
  }
}

export async function editarCliente(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(clienteSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  // Verificar que el código no esté en uso por OTRO cliente
  const existente = await prisma.cliente.findFirst({
    where: { codigo: data.codigo, NOT: { id } },
  });

  if (existente) {
    return {
      success: false,
      errors: { codigo: "Este código ya está en uso por otro cliente" },
    };
  }

  try {
    await prisma.cliente.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        nit: data.nit || null,
        telefono: data.telefono || null,
        correo: data.correo || null,
        informacion: data.informacion || null,
      },
    });

    revalidatePath("/clientes");
    return { success: true, message: "Cliente actualizado exitosamente" };
  } catch {
    return { success: false, message: "Error al actualizar el cliente" };
  }
}

export async function eliminarCliente(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  // Verificar que no tenga cotizaciones asociadas
  const cotizaciones = await prisma.cotizacion.count({
    where: { clienteId: id },
  });

  if (cotizaciones > 0) {
    return {
      success: false,
      message: `No se puede eliminar: el cliente tiene ${cotizaciones} cotización(es) asociada(s)`,
    };
  }

  try {
    await prisma.cliente.delete({ where: { id } });
    revalidatePath("/clientes");
    return { success: true, message: "Cliente eliminado" };
  } catch {
    return { success: false, message: "Error al eliminar el cliente" };
  }
}

export async function generarCodigoCliente(): Promise<string> {
  await requireAuth();

  const ultimo = await prisma.cliente.findFirst({
    orderBy: { codigo: "desc" },
    where: { codigo: { startsWith: "CLI-" } },
  });

  if (!ultimo) return "CLI-001";

  const numStr = ultimo.codigo.replace("CLI-", "");
  const num = parseInt(numStr, 10);
  return `CLI-${String(num + 1).padStart(3, "0")}`;
}
