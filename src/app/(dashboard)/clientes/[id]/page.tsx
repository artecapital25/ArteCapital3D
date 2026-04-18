import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ClienteDetalleClient from "./ClienteDetalle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      cotizaciones: {
        orderBy: { fecha: "desc" },
        take: 20,
        select: {
          id: true,
          numeroCot: true,
          item: true,
          valorTotal: true,
          estado: true,
          fecha: true,
        },
      },
    },
  });

  if (!cliente) {
    notFound();
  }

  return (
    <ClienteDetalleClient
      cliente={{
        id: cliente.id,
        codigo: cliente.codigo,
        nombre: cliente.nombre,
        nit: cliente.nit,
        telefono: cliente.telefono,
        correo: cliente.correo,
        informacion: cliente.informacion,
      }}
      cotizaciones={cliente.cotizaciones.map((c) => ({
        id: c.id,
        numeroCot: c.numeroCot,
        item: c.item,
        valorTotal: c.valorTotal,
        estado: c.estado,
        fecha: c.fecha.toISOString(),
      }))}
    />
  );
}
