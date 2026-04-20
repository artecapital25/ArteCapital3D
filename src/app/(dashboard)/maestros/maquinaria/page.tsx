export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import MaquinariaClient from "./MaquinariaClient";

export default async function MaquinariaPage() {
  const maquinas = await prisma.maquina.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <MaquinariaClient maquinas={maquinas} />;
}
