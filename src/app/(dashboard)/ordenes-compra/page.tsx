export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import OrdenesTable from "./OrdenesTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function OrdenesCompraPage() {
  const ordenes = await prisma.ordenCompra.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });

  // Serialize dates
  const serialized = ordenes.map(oc => ({
    id: oc.id,
    numeroOrden: oc.numeroOrden,
    proveedor: oc.proveedor,
    estado: oc.estado,
    total: oc.total,
    itemsCount: oc._count.items,
    fechaCreacion: oc.fechaCreacion.toISOString(),
    fechaRecepcion: oc.fechaRecepcion?.toISOString() || null
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">Órdenes de Compra</h1>
          <p className="text-sm text-gray-400">Gestiona reabastecimiento e ingresa inventario</p>
        </div>
        <Link href="/ordenes-compra/nueva" className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Nueva Orden
        </Link>
      </div>

      <div className="bg-[#0e0e1a]/80 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
        <OrdenesTable ordenes={serialized} />
      </div>
    </div>
  );
}
