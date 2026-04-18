"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { cotizacionSchema, parseFormData } from "@/lib/validations";
import { calcularCotizacion } from "@/lib/calculos";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: { id: string };
};

export async function generarNumeroCotizacion(): Promise<string> {
  await requireAuth();

  const year = new Date().getFullYear();
  const prefix = `COT-${year}-`;

  const ultima = await prisma.cotizacion.findFirst({
    where: { numeroCot: { startsWith: prefix } },
    orderBy: { numeroCot: "desc" },
  });

  if (!ultima) return `${prefix}001`;

  const numStr = ultima.numeroCot.replace(prefix, "");
  const num = parseInt(numStr, 10);
  return `${prefix}${String(num + 1).padStart(3, "0")}`;
}

export async function crearCotizacion(
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const parsed = parseFormData(cotizacionSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  try {
    // Cargar datos maestros para el cálculo
    const [maquina, resina, personal] = await Promise.all([
      data.maquinaId
        ? prisma.maquina.findUnique({ where: { id: data.maquinaId } })
        : null,
      data.resinaId
        ? prisma.resina.findUnique({ where: { id: data.resinaId } })
        : null,
      data.personalId
        ? prisma.personal.findUnique({ where: { id: data.personalId } })
        : null,
    ]);

    // Calcular costos
    const resultado = calcularCotizacion({
      maquina: {
        valorMinuto: maquina?.valorMinuto ?? 0,
        consumoEnergia: maquina?.consumoEnergia ?? 0,
      },
      resina: {
        densidad: resina?.densidad ?? 0,
        valorGramo: resina?.valorGramo ?? 0,
      },
      personal: {
        valorMinuto: personal?.valorMinuto ?? 0,
      },
      tiempoImpresion: data.tiempoImpresion,
      tiempoDesarrollo: data.tiempoDesarrollo,
      tiempoArmado: data.tiempoArmado,
      tiempoPintura: data.tiempoPintura,
      volumenPieza: data.volumenPieza || 0,
      insumosExtra: data.insumosExtra,
      porcentajeGanancia: data.porcentajeGanancia,
      cantidad: data.cantidad,
    });

    const numeroCot = await generarNumeroCotizacion();

    const cotizacion = await prisma.cotizacion.create({
      data: {
        numeroCot,
        clienteId: data.clienteId,
        maquinaId: data.maquinaId || null,
        resinaId: data.resinaId || null,
        item: data.item,
        descripcion: data.descripcion || null,
        cantidad: data.cantidad,
        tiempoImpresion: data.tiempoImpresion,
        tiempoDesarrollo: data.tiempoDesarrollo,
        tiempoArmado: data.tiempoArmado,
        tiempoPintura: data.tiempoPintura,
        volumenPieza: data.volumenPieza || null,
        costoEnergia: resultado.costoEnergia,
        costoResina: resultado.costoResina,
        costoManoObra: resultado.costoManoObra,
        costoInsumos: resultado.costoInsumos,
        costoBase: resultado.costoBase,
        porcentajeGanancia: data.porcentajeGanancia,
        valorUnidad: resultado.valorUnidad,
        valorTotal: resultado.valorTotal,
        estado: "pendiente",
      },
    });

    revalidatePath("/cotizaciones");
    revalidatePath("/");
    return {
      success: true,
      message: `Cotización ${numeroCot} creada exitosamente`,
      data: { id: cotizacion.id },
    };
  } catch (error) {
    console.error("Error al crear cotización:", error);
    return { success: false, message: "Error al crear la cotización" };
  }
}

export async function editarCotizacion(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const parsed = parseFormData(cotizacionSchema, formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.errors };
  }

  const { data } = parsed;

  // Verificar que la cotización existe y no tiene pedido activo
  const existente = await prisma.cotizacion.findUnique({
    where: { id },
    include: { pedido: true },
  });

  if (!existente) {
    return { success: false, message: "Cotización no encontrada" };
  }

  if (existente.pedido) {
    return {
      success: false,
      message: "No se puede editar: esta cotización ya tiene un pedido asociado",
    };
  }

  try {
    // Recalcular costos
    const [maquina, resina, personal] = await Promise.all([
      data.maquinaId
        ? prisma.maquina.findUnique({ where: { id: data.maquinaId } })
        : null,
      data.resinaId
        ? prisma.resina.findUnique({ where: { id: data.resinaId } })
        : null,
      data.personalId
        ? prisma.personal.findUnique({ where: { id: data.personalId } })
        : null,
    ]);

    const resultado = calcularCotizacion({
      maquina: {
        valorMinuto: maquina?.valorMinuto ?? 0,
        consumoEnergia: maquina?.consumoEnergia ?? 0,
      },
      resina: {
        densidad: resina?.densidad ?? 0,
        valorGramo: resina?.valorGramo ?? 0,
      },
      personal: {
        valorMinuto: personal?.valorMinuto ?? 0,
      },
      tiempoImpresion: data.tiempoImpresion,
      tiempoDesarrollo: data.tiempoDesarrollo,
      tiempoArmado: data.tiempoArmado,
      tiempoPintura: data.tiempoPintura,
      volumenPieza: data.volumenPieza || 0,
      insumosExtra: data.insumosExtra,
      porcentajeGanancia: data.porcentajeGanancia,
      cantidad: data.cantidad,
    });

    await prisma.cotizacion.update({
      where: { id },
      data: {
        clienteId: data.clienteId,
        maquinaId: data.maquinaId || null,
        resinaId: data.resinaId || null,
        item: data.item,
        descripcion: data.descripcion || null,
        cantidad: data.cantidad,
        tiempoImpresion: data.tiempoImpresion,
        tiempoDesarrollo: data.tiempoDesarrollo,
        tiempoArmado: data.tiempoArmado,
        tiempoPintura: data.tiempoPintura,
        volumenPieza: data.volumenPieza || null,
        costoEnergia: resultado.costoEnergia,
        costoResina: resultado.costoResina,
        costoManoObra: resultado.costoManoObra,
        costoInsumos: resultado.costoInsumos,
        costoBase: resultado.costoBase,
        porcentajeGanancia: data.porcentajeGanancia,
        valorUnidad: resultado.valorUnidad,
        valorTotal: resultado.valorTotal,
      },
    });

    revalidatePath("/cotizaciones");
    revalidatePath(`/cotizaciones/${id}`);
    revalidatePath("/");
    return { success: true, message: "Cotización actualizada exitosamente" };
  } catch (error) {
    console.error("Error al editar cotización:", error);
    return { success: false, message: "Error al actualizar la cotización" };
  }
}

export async function eliminarCotizacion(
  id: string
): Promise<ActionResult> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  // Verificar que no tiene pedido asociado
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: { pedido: true },
  });

  if (!cotizacion) {
    return { success: false, message: "Cotización no encontrada" };
  }

  if (cotizacion.pedido) {
    return {
      success: false,
      message: "No se puede eliminar: tiene un pedido asociado",
    };
  }

  try {
    await prisma.cotizacion.delete({ where: { id } });
    revalidatePath("/cotizaciones");
    revalidatePath("/");
    return { success: true, message: "Cotización eliminada" };
  } catch {
    return { success: false, message: "Error al eliminar la cotización" };
  }
}

export async function cambiarEstadoCotizacion(
  id: string,
  nuevoEstado: string
): Promise<ActionResult> {
  await requireAuth();

  if (!id || typeof id !== "string") {
    return { success: false, message: "ID inválido" };
  }

  const estadosValidos = ["pendiente", "aceptado", "rechazado"];
  if (!estadosValidos.includes(nuevoEstado)) {
    return { success: false, message: "Estado inválido" };
  }

  try {
    await prisma.cotizacion.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    revalidatePath("/cotizaciones");
    revalidatePath(`/cotizaciones/${id}`);
    revalidatePath("/");
    return {
      success: true,
      message: `Estado cambiado a "${nuevoEstado}"`,
    };
  } catch {
    return { success: false, message: "Error al cambiar el estado" };
  }
}
