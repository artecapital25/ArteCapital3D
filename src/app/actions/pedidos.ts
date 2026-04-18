"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { estadoPedidoSchema, parseFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { enviarNotificacionPedido } from "@/lib/emails";
import { EstadoPedido } from "@prisma/client";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: any;
};

// ==========================================
// CREAR PEDIDO (Desde Cotización Aprobada)
// ==========================================
export async function crearPedido(cotizacionId: string): Promise<ActionResult> {
  await requireAuth();

  if (!cotizacionId) return { success: false, message: "ID de cotización requerido" };

  // 1. Verificar cotización
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: cotizacionId },
    include: { pedido: true },
  });

  if (!cotizacion) return { success: false, message: "Cotización no encontrada" };
  if (cotizacion.estado !== "aceptado") {
    return { success: false, message: "La cotización debe estar aceptada para crear un pedido" };
  }
  if (cotizacion.pedido) {
    return { success: false, message: "Esta cotización ya tiene un pedido en curso" };
  }

  try {
    // 2. Generar número de pedido secuencial (PED-2026-001)
    const year = new Date().getFullYear();
    const prefix = `PED-${year}-`;
    const ultimo = await prisma.pedido.findFirst({
      where: { numeroPedido: { startsWith: prefix } },
      orderBy: { numeroPedido: "desc" },
    });

    const numStr = ultimo ? ultimo.numeroPedido.replace(prefix, "") : "0";
    const num = parseInt(numStr, 10);
    const numeroPedido = `${prefix}${String(num + 1).padStart(3, "0")}`;

    // 3. Transacción para crear pedido + historial inicial
    const result = await prisma.$transaction(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          cotizacionId,
          estado: "APROBADO", // Pasa directo a APROBADO por venir de cotización aceptada
        },
      });

      await tx.historialPedido.create({
        data: {
          pedidoId: nuevoPedido.id,
          estadoAnterior: "COTIZADO",
          estadoNuevo: "APROBADO",
          nota: "Pedido creado automáticamente desde cotización aprobada.",
        },
      });

      return nuevoPedido;
    });

    revalidatePath("/pedidos");
    revalidatePath(`/cotizaciones/${cotizacionId}`);
    return { 
      success: true, 
      message: `Pedido ${numeroPedido} generado exitosamente`,
      data: { id: result.id } 
    };

  } catch (error) {
    console.error("Error al crear pedido:", error);
    return { success: false, message: "Error interno al crear el pedido" };
  }
}

// ==========================================
// ACTUALIZAR ESTADO DE PEDIDO
// ==========================================
export async function actualizarEstadoPedido(
  pedidoId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(estadoPedidoSchema, formData);
  if (!parsed.success) return { success: false, errors: parsed.errors };

  const { estado: estadoNuevoStr, nota } = parsed.data;
  const estadoNuevo = estadoNuevoStr as EstadoPedido;

  // Obtener pedido actual y datos de cliente para notificaciones
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      cotizacion: {
        include: {
          cliente: true,
        },
      },
    },
  });

  if (!pedido) return { success: false, message: "Pedido no encontrado" };
  if (pedido.estado === estadoNuevo) {
    return { success: false, message: "El pedido ya está en este estado" };
  }

  try {
    // 1. Actualizar estado y registrar historial en transacción
    await prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { estado: estadoNuevo },
      });

      await tx.historialPedido.create({
        data: {
          pedidoId,
          estadoAnterior: pedido.estado,
          estadoNuevo,
          nota: nota || null,
        },
      });
    });

    // 2. Disparar notificaciones por Email (Si aplica)
    if (estadoNuevo === "EN_ENVIO" || estadoNuevo === "ENTREGADO") {
      const clienteCorreo = pedido.cotizacion.cliente.correo;
      
      if (clienteCorreo) {
        // Run without awaiting to avoid blocking UI response
        enviarNotificacionPedido({
          to: clienteCorreo,
          subject: estadoNuevo === "EN_ENVIO" ? "Arte Capital — Tu pedido va en camino" : "Arte Capital — Pedido entregado",
          clienteNombre: pedido.cotizacion.cliente.nombre,
          numeroPedido: pedido.numeroPedido,
          item: pedido.cotizacion.item,
          estado: estadoNuevo,
        }).catch(err => console.error("Error enviando email background:", err));
      } else {
        console.warn(`No se envió el email porque el cliente ${pedido.cotizacion.cliente.nombre} no tiene correo registrado.`);
      }
    }

    revalidatePath("/pedidos");
    revalidatePath(`/pedidos/${pedidoId}`);
    return { 
      success: true, 
      message: `Estado actualizado a ${estadoNuevo.replace("_", " ")}` 
    };

  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return { success: false, message: "Error al cambiar el estado del pedido" };
  }
}
