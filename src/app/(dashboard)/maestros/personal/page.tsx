export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import PersonalClient from "./PersonalClient";

export default async function PersonalPage() {
  const personal = await prisma.personal.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PersonalClient personal={personal} />;
}
