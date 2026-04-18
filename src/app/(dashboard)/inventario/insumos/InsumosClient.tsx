"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, PackagePlus, ArrowUpDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SearchBar from "@/components/ui/SearchBar";
import {
  crearInsumo,
  editarInsumo,
  eliminarInsumo,
  actualizarStock,
} from "@/app/actions/insumos";

interface InsumoRow {
  id: string;
  codigoItem: string;
  nombre: string;
  marca: string | null;
  categoria: string | null;
  volumen: number | null;
  valor: number;
  valorUnidad: number;
  linkCompra: string | null;
  stock: number;
  stockMinimo: number;
}

export default function InsumosClient({
  insumos,
}: {
  insumos: InsumoRow[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editTarget, setEditTarget] = useState<InsumoRow | null>(null);
  const [stockTarget, setStockTarget] = useState<InsumoRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InsumoRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreate = () => { setEditTarget(null); setErrors({}); setShowModal(true); };
  const openEdit = (i: InsumoRow) => { setEditTarget(i); setErrors({}); setShowModal(true); };
  const openStock = (i: InsumoRow) => { setStockTarget(i); setErrors({}); setShowStockModal(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const result = editTarget ? await editarInsumo(editTarget.id, formData) : await crearInsumo(formData);
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

  const handleStockUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stockTarget) return;
    setLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const result = await actualizarStock(stockTarget.id, formData);
    if (result.success) {
      showToast("success", result.message || "Stock actualizado");
      setShowStockModal(false);
      setStockTarget(null);
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
    const result = await eliminarInsumo(deleteTarget.id);
    if (result.success) {
      showToast("success", result.message || "Eliminado");
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
        <div className={`toast animate-fade-in toast-${toast.type}`} onClick={() => setToast(null)}>{toast.msg}</div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Insumos</h1>
          <p className="page-subtitle">Control de inventario · <span className="count">{insumos.length} items</span></p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo insumo
        </button>
      </div>

      <div className="search-wrapper">
        <SearchBar placeholder="Buscar por nombre, código o categoría..." />
      </div>

      <div className="table-card">
        {insumos.length === 0 ? (
          <div className="empty">No se encontraron insumos</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Valor</th>
                  <th>Stock</th>
                  <th>Mín.</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((ins) => {
                  const stockBajo = ins.stock <= ins.stockMinimo;
                  return (
                    <tr key={ins.id}>
                      <td className="font-mono">{ins.codigoItem}</td>
                      <td className="font-medium">{ins.nombre}</td>
                      <td className="text-secondary">{ins.marca || "—"}</td>
                      <td className="text-secondary">{ins.categoria || "—"}</td>
                      <td className="font-mono">${ins.valor.toLocaleString("es-CO")}</td>
                      <td>
                        <span className={`stock-badge ${stockBajo ? "stock-low" : "stock-ok"}`}>
                          {ins.stock}
                          {stockBajo && " ⚠"}
                        </span>
                      </td>
                      <td className="text-muted">{ins.stockMinimo}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn action-stock" onClick={() => openStock(ins)} title="Registrar movimiento">
                            <ArrowUpDown size={14} />
                          </button>
                          <button className="action-btn action-edit" onClick={() => openEdit(ins)} title="Editar">
                            <Edit2 size={14} />
                          </button>
                          <button className="action-btn action-delete" onClick={() => setDeleteTarget(ins)} title="Eliminar">
                            <Trash2 size={14} />
                          </button>
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? "Editar insumo" : "Nuevo insumo"} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <FormField label="Código" name="codigoItem" required defaultValue={editTarget?.codigoItem} error={errors.codigoItem} placeholder="INS-005" />
            <FormField label="Nombre" name="nombre" required defaultValue={editTarget?.nombre} error={errors.nombre} placeholder="Nombre del insumo" />
            <FormField label="Marca" name="marca" defaultValue={editTarget?.marca || ""} error={errors.marca} />
            <FormField label="Categoría" name="categoria" defaultValue={editTarget?.categoria || ""} error={errors.categoria} placeholder="Limpieza, Seguridad..." />
            <FormField label="Volumen" name="volumen" type="number" defaultValue={editTarget?.volumen ?? ""} error={errors.volumen} step="0.01" min="0" />
            <FormField label="Valor total ($)" name="valor" type="number" required defaultValue={editTarget?.valor} error={errors.valor} min="0" />
            <FormField label="Valor por unidad ($)" name="valorUnidad" type="number" required defaultValue={editTarget?.valorUnidad} error={errors.valorUnidad} step="0.01" min="0" />
            <FormField label="Link de compra" name="linkCompra" type="url" defaultValue={editTarget?.linkCompra || ""} error={errors.linkCompra} placeholder="https://..." />
            <FormField label="Stock actual" name="stock" type="number" required defaultValue={editTarget?.stock ?? 0} error={errors.stock} min="0" />
            <FormField label="Stock mínimo" name="stockMinimo" type="number" required defaultValue={editTarget?.stockMinimo ?? 0} error={errors.stockMinimo} min="0" />
          </div>
          <div className="modal-actions">
            <SubmitButton loading={loading} text={editTarget ? "Guardar cambios" : "Crear insumo"} loadingText="Guardando..." fullWidth={false} />
          </div>
        </form>
      </Modal>

      {/* Stock Update Modal */}
      <Modal isOpen={showStockModal} onClose={() => { setShowStockModal(false); setStockTarget(null); }} title={`Movimiento de stock — ${stockTarget?.nombre || ""}`} size="sm">
        <form onSubmit={handleStockUpdate}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Stock actual: <strong style={{ color: "var(--text-primary)" }}>{stockTarget?.stock}</strong> unidades
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FormField
              label="Tipo de movimiento"
              name="tipo"
              type="select"
              required
              options={[
                { value: "entrada", label: "📥 Entrada (agregar)" },
                { value: "salida", label: "📤 Salida (retirar)" },
              ]}
              error={errors.tipo}
            />
            <FormField label="Cantidad" name="cantidad" type="number" required min="1" error={errors.cantidad} placeholder="1" />
          </div>
          <div className="modal-actions">
            <SubmitButton loading={loading} text="Aplicar movimiento" loadingText="Actualizando..." fullWidth={false} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`¿Eliminar el insumo "${deleteTarget?.nombre}" (${deleteTarget?.codigoItem})?`}
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
        .text-muted { color: var(--text-muted); }
        .stock-badge { display: inline-flex; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .stock-ok { background: rgba(34,197,94,0.15); color: #22c55e; }
        .stock-low { background: rgba(239,68,68,0.15); color: #ef4444; animation: pulse-stock 2s infinite; }
        @keyframes pulse-stock { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); } }
        .action-buttons { display: flex; gap: 0.375rem; }
        .action-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s; }
        .action-edit { background: rgba(99,102,241,0.1); color: #6366f1; }
        .action-edit:hover { background: rgba(99,102,241,0.2); }
        .action-delete { background: rgba(239,68,68,0.1); color: #ef4444; }
        .action-delete:hover { background: rgba(239,68,68,0.2); }
        .action-stock { background: rgba(34,197,94,0.1); color: #22c55e; }
        .action-stock:hover { background: rgba(34,197,94,0.2); }
        .empty { padding: 3rem; text-align: center; color: var(--text-muted); }
        .modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (max-width: 640px) { .modal-grid { grid-template-columns: 1fr; } }
        .modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
      `}</style>
    </>
  );
}
