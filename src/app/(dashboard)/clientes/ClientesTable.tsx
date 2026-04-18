"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { eliminarCliente } from "@/app/actions/clientes";
import { formatearMoneda } from "@/lib/calculos";

interface ClienteRow {
  id: string;
  codigo: string;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  correo: string | null;
  _count: { cotizaciones: number };
}

export default function ClientesTable({
  clientes,
}: {
  clientes: ClienteRow[];
}) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ClienteRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await eliminarCliente(deleteTarget.id);
    setDeleting(false);

    if (result.success) {
      setToast({ type: "success", msg: result.message || "Eliminado" });
      setDeleteTarget(null);
      router.refresh();
    } else {
      setToast({ type: "error", msg: result.message || "Error" });
      setDeleteTarget(null);
    }

    setTimeout(() => setToast(null), 4000);
  };

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
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">
            Gestiona tu cartera de clientes ·{" "}
            <span className="page-count">{clientes.length} registros</span>
          </p>
        </div>
        <Link href="/clientes/nuevo" className="btn-primary">
          <Plus size={16} />
          Nuevo cliente
        </Link>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <SearchBar placeholder="Buscar por nombre, código o NIT..." />
      </div>

      {/* Table */}
      <div className="table-card">
        {clientes.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron clientes</p>
            <Link href="/clientes/nuevo" className="empty-link">
              Crear el primer cliente
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>NIT</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Cotiz.</th>
                  <th style={{ width: "80px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono">{c.codigo}</td>
                    <td className="font-medium">{c.nombre}</td>
                    <td className="text-secondary">{c.nit || "—"}</td>
                    <td className="text-secondary">{c.telefono || "—"}</td>
                    <td className="text-secondary">{c.correo || "—"}</td>
                    <td>
                      <span className="badge badge-info">
                        {c._count.cotizaciones}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          href={`/clientes/${c.id}`}
                          className="action-btn action-edit"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          className="action-btn action-delete"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        message={`¿Estás seguro de eliminar al cliente "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
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
        .badge {
          display: inline-flex;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-info {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }
        .action-buttons {
          display: flex;
          gap: 0.375rem;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
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
