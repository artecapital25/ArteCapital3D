import prisma from "@/lib/prisma";
import InsumosClient from "./InsumosClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function InventarioInsumosPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const insumos = await prisma.insumo.findMany({
    where: query
      ? {
          OR: [
            { nombre: { contains: query, mode: "insensitive" } },
            { codigoItem: { contains: query, mode: "insensitive" } },
            { categoria: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return <InsumosClient insumos={insumos} />;
}
