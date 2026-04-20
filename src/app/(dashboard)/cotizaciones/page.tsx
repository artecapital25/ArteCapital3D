import prisma from "@/lib/prisma";
import CotizacionesTable from "./CotizacionesTable";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function CotizacionesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const cotizaciones = await prisma.cotizacion.findMany({
    where: query
      ? {
          OR: [
            { numeroCot: { contains: query, mode: "insensitive" } },
            { item: { contains: query, mode: "insensitive" } },
            {
              cliente: {
                nombre: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : undefined,
    orderBy: { fecha: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true, codigo: true } },
      pedido: { select: { id: true } },
    },
  });

  const serialized = cotizaciones.map((c) => ({
    ...c,
    fecha: c.fecha.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <CotizacionesTable cotizaciones={serialized} query={query} />;
}
