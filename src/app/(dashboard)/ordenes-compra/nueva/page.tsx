export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import FormularioOC from "./FormularioOC";

export default async function NuevaOrdenCompraPage() {
  const insumos = await prisma.insumo.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      codigoItem: true,
      nombre: true,
      marca: true,
      stock: true,
      stockMinimo: true,
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">Generar Orden</h1>
        <p className="text-sm text-gray-400">Selecciona el proveedor y los ítems a comprar</p>
      </div>

      <FormularioOC insumosDisponibles={insumos} />
    </div>
  );
}
