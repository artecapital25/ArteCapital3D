export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { DollarSign, PackageOpen, TrendingUp, AlertTriangle } from "lucide-react";
import GraficosRendimiento from "@/components/dashboard/GraficosRendimiento";
import ListasRecientes from "@/components/dashboard/ListasRecientes";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  // 1. Concurrent Fetching of Data
  const [
    cotizacionesMensuales,
    pedidosActivosCount,
    ingresosLatentesData,
    insumosNivelBajo,
    cotizacionesGeneral
  ] = await Promise.all([
    // Cotizaciones creadas este mes
    prisma.cotizacion.count({
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
      }
    }),

    // Pedidos activos (Todo lo que no es ENTREGADO o CANCELADO)
    prisma.pedido.count({
      where: {
        estado: { notIn: ["ENTREGADO", "CANCELADO"] }
      }
    }),

    // Ingresos Latentes (Suma del valorTotal de las cotizaciones aceptadas en proceso que aún no finalizan, o simplemente todas las pendientes + en proceso)
    prisma.pedido.findMany({
      where: { estado: { notIn: ["ENTREGADO", "CANCELADO"] } },
      include: { cotizacion: { select: { valorTotal: true } } }
    }),

    // Insumos con stock por debajo del mínimo dictado o igual a 0
    prisma.insumo.findMany({
      where: {
        OR: [
          { stock: { lte: 0 } },
          // Esto es Prisma native comparison, pero Prisma no supporta comparar campos a menos que usemos RAW o filter. 
          // Para evadir validación compleja, traeremos todo lo menor a un número prudencial o validaremos en memoria, o pedimos que solo traiga los obvios.
        ]
      }, // Extraremos en memoria por compatibilidad de Prisma con lte/gte campos si fuera complejo
      select: { id: true, nombre: true, stock: true, stockMinimo: true }
    }),
    
    // Todos los historiales para la gráfica (últimos 6 meses)
    prisma.cotizacion.findMany({
      where: { createdAt: { gte: subMonths(new Date(), 5) } },
      select: { estado: true, createdAt: true, valorTotal: true }
    })
  ]);

  // Ingreso Calculado (Dinero flotante proyectado activo)
  const ingresoLatente = ingresosLatentesData.reduce((acc, current) => acc + current.cotizacion.valorTotal, 0);

  // Insumos con bajo stock validados en memoria (ya que Prisma require extensions para columnas dinámicas en el where)
  // Optimizamos extrayendo todos para validar memoria de los específicos si la red es pequeña (Como es un inventory admin local es factible)
  const inventarioBruto = await prisma.insumo.findMany({ select: { id: true, nombre: true, stock: true, stockMinimo: true }});
  const alertasInventario = inventarioBruto.filter(ins => ins.stock <= ins.stockMinimo).slice(0, 7);

  // ===================================
  // DATA PARSING PARA GRAFICOS RECHARTS
  // ===================================

  // 1. Gráfica de Barras: Evolución por Mes
  // Agrupar por mes { nombreMes: string, creadas: num, ganadas: num }
  const mesesHistorial: Record<string, { creadas: number; ganadas: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const nombre = format(d, "MMM", { locale: es }).toUpperCase();
    mesesHistorial[nombre] = { creadas: 0, ganadas: 0 };
  }

  cotizacionesGeneral.forEach(cot => {
    const key = format(new Date(cot.createdAt), "MMM", { locale: es }).toUpperCase();
    if (mesesHistorial[key]) {
      mesesHistorial[key].creadas += 1;
      if (cot.estado === "aceptado") {
        mesesHistorial[key].ganadas += 1;
      }
    }
  });

  const chartDataBarras = Object.entries(mesesHistorial).map(([name, vals]) => ({
    name,
    creadas: vals.creadas,
    ganadas: vals.ganadas
  }));

  // 2. Gráfico Circular: Distribución real de estados de pedidos
  const pedidosAgroup = await prisma.pedido.groupBy({
    by: ['estado'],
    _count: { estado: true }
  });

  // Fetch recent data lists for right column shortcuts
  const [ultimosPedidos, ultimasCots] = await Promise.all([
    prisma.pedido.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cotizacion: { select: { item: true, cliente: { select: { nombre: true } } } } }
    }),
    prisma.cotizacion.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cliente: { select: { nombre: true } } }
    })
  ]);

  // Formatter local 
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* HEADER PAGE */}
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">Visión General</h1>
        <p className="text-sm text-gray-400">Resumen y estado general del negocio y operaciones en curso.</p>
      </div>

      {/* KPIS DE IMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingreso Latente */}
        <div className="bg-[#0e0e1a]/80 border border-[#00b4d8]/20 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00b4d8]/10 blur-3xl rounded-full" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Ingresos Proyectados</p>
              <h3 className="text-2xl font-bold text-white font-mono">{formatter.format(ingresoLatente)}</h3>
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
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Pedidos Activos</p>
              <h3 className="text-2xl font-bold text-white font-mono">{pedidosActivosCount}</h3>
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
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Cots. del Mes</p>
              <h3 className="text-2xl font-bold text-white font-mono">{cotizacionesMensuales}</h3>
            </div>
            <div className="p-2 bg-violet-500/10 rounded-lg shrink-0">
              <TrendingUp size={20} className="text-violet-500" />
            </div>
          </div>
          <p className="text-xs text-violet-400 font-medium">{format(new Date(), "MMMM", { locale: es }).toUpperCase()}</p>
        </div>

        {/* KPI 4: Alertas Stock */}
        <div className="bg-[#0e0e1a]/80 border border-amber-500/20 p-5 rounded-xl shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Alertas Insumos</p>
              <h3 className="text-2xl font-bold text-white font-mono">{alertasInventario.length}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
          </div>
          {alertasInventario.length > 0 ? (
            <p className="text-xs text-amber-500 font-medium">Stock bajo detectado</p>
          ) : (
             <p className="text-xs text-gray-500 font-medium">Inventario sano</p>
          )}
        </div>

      </div>

      {/* DASHBOARD GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <GraficosRendimiento lineData={chartDataBarras} pieData={pedidosAgroup} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ListasRecientes 
             alertas={alertasInventario} 
             ultimosPedidos={ultimosPedidos.map(p => ({
               id: p.id, num: p.numeroPedido, item: p.cotizacion.item, cliente: p.cotizacion.cliente.nombre, fecha: p.createdAt.toISOString()
             }))} 
             ultimasCots={ultimasCots.map(c => ({
               id: c.id, num: c.numeroCot, item: c.item, cliente: c.cliente.nombre, fecha: c.createdAt.toISOString()
             }))} 
           />
        </div>
      </div>
    </div>
  );
}
