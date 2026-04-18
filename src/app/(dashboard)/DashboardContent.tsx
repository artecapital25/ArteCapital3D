"use client";

import {
  Users,
  FileText,
  Truck,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { formatearMoneda } from "@/lib/calculos";

interface DashboardContentProps {
  stats: {
    totalClientes: number;
    totalCotizaciones: number;
    cotizacionesMes: number;
    totalPedidos: number;
    valorEnProceso: number;
    insumosStockBajo: number;
  };
  cotizacionesRecientes: {
    id: string;
    numeroCot: string;
    cliente: string;
    item: string;
    valorTotal: number;
    estado: string;
    fecha: string;
  }[];
}

const estadoColors: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  aceptado: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
  rechazado: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
};

export function DashboardContent({
  stats,
  cotizacionesRecientes,
}: DashboardContentProps) {
  const kpis = [
    {
      label: "Clientes",
      value: stats.totalClientes,
      icon: <Users size={22} />,
      color: "#6366f1",
      gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
    },
    {
      label: "Cotizaciones del mes",
      value: stats.cotizacionesMes,
      icon: <FileText size={22} />,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))",
    },
    {
      label: "Pedidos activos",
      value: stats.totalPedidos,
      icon: <Truck size={22} />,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))",
    },
    {
      label: "Valor en proceso",
      value: formatearMoneda(stats.valorEnProceso),
      icon: <DollarSign size={22} />,
      color: "#22c55e",
      gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
    },
    {
      label: "Insumos stock bajo",
      value: stats.insumosStockBajo,
      icon: <AlertTriangle size={22} />,
      color: stats.insumosStockBajo > 0 ? "#f59e0b" : "#22c55e",
      gradient:
        stats.insumosStockBajo > 0
          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))"
          : "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
    },
    {
      label: "Total cotizaciones",
      value: stats.totalCotizaciones,
      icon: <TrendingUp size={22} />,
      color: "#ec4899",
      gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Resumen general de tu negocio de impresión 3D
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`kpi-card animate-fade-in stagger-${i + 1}`}
            style={{ background: kpi.gradient }}
          >
            <div className="kpi-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <div className="section-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="section-header">
          <h2 className="section-title">Últimas cotizaciones</h2>
          <a href="/cotizaciones" className="section-link">
            Ver todas <ArrowUpRight size={14} />
          </a>
        </div>

        {cotizacionesRecientes.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} strokeWidth={1} />
            <p>No hay cotizaciones todavía</p>
            <a href="/cotizaciones/nueva" className="empty-action">
              Crear primera cotización
            </a>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th># Cotización</th>
                  <th>Cliente</th>
                  <th>Item</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesRecientes.map((cot) => {
                  const colors = estadoColors[cot.estado] || estadoColors.pendiente;
                  return (
                    <tr key={cot.id}>
                      <td className="font-mono">{cot.numeroCot}</td>
                      <td>{cot.cliente}</td>
                      <td className="text-ellipsis">{cot.item}</td>
                      <td className="font-mono">{formatearMoneda(cot.valorTotal)}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {cot.estado}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(cot.fecha).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          margin-bottom: 0.5rem;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
        }

        .kpi-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          opacity: 0;
        }

        .kpi-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }

        .kpi-info {
          display: flex;
          flex-direction: column;
        }

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .kpi-label {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-top: 0.125rem;
        }

        /* Section Card */
        .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          opacity: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .section-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .section-link:hover {
          color: var(--accent-primary-hover);
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .data-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(42, 42, 74, 0.5);
          color: var(--text-secondary);
        }

        .data-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-primary);
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .font-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.8125rem;
        }

        .text-ellipsis {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .text-muted {
          color: var(--text-muted);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          gap: 0.75rem;
        }

        .empty-action {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .empty-action:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
