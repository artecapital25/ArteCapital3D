"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SearchBar from "@/components/ui/SearchBar";
import {
  crearResina,
  editarResina,
  eliminarResina,
} from "@/app/actions/resinas";

interface ResinaRow {
  id: string;
  tipo: string;
  marca: string;
  color: string;
  volumenLitros: number;
  densidad: number;
  pesoGramos: number;
  valor: number;
  valorGramo: number;
  velocidadImpresion: number;
  resumen: string | null;
}

export default function ResinasClient({
  resinas,
}: {
  resinas: ResinaRow[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ResinaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResinaRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreate = () => {
    setEditTarget(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (r: ResinaRow) => {
    setEditTarget(r);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = editTarget
      ? await editarResina(editTarget.id, formData)
      : await crearResina(formData);

    if (result.success) {
      showToast("success", result.message || "Guardado");
      setShowModal(false);
      router.refresh();
    } else {
      if (result.errors) setErrors(result.errors);
      if (result.message) showToast("error", result.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await eliminarResina(deleteTarget.id);
    if (result.success) {
      showToast("success", result.message || "Eliminada");
      setDeleteTarget(null);
      router.refresh();
    } else {
      showToast("error", result.message || "Error");
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  return (
    <>
      {toast && (
        <div className={`toast animate-fade-in toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Resinas</h1>
          <p className="page-subtitle">
            Inventario de resinas para impresión 3D ·{" "}
            <span className="count">{resinas.length} tipos</span>
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva resina
        </button>
      </div>

      <div className="search-wrapper">
        <SearchBar placeholder="Buscar por tipo, marca o color..." />
      </div>

      <div className="table-card">
        {resinas.length === 0 ? (
          <div className="empty">No se encontraron resinas</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Color</th>
                  <th>Vol (L)</th>
                  <th>Densidad</th>
                  <th>Valor/g</th>
                  <th>Vel. Imp.</th>
                  <th style={{ width: "80px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resinas.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.tipo}</td>
                    <td className="text-secondary">{r.marca}</td>
                    <td className="text-secondary">{r.color}</td>
                    <td className="text-secondary">{r.volumenLitros}</td>
                    <td className="text-secondary">{r.densidad} g/cm³</td>
                    <td className="font-mono">${r.valorGramo.toFixed(2)}</td>
                    <td className="text-secondary">{r.velocidadImpresion} mm/h</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn action-edit" onClick={() => openEdit(r)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="action-btn action-delete" onClick={() => setDeleteTarget(r)} title="Eliminar">
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? "Editar resina" : "Nueva resina"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <FormField label="Tipo" name="tipo" required defaultValue={editTarget?.tipo} error={errors.tipo} placeholder="Standard, ABS-Like, Flexible..." />
            <FormField label="Marca" name="marca" required defaultValue={editTarget?.marca} error={errors.marca} placeholder="Elegoo, Siraya Tech..." />
            <FormField label="Color" name="color" required defaultValue={editTarget?.color} error={errors.color} placeholder="Gris, Negro, Transparente..." />
            <FormField label="Volumen (Litros)" name="volumenLitros" type="number" required defaultValue={editTarget?.volumenLitros} error={errors.volumenLitros} step="0.01" min="0" />
            <FormField label="Densidad (g/cm³)" name="densidad" type="number" required defaultValue={editTarget?.densidad} error={errors.densidad} step="0.01" min="0" />
            <FormField label="Peso (gramos)" name="pesoGramos" type="number" required defaultValue={editTarget?.pesoGramos} error={errors.pesoGramos} step="0.01" min="0" />
            <FormField label="Valor total ($)" name="valor" type="number" required defaultValue={editTarget?.valor} error={errors.valor} min="0" />
            <FormField label="Valor por gramo ($)" name="valorGramo" type="number" required defaultValue={editTarget?.valorGramo} error={errors.valorGramo} step="0.01" min="0" />
            <FormField label="Velocidad impresión (mm/h)" name="velocidadImpresion" type="number" required defaultValue={editTarget?.velocidadImpresion} error={errors.velocidadImpresion} min="0" />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <FormField label="Resumen" name="resumen" type="textarea" defaultValue={editTarget?.resumen || ""} error={errors.resumen} placeholder="Notas sobre la resina..." />
          </div>
          <div className="modal-actions">
            <SubmitButton loading={loading} text={editTarget ? "Guardar cambios" : "Crear resina"} loadingText="Guardando..." fullWidth={false} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`¿Eliminar la resina "${deleteTarget?.tipo} ${deleteTarget?.color} (${deleteTarget?.marca})"?`}
        loading={deleting}
      />

      <style jsx>{`
        .toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 200; padding: 0.75rem 1.25rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 500; cursor: pointer; box-shadow: var(--shadow-lg); }
        .toast-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; }
        .toast-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem; }
        .count { color: var(--accent-primary); font-weight: 600; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--gradient-primary); color: white; padding: 0.625rem 1.25rem; border-radius: var(--radius-md); border: none; font-weight: 600; font-size: 0.875rem; font-family: inherit; cursor: pointer; transition: all 0.15s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,180,216,0.3); }
        .search-wrapper { margin-bottom: 1rem; }
        .table-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
        .table-scroll { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
        .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(42,42,74,0.5); }
        .data-table tr:hover td { background: rgba(255,255,255,0.02); }
        .data-table tr:last-child td { border-bottom: none; }
        .font-medium { font-weight: 500; }
        .font-mono { font-family: "JetBrains Mono", monospace; font-size: 0.8125rem; }
        .text-secondary { color: var(--text-secondary); }
        .action-buttons { display: flex; gap: 0.375rem; }
        .action-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s; }
        .action-edit { background: rgba(99,102,241,0.1); color: #6366f1; }
        .action-edit:hover { background: rgba(99,102,241,0.2); }
        .action-delete { background: rgba(239,68,68,0.1); color: #ef4444; }
        .action-delete:hover { background: rgba(239,68,68,0.2); }
        .empty { padding: 3rem; text-align: center; color: var(--text-muted); }
        .modal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        @media (max-width: 640px) { .modal-grid { grid-template-columns: 1fr; } }
        .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
      `}</style>
    </>
  );
}
