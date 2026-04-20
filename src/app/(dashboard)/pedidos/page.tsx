export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import KanbanPedidos from "./KanbanPedidos";
import { EstadoPedido } from "@prisma/client";

export default async function PedidosPage() {
  // Obtener todos los pedidos que no estén cancelados por defecto en el kanban
  const pedidos = await prisma.pedido.findMany({
    where: {
      estado: {
        not: "CANCELADO",
      },
    },
    include: {
      cotizacion: {
        select: {
          item: true,
          valorTotal: true,
          fecha: true,
          cliente: {
            select: {
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  // Serializar fechas
  const serialized = pedidos.map((p) => ({
    id: p.id,
    numeroPedido: p.numeroPedido,
    estado: p.estado as string,
    fechaCreacion: p.fechaCreacion.toISOString(),
    fechaEntrega: p.fechaEntrega?.toISOString() || null,
    item: p.cotizacion.item,
    valorTotal: p.cotizacion.valorTotal,
    clienteNombre: p.cotizacion.cliente.nombre,
  }));

  return <KanbanPedidos pedidosInit={serialized} />;
}
