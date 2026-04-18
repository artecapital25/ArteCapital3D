import prisma from "@/lib/prisma";
import FormularioCotizacion from "./FormularioCotizacion";

export default async function NuevaCotizacionPage() {
  // Cargar datos maestros para los selects
  const [clientes, maquinas, resinas, personal] = await Promise.all([
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
  ]);

  return (
    <FormularioCotizacion
      clientes={clientes}
      maquinas={maquinas}
      resinas={resinas}
      personal={personal}
    />
  );
}
