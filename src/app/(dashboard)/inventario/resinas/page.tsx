import prisma from "@/lib/prisma";
import ResinasClient from "./ResinasClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function InventarioResinasPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const resinas = await prisma.resina.findMany({
    where: query
      ? {
          OR: [
            { tipo: { contains: query, mode: "insensitive" } },
            { marca: { contains: query, mode: "insensitive" } },
            { color: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return <ResinasClient resinas={resinas} />;
}
