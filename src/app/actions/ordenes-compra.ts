"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { ordenCompraSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: any;
};

// ==========================================
// CREAR ORDEN DE COMPRA
// ==========================================
export async function crearOC(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  // Custom parser to handle the dynamic array of items
  const proveedor = formData.get("proveedor") as string;
  const itemsStr = formData.get("items") as string;
  let rawItems = [];
  
  if (itemsStr) {
    try {
      rawItems = JSON.parse(itemsStr);
    } catch (e) {
      return { success: false, message: "Error al leer los items del formulario" };
    }
  }

  // Use zod schema manually for structured data instead of normal Form Data parser
  const parseResult = ordenCompraSchema.safeParse({
    proveedor,
    items: rawItems
  });

  if (!parseResult.success) {
    const errors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    return { success: false, errors };
  }

  const data = parseResult.data;

  try {
    // Generar prefijo OC
    const year = new Date().getFullYear();
    const prefix = `OC-${year}-`;
    const ultimo = await prisma.ordenCompra.findFirst({
      where: { numeroOrden: { startsWith: prefix } },
      orderBy: { numeroOrden: "desc" },
    });

    const numStr = ultimo ? ultimo.numeroOrden.replace(prefix, "") : "0";
    const numeroOrden = `${prefix}${String(parseInt(numStr, 10) + 1).padStart(3, "0")}`;

    // Calcular total
    const total = data.items.reduce((acc, item) => acc + (item.cantidad * item.valorUnitario), 0);

    const result = await prisma.ordenCompra.create({
      data: {
        numeroOrden,
        proveedor: data.proveedor,
        total,
        estado: "pendiente",
        items: {
          create: data.items.map(item => ({
            insumoId: item.insumoId,
            cantidad: item.cantidad,
            valorUnitario: item.valorUnitario,
            subtotal: item.cantidad * item.valorUnitario,
          }))
        }
      }
    });

    revalidatePath("/ordenes-compra");
    return { 
      success: true, 
      message: `Orden ${numeroOrden} creada exitosamente`,
      data: { id: result.id } 
    };

  } catch (error) {
    console.error("Error al crear la OC:", error);
    return { success: false, message: "Error interno al crear la orden de compra" };
  }
}

// ==========================================
// MARCAR OC COMO RECIBIDA (AUMENTA STOCK)
// ==========================================
export async function recibirOC(ordenId: string): Promise<ActionResult> {
  await requireAdmin();

  const oc = await prisma.ordenCompra.findUnique({
    where: { id: ordenId },
    include: { items: true }
  });

  if (!oc) return { success: false, message: "Orden no encontrada" };
  if (oc.estado === "recibida") return { success: false, message: "La orden ya fue recibida anteriormente" };

  try {
    // Transaction to update order status AND increase inventory stock
    await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      await tx.ordenCompra.update({
        where: { id: ordenId },
        data: { 
          estado: "recibida",
          fechaRecepcion: new Date()
        }
      });

      // 2. Increase stock for each item
      for (const item of oc.items) {
        await tx.insumo.update({
          where: { id: item.insumoId },
          data: {
            stock: {
              increment: item.cantidad
            }
          }
        });
      }
    });

    revalidatePath("/ordenes-compra");
    revalidatePath("/inventario/insumos"); // Update inventory counts visually

    return { success: true, message: "Orden recibida e inventario actualizado" };
  } catch (error) {
    console.error("Error al recibir la OC:", error);
    return { success: false, message: "Hubo un problema procesando el inventario" };
  }
}

// ==========================================
// ELIMINAR/CANCELAR ORDEN
// ==========================================
export async function cancelarOC(ordenId: string): Promise<ActionResult> {
  await requireAdmin();

  const oc = await prisma.ordenCompra.findUnique({ where: { id: ordenId }});
  
  if (!oc) return { success: false, message: "Orden no encontrada" };
  if (oc.estado === "recibida") {
    return { success: false, message: "No puedes cancelar una orden que ya ingresó al inventario" };
  }

  try {
    await prisma.ordenCompra.update({
      where: { id: ordenId },
      data: { estado: "cancelada" }
    });

    revalidatePath("/ordenes-compra");
    return { success: true, message: "Orden cancelada" };
  } catch (error) {
    return { success: false, message: "Error al cancelar la orden" };
  }
}
