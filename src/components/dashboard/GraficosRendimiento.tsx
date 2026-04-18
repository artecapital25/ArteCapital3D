"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GraficosRendimientoProps {
  lineData: { name: string; creadas: number; ganadas: number }[];
  pieData: { estado: string; _count: { estado: number } }[];
}

const COLORS = {
  COTIZADO: '#64748b',
  APROBADO: '#8b5cf6',
  EN_PROCESO: '#f59e0b',
  EN_ENVIO: '#00b4d8',
  ENTREGADO: '#22c55e',
  CANCELADO: '#ef4444'
};

export default function GraficosRendimiento({ lineData, pieData }: GraficosRendimientoProps) {

  const parsedPieData = pieData.map(p => ({
    name: p.estado.replace("_", " "),
    value: p._count.estado,
    color: COLORS[p.estado as keyof typeof COLORS] || '#475569'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Gráfico 1: Barras */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 p-5 rounded-xl shadow-lg backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Evolución de Cotizaciones</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={lineData}
              margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="creadas" name="Emitidas" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ganadas" name="Aprobadas (Ganadas)" fill="#00b4d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Torta */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 p-5 rounded-xl shadow-lg backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Distribución de Operaciones</h3>
        <div className="h-[300px] w-full">
          {parsedPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={parsedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const mid = midAngle || 0;
                    const x = cx + radius * Math.cos(-mid * RADIAN);
                    const y = cy + radius * Math.sin(-mid * RADIAN);
                    return (
                      <text x={x} y={y} fill="#f8fafc" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
                        {`${name} (${value})`}
                      </text>
                    );
                  }}
                  labelLine={true}
                >
                  {parsedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-500 italic border border-dashed border-gray-700/50 rounded-lg">
              No hay pedidos en la base de datos
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
