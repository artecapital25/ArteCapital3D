"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Download,
} from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  eliminarCotizacion,
  cambiarEstadoCotizacion,
} from "@/app/actions/cotizaciones";
import { formatearMoneda } from "@/lib/calculos";

interface CotizacionRow {
  id: string;
  numeroCot: string;
  item: string;
  descripcion: string | null;
  cantidad: number;
  valorUnidad: number;
  valorTotal: number;
  estado: string;
  fecha: string;
  cliente: { id: string; nombre: string; codigo: string };
  pedido: { id: string } | null;
}

const estadoConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pendiente: {
    label: "Pendiente",
    bg: "rgba(245, 158, 11, 0.15)",
    text: "#f59e0b",
    icon: <Clock size={12} />,
  },
  aceptado: {
    label: "Aceptado",
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#22c55e",
    icon: <CheckCircle size={12} />,
  },
  rechazado: {
    label: "Rechazado",
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#ef4444",
    icon: <XCircle size={12} />,
  },
};

type FilterTab = "todos" | "pendiente" | "aceptado" | "rechazado";

export default function CotizacionesTable({
  cotizaciones,
  query,
}: {
  cotizaciones: CotizacionRow[];
  query: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [deleteTarget, setDeleteTarget] = useState<CotizacionRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = useMemo(() => {
    if (activeTab === "todos") return cotizaciones;
    return cotizaciones.filter((c) => c.estado === activeTab);
  }, [cotizaciones, activeTab]);

  const counts = useMemo(() => {
    const map = { todos: cotizaciones.length, pendiente: 0, aceptado: 0, rechazado: 0 };
    cotizaciones.forEach((c) => {
      if (c.estado in map) map[c.estado as keyof typeof map]++;
    });
    return map;
  }, [cotizaciones]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await eliminarCotizacion(deleteTarget.id);
    setDeleting(false);

    if (result.success) {
      showToast("success", result.message || "Eliminado");
      setDeleteTarget(null);
      router.refresh();
    } else {
      showToast("error", result.message || "Error");
      setDeleteTarget(null);
    }
  };

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    const result = await cambiarEstadoCotizacion(id, nuevoEstado);
    if (result.success) {
      showToast("success", result.message || "Estado actualizado");
      router.refresh();
    } else {
      showToast("error", result.message || "Error");
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "aceptado", label: "Aceptados" },
    { key: "rechazado", label: "Rechazados" },
  ];

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`toast animate-fade-in toast-${toast.type}`}
          onClick={() => setToast(null)}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-subtitle">
            Gestión de cotizaciones y cálculo de costos ·{" "}
            <span className="page-count">{cotizaciones.length} registros</span>
          </p>
        </div>
        <Link href="/cotizaciones/nueva" className="btn-primary">
          <Plus size={16} />
          Nueva cotización
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <SearchBar placeholder="Buscar por número, cliente o item..." />
      </div>

      {/* Table */}
      <div className="table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} strokeWidth={1} />
            <p>No se encontraron cotizaciones</p>
            <Link href="/cotizaciones/nueva" className="empty-link">
              Crear primera cotización
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th># Cotización</th>
                  <th>Cliente</th>
                  <th>Item</th>
                  <th>Cant.</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ width: "130px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cot) => {
                  const est = estadoConfig[cot.estado] || estadoConfig.pendiente;
                  return (
                    <tr key={cot.id}>
                      <td className="font-mono">{cot.numeroCot}</td>
                      <td className="font-medium">{cot.cliente.nombre}</td>
                      <td className="text-ellipsis" title={cot.item}>
                        {cot.item}
                      </td>
                      <td className="text-center">{cot.cantidad}</td>
                      <td className="font-mono">
                        {formatearMoneda(cot.valorUnidad)}
                      </td>
                      <td className="font-mono font-medium">
                        {formatearMoneda(cot.valorTotal)}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: est.bg, color: est.text }}
                        >
                          {est.icon}
                          {est.label}
                        </span>
                      </td>
                      <td className="text-secondary">
                        {new Date(cot.fecha).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            href={`/cotizaciones/${cot.id}`}
                            className="action-btn action-edit"
                            title="Ver / Editar"
                          >
                            <Edit2 size={14} />
                          </Link>

                          {/* PDF download */}
                          <a
                            href={`/api/cotizaciones/${cot.id}/pdf?tipo=cot`}
                            target="_blank"
                            rel="noopener"
                            className="action-btn action-pdf"
                            title="Descargar PDF"
                          >
                            <Download size={14} />
                          </a>

                          {/* Estado actions */}
                          {cot.estado === "pendiente" && (
                            <>
                              <button
                                type="button"
                                className="action-btn action-accept"
                                title="Aceptar"
                                onClick={() =>
                                  handleEstadoChange(cot.id, "aceptado")
                                }
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-btn action-reject"
                                title="Rechazar"
                                onClick={() =>
                                  handleEstadoChange(cot.id, "rechazado")
                                }
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}

                          {/* Delete */}
                          {!cot.pedido && (
                            <button
                              type="button"
                              className="action-btn action-delete"
                              title="Eliminar"
                              onClick={() => setDeleteTarget(cot)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`¿Eliminar cotización "${deleteTarget?.numeroCot}"? Esta acción no se puede deshacer.`}
        loading={deleting}
      />

      <style jsx>{`
        .toast {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 200;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
        }
        .toast-success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }
        .toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .page-count {
          color: var(--accent-primary);
          font-weight: 600;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--gradient-primary);
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3);
        }

        /* Tabs */
        .tabs-row {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 0.25rem;
          border: 1px solid var(--border-color);
          overflow-x: auto;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s;
          white-space: nowrap;
          font-family: inherit;
        }
        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        .tab-active {
          background: var(--bg-card) !important;
          color: var(--accent-primary) !important;
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }
        .tab-count {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 700;
        }
        .tab-active .tab-count {
          background: rgba(0, 180, 216, 0.15);
          color: var(--accent-primary);
        }

        .search-wrapper {
          margin-bottom: 1rem;
        }
        .table-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .table-scroll {
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
        }
        .data-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .font-mono {
          font-family: "JetBrains Mono", "Fira Code", monospace;
          font-size: 0.8125rem;
        }
        .font-medium {
          font-weight: 500;
        }
        .text-secondary {
          color: var(--text-secondary);
        }
        .text-center {
          text-align: center;
        }
        .text-ellipsis {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .action-buttons {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .action-edit {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }
        .action-edit:hover {
          background: rgba(99, 102, 241, 0.2);
        }
        .action-pdf {
          background: rgba(0, 180, 216, 0.1);
          color: #00b4d8;
        }
        .action-pdf:hover {
          background: rgba(0, 180, 216, 0.2);
        }
        .action-accept {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }
        .action-accept:hover {
          background: rgba(34, 197, 94, 0.2);
        }
        .action-reject {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        .action-reject:hover {
          background: rgba(245, 158, 11, 0.2);
        }
        .action-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .action-delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .empty-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
