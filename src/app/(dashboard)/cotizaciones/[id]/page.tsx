import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CotizacionDetalle from "./CotizacionDetalle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CotizacionDetallePage({ params }: PageProps) {
  const { id } = await params;

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nombre: true, codigo: true } },
      maquina: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          valorMinuto: true,
          consumoEnergia: true,
        },
      },
      resina: {
        select: {
          id: true,
          tipo: true,
          marca: true,
          color: true,
          densidad: true,
          valorGramo: true,
        },
      },
      pedido: { select: { id: true, numeroPedido: true, estado: true } },
      items: true,
    },
  });

  if (!cotizacion) notFound();

  // Load master data for edit mode selects
  const [clientes, maquinas, resinas, personal, insumos] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, codigo: true },
    }),
    prisma.maquina.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        valorMinuto: true,
        consumoEnergia: true,
      },
    }),
    prisma.resina.findMany({
      orderBy: { tipo: "asc" },
      select: {
        id: true,
        tipo: true,
        marca: true,
        color: true,
        densidad: true,
        valorGramo: true,
      },
    }),
    prisma.personal.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, valorMinuto: true, valorHora: true },
    }),
    prisma.insumo.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, codigoItem: true, nombre: true, valorUnidad: true },
    }),
  ]);

  return (
    <CotizacionDetalle
      cotizacion={{
        id: cotizacion.id,
        numeroCot: cotizacion.numeroCot,
        clienteId: cotizacion.clienteId,
        maquinaId: cotizacion.maquinaId,
        resinaId: cotizacion.resinaId,
        item: cotizacion.item,
        descripcion: cotizacion.descripcion,
        cantidad: cotizacion.cantidad,
        tiempoImpresion: cotizacion.tiempoImpresion,
        tiempoDesarrollo: cotizacion.tiempoDesarrollo,
        tiempoArmado: cotizacion.tiempoArmado,
        tiempoPintura: cotizacion.tiempoPintura,
        volumenPieza: cotizacion.volumenPieza,
        costoEnergia: cotizacion.costoEnergia,
        costoResina: cotizacion.costoResina,
        costoManoObra: cotizacion.costoManoObra,
        costoInsumos: cotizacion.costoInsumos,
        costoBase: cotizacion.costoBase,
        porcentajeGanancia: cotizacion.porcentajeGanancia,
        valorUnidad: cotizacion.valorUnidad,
        valorTotal: cotizacion.valorTotal,
        estado: cotizacion.estado,
        fecha: cotizacion.fecha.toISOString(),
        cliente: cotizacion.cliente,
        maquina: cotizacion.maquina,
        resina: cotizacion.resina,
        pedido: cotizacion.pedido,
        items: cotizacion.items,
      }}
      clientes={clientes}
      maquinas={maquinas}
      resinas={resinas}
      personal={personal}
      insumos={insumos}
    />
  );
}
