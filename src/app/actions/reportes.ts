"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function generarDatosReporte(fechaInicio: string, fechaFin: string) {
  await requireAuth();

  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  end.setHours(23, 59, 59, 999); // End of day

  // Get Cotizaciones (Sales/Income perspective)
  const cotizaciones = await prisma.cotizacion.findMany({
    where: {
      createdAt: { gte: start, lte: end }
    },
    include: {
      cliente: { select: { nombre: true, nit: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  // Get Ordenes Compra (Purchases/Expense perspective)
  const ordenesCompra = await prisma.ordenCompra.findMany({
    where: {
      createdAt: { gte: start, lte: end }
    },
    include: {
      items: true
    },
    orderBy: { createdAt: "asc" }
  });

  // Get Insumos catalog to map names
  const insumos = await prisma.insumo.findMany({ select: { id: true, nombre: true } });
  const insumoMap = new Map(insumos.map(i => [i.id, i.nombre]));

  // Format Cotizaciones
  const cotsFormatted = cotizaciones.map(c => ({
    "Número": c.numeroCot,
    "Fecha": c.createdAt.toISOString().split("T")[0],
    "Cliente": c.cliente.nombre,
    "NIT": c.cliente.nit || "N/A",
    "Item Impreso": c.item,
    "Cantidad": c.cantidad,
    "Costo Base calcul.": c.costoBase,
    "Valor Cobrado (Total)": c.valorTotal,
    "Estado": c.estado.toUpperCase()
  }));

  // Format Expenses
  const gastosFormatted = ordenesCompra.map(oc => ({
    "Número OC": oc.numeroOrden,
    "Fecha": oc.createdAt.toISOString().split("T")[0],
    "Proveedor": oc.proveedor,
    "Items (Resumen)": oc.items.map(i => `${i.cantidad}x ${insumoMap.get(i.insumoId) || i.insumoId}`).join(" | "),
    "Gasto Total": oc.total,
    "Estado": oc.estado.toUpperCase()
  }));

  return { success: true, cotizaciones: cotsFormatted, gastos: gastosFormatted };
}
