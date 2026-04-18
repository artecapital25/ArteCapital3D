import prisma from "@/lib/prisma";
import ClientesTable from "./ClientesTable";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const clientes = await prisma.cliente.findMany({
    where: query
      ? {
          OR: [
            { nombre: { contains: query, mode: "insensitive" } },
            { codigo: { contains: query, mode: "insensitive" } },
            { nit: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cotizaciones: true } },
    },
  });

  return <ClientesTable clientes={clientes} />;
}
