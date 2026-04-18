"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { editarCliente, eliminarCliente } from "@/app/actions/clientes";

interface ClienteData {
  id: string;
  codigo: string;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  correo: string | null;
  informacion: string | null;
}

interface CotizacionResumen {
  id: string;
  numeroCot: string;
  item: string;
  valorTotal: number;
  estado: string;
  fecha: string;
}

export default function ClienteDetalleClient({
  cliente,
  cotizaciones,
}: {
  cliente: ClienteData;
  cotizaciones: CotizacionResumen[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    const formData = new FormData(e.currentTarget);
    const result = await editarCliente(cliente.id, formData);

    if (result.success) {
      setToast({ type: "success", msg: result.message || "Actualizado" });
      router.refresh();
    } else {
      if (result.errors) setErrors(result.errors);
      if (result.message) setGeneralError(result.message);
    }
    setLoading(false);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await eliminarCliente(cliente.id);
    if (result.success) {
      router.push("/clientes");
      router.refresh();
    } else {
      setToast({ type: "error", msg: result.message || "Error" });
      setShowDelete(false);
      setDeleting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const estadoColors: Record<string, { bg: string; text: string }> = {
    pendiente: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
    aceptado: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
    rechazado: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  };

  return (
    <div>
      {toast && (
        <div
          className={`toast animate-fade-in toast-${toast.type}`}
          onClick={() => setToast(null)}
        >
          {toast.msg}
        </div>
      )}

      <Link href="/clientes" className="back-link">
        <ArrowLeft size={16} />
        Volver a clientes
      </Link>

      <div className="header-row">
        <div>
          <h1 className="page-title">{cliente.nombre}</h1>
          <p className="page-subtitle">
            <span className="code-tag">{cliente.codigo}</span>
            {cliente.nit && ` · NIT: ${cliente.nit}`}
          </p>
        </div>
        <button
          type="button"
          className="btn-danger-outline"
          onClick={() => setShowDelete(true)}
        >
          Eliminar cliente
        </button>
      </div>

      {/* Edit form */}
      <div className="form-card">
        <h2 className="section-title">Información del cliente</h2>

        {generalError && (
          <div className="form-general-error animate-fade-in">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="Código"
              name="codigo"
              defaultValue={cliente.codigo}
              required
              error={errors.codigo}
            />
            <FormField
              label="Nombre"
              name="nombre"
              defaultValue={cliente.nombre}
              required
              error={errors.nombre}
            />
            <FormField
              label="NIT"
              name="nit"
              defaultValue={cliente.nit || ""}
              error={errors.nit}
            />
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              defaultValue={cliente.telefono || ""}
              error={errors.telefono}
            />
            <FormField
              label="Correo electrónico"
              name="correo"
              type="email"
              defaultValue={cliente.correo || ""}
              error={errors.correo}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <FormField
              label="Información adicional"
              name="informacion"
              type="textarea"
              defaultValue={cliente.informacion || ""}
              error={errors.informacion}
            />
          </div>

          <div className="form-actions">
            <SubmitButton
              loading={loading}
              text="Guardar cambios"
              loadingText="Guardando..."
              fullWidth={false}
            />
          </div>
        </form>
      </div>

      {/* Cotizaciones history */}
      <div className="history-card">
        <h2 className="section-title">
          Historial de cotizaciones
          <span className="history-count">{cotizaciones.length}</span>
        </h2>

        {cotizaciones.length === 0 ? (
          <p className="empty-text">
            Este cliente no tiene cotizaciones todavía
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th># Cotización</th>
                  <th>Item</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((cot) => {
                  const colors =
                    estadoColors[cot.estado] || estadoColors.pendiente;
                  return (
                    <tr key={cot.id}>
                      <td className="font-mono">{cot.numeroCot}</td>
                      <td>{cot.item}</td>
                      <td className="font-mono">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(cot.valorTotal)}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: colors.bg,
                            color: colors.text,
                          }}
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

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar al cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`}
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
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1rem;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--accent-primary);
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
        .code-tag {
          font-family: "JetBrains Mono", monospace;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8125rem;
        }
        .btn-danger-outline {
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #ef4444;
          font-size: 0.8125rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        .form-card,
        .history-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          max-width: 720px;
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .history-count {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .history-card {
          max-width: 100%;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        .form-actions {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }
        .form-general-error {
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 0.875rem;
          margin-bottom: 1rem;
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
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .font-mono {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.8125rem;
        }
        .text-muted {
          color: var(--text-muted);
        }
        .badge {
          display: inline-flex;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .empty-text {
          color: var(--text-muted);
          font-size: 0.875rem;
          text-align: center;
          padding: 2rem 0;
        }
      `}</style>
    </div>
  );
}
