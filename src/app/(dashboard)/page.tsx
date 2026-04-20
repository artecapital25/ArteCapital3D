export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { DollarSign, PackageOpen, TrendingUp, AlertTriangle } from "lucide-react";
import GraficosRendimiento from "@/components/dashboard/GraficosRendimiento";
import ListasRecientes from "@/components/dashboard/ListasRecientes";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Fallback seguro para cuando la BD falla
const emptyDashboard = {
  cotizacionesMensuales: 0,
  pedidosActivosCount: 0,
  ingresoLatente: 0,
  alertasInventario: [] as { id: string; nombre: string; stock: number; stockMinimo: number }[],
  chartDataBarras: [] as { name: string; creadas: number; ganadas: number }[],
  pedidosAgroup: [] as { estado: string; _count: { estado: number } }[],
  ultimosPedidos: [] as { id: string; num: string; item: string; cliente: string; fecha: string }[],
  ultimasCots: [] as { id: string; num: string; item: string; cliente: string; fecha: string }[],
};

async function getDashboardData() {
  try {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const [
      cotizacionesMensuales,
      pedidosActivosCount,
      ingresosLatentesData,
      inventarioBruto,
      cotizacionesGeneral,
      pedidosAgroup,
      ultimosPedidos,
      ultimasCots,
    ] = await Promise.all([
      prisma.cotizacion.count({
        where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      }),
      prisma.pedido.count({
        where: { estado: { notIn: ["ENTREGADO", "CANCELADO"] } },
      }),
      prisma.pedido.findMany({
        where: { estado: { notIn: ["ENTREGADO", "CANCELADO"] } },
        include: { cotizacion: { select: { valorTotal: true } } },
      }),
      prisma.insumo.findMany({
        select: { id: true, nombre: true, stock: true, stockMinimo: true },
      }),
      prisma.cotizacion.findMany({
        where: { createdAt: { gte: subMonths(new Date(), 5) } },
        select: { estado: true, createdAt: true, valorTotal: true },
      }),
      prisma.pedido.groupBy({
        by: ["estado"],
        _count: { estado: true },
      }),
      prisma.pedido.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          cotizacion: { select: { item: true, cliente: { select: { nombre: true } } } },
        },
      }),
      prisma.cotizacion.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { cliente: { select: { nombre: true } } },
      }),
    ]);

    const ingresoLatente = ingresosLatentesData.reduce(
      (acc, p) => acc + p.cotizacion.valorTotal,
      0
    );

    const alertasInventario = inventarioBruto
      .filter((ins) => ins.stock <= ins.stockMinimo)
      .slice(0, 7);

    // Gráfica por meses
    const mesesHistorial: Record<string, { creadas: number; ganadas: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const nombre = format(d, "MMM", { locale: es }).toUpperCase();
      mesesHistorial[nombre] = { creadas: 0, ganadas: 0 };
    }
    cotizacionesGeneral.forEach((cot) => {
      const key = format(new Date(cot.createdAt), "MMM", { locale: es }).toUpperCase();
      if (mesesHistorial[key]) {
        mesesHistorial[key].creadas += 1;
        if (cot.estado === "aceptado") mesesHistorial[key].ganadas += 1;
      }
    });
    const chartDataBarras = Object.entries(mesesHistorial).map(([name, vals]) => ({
      name,
      creadas: vals.creadas,
      ganadas: vals.ganadas,
    }));

    return {
      cotizacionesMensuales,
      pedidosActivosCount,
      ingresoLatente,
      alertasInventario,
      chartDataBarras,
      pedidosAgroup,
      ultimosPedidos: ultimosPedidos.map((p) => ({
        id: p.id,
        num: p.numeroPedido,
        item: p.cotizacion.item,
        cliente: p.cotizacion.cliente.nombre,
        fecha: p.createdAt.toISOString(),
      })),
      ultimasCots: ultimasCots.map((c) => ({
        id: c.id,
        num: c.numeroCot,
        item: c.item,
        cliente: c.cliente.nombre,
        fecha: c.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    // Log en Vercel Function Logs sin exponer detalles al cliente
    console.error("[Dashboard] Error al cargar datos:", error);
    return emptyDashboard;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
          Visión General
        </h1>
        <p className="text-sm text-gray-400">
          Resumen y estado general del negocio y operaciones en curso.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingreso Latente */}
        <div className="bg-[#0e0e1a]/80 border border-[#00b4d8]/20 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00b4d8]/10 blur-3xl rounded-full" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Ingresos Proyectados
              </p>
              <h3 className="text-2xl font-bold text-white font-mono">
                {formatter.format(data.ingresoLatente)}
              </h3>
            </div>
            <div className="p-2 bg-[#00b4d8]/10 rounded-lg shrink-0">
              <DollarSign size={20} className="text-[#00b4d8]" />
            </div>
          </div>
          <p className="text-xs text-[#00b4d8] font-medium">+ Órdenes finalizando</p>
        </div>

        {/* KPI 2: Pedidos Activos */}
        <div className="bg-[#0e0e1a]/80 border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Pedidos Activos
              </p>
              <h3 className="text-2xl font-bold text-white font-mono">
                {data.pedidosActivosCount}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
              <PackageOpen size={20} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-emerald-500 font-medium">Trabajo por despachar</p>
        </div>

        {/* KPI 3: Cotizaciones mes */}
        <div className="bg-[#0e0e1a]/80 border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Cots. del Mes
              </p>
              <h3 className="text-2xl font-bold text-white font-mono">
                {data.cotizacionesMensuales}
              </h3>
            </div>
            <div className="p-2 bg-violet-500/10 rounded-lg shrink-0">
              <TrendingUp size={20} className="text-violet-500" />
            </div>
          </div>
          <p className="text-xs text-violet-400 font-medium">
            {format(new Date(), "MMMM", { locale: es }).toUpperCase()}
          </p>
        </div>

        {/* KPI 4: Alertas Stock */}
        <div className="bg-[#0e0e1a]/80 border border-amber-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Alertas Insumos
              </p>
              <h3 className="text-2xl font-bold text-white font-mono">
                {data.alertasInventario.length}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
          </div>
          {data.alertasInventario.length > 0 ? (
            <p className="text-xs text-amber-500 font-medium">Stock bajo detectado</p>
          ) : (
            <p className="text-xs text-gray-500 font-medium">Inventario sano</p>
          )}
        </div>
      </div>

      {/* GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <GraficosRendimiento
            lineData={data.chartDataBarras}
            pieData={data.pedidosAgroup}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ListasRecientes
            alertas={data.alertasInventario}
            ultimosPedidos={data.ultimosPedidos}
            ultimasCots={data.ultimasCots}
          />
        </div>
      </div>
    </div>
  );
}
