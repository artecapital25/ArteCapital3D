"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { actualizarEstadoPedido } from "@/app/actions/pedidos";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatearMoneda } from "@/lib/calculos";

export interface CompPedido {
  id: string;
  numeroPedido: string;
  estado: string;
  fechaCreacion: string;
  fechaEntrega: string | null;
  item: string;
  valorTotal: number;
  clienteNombre: string;
}

const COLUMNS = [
  { id: "APROBADO", label: "Aprobado / Fila", bgClass: "col-aprobado" },
  { id: "EN_PROCESO", label: "En Proceso (Imprimiendo)", bgClass: "col-proceso" },
  { id: "EN_ENVIO", label: "En Envío / Ruta", bgClass: "col-envio" },
  { id: "ENTREGADO", label: "Entregado (Finalizado)", bgClass: "col-entregado" },
];

export default function KanbanPedidos({ pedidosInit }: { pedidosInit: CompPedido[] }) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(pedidosInit);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  
  // Dialog para cambios que ameriten nota (opcional, por ahora lo enviaremos directo via FormData)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setTargetStatus(statusId);
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    setTargetStatus(null);
    const pedidoId = e.dataTransfer.getData("text/plain");
    
    if (!pedidoId) return;

    const currentPedido = pedidos.find(p => p.id === pedidoId);
    if (!currentPedido || currentPedido.estado === nuevoEstado) {
      setDraggingId(null);
      return;
    }

    // Optimistic UI Update
    const previousState = [...pedidos];
    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)
    );
    setDraggingId(null);

    // Form data para la Action
    const formData = new FormData();
    formData.append("estado", nuevoEstado);

    // Call Server Action
    const result = await actualizarEstadoPedido(pedidoId, formData);
    
    if (result.success) {
      showToast("success", result.message || "Estado actualizado");
      router.refresh();
    } else {
      // Revert optimistic update
      setPedidos(previousState);
      showToast("error", result.errors?.estado || result.message || "Error al actualizar");
    }
  };

  return (
    <>
      {toast && (
        <div className={`toast animate-fade-in toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Flujo de Producción (Pedidos)</h1>
          <p className="page-subtitle">Arrastra las tarjetas para cambiar su estado. Los cambios registrarán el historial y notificarán al cliente en envíos.</p>
        </div>
      </div>

      {/* Tabla Kanban */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const pedEnCol = pedidos.filter((p) => p.estado === col.id);
          const isTarget = targetStatus === col.id;

          return (
            <div 
              key={col.id} 
              className={`kanban-column ${col.bgClass} ${isTarget ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setTargetStatus(null)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="kanban-col-header">
                <h3>{col.label}</h3>
                <span className="badge-count">{pedEnCol.length}</span>
              </div>
              
              <div className="kanban-cards">
                {pedEnCol.length === 0 ? (
                  <div className="kanban-empty">Sin pedidos aquí</div>
                ) : (
                  pedEnCol.map(ped => (
                    <div 
                      key={ped.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ped.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className={`kanban-card ${draggingId === ped.id ? 'is-dragging' : ''}`}
                    >
                      <div className="card-top">
                        <span className="pedido-num">{ped.numeroPedido}</span>
                        <Link href={`/pedidos/${ped.id}`} className="view-link">Ver</Link>
                      </div>
                      <h4 className="pedido-item">{ped.item}</h4>
                      <div className="pedido-cliente">
                        <Package size={12} /> {ped.clienteNombre}
                      </div>

                      <div className="card-bottom">
                        <div className="pedido-fecha" title="Fecha de Creación">
                          <Clock size={12} /> 
                          {format(new Date(ped.fechaCreacion), "dd MMM", { locale: es })}
                        </div>
                        <div className="pedido-total">
                          {formatearMoneda(ped.valorTotal)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 200;
          padding: 0.75rem 1.25rem; border-radius: var(--radius-md);
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          box-shadow: var(--shadow-lg);
        }
        .toast-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; }
        .toast-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }

        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .page-subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem; max-width: 600px; line-height: 1.5; }

        .kanban-board {
          display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 2rem;
          min-height: calc(100vh - 200px);
          align-items: flex-start;
        }

        .kanban-column {
          flex: 0 0 320px;
          border-radius: var(--radius-lg);
          background: rgba(14, 14, 26, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          max-height: 100%;
          transition: all 0.2s;
        }

        .drag-over {
          border-color: var(--accent-primary);
          background: rgba(0, 180, 216, 0.05);
          box-shadow: 0 0 0 2px rgba(0, 180, 216, 0.2);
        }

        .kanban-col-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .kanban-col-header h3 {
          font-size: 0.8125rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-primary); margin: 0;
        }

        .badge-count {
          background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 99px;
          font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
        }

        /* Column Specific colors */
        .col-aprobado .kanban-col-header h3 { color: #8b5cf6; } /* Violeta */
        .col-proceso .kanban-col-header h3 { color: #f59e0b; } /* Naranja */
        .col-envio .kanban-col-header h3 { color: #00b4d8; }   /* Cyan ArteCapital */
        .col-entregado .kanban-col-header h3 { color: #22c55e; } /* Verde */

        .kanban-cards {
          padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;
          overflow-y: auto; flex: 1; min-height: 120px;
        }

        .kanban-empty {
          padding: 2rem 1rem; text-align: center; color: var(--text-muted);
          font-size: 0.8125rem; font-style: italic; border: 2px dashed rgba(255,255,255,0.05);
          border-radius: var(--radius-md);
        }

        .kanban-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem; cursor: grab;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        
        .kanban-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .kanban-card:active { cursor: grabbing; transform: scale(0.98); }
        .is-dragging { opacity: 0.5; }

        .card-top {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;
        }
        .pedido-num {
          font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
          font-weight: 600; color: var(--text-secondary);
          background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;
        }
        .view-link {
          font-size: 0.75rem; color: var(--accent-primary); text-decoration: none; font-weight: 500;
        }
        .view-link:hover { text-decoration: underline; }

        .pedido-item {
          font-size: 0.9375rem; font-weight: 600; color: var(--text-primary);
          margin: 0 0 0.5rem 0; line-height: 1.3;
        }
        .pedido-cliente {
          display: flex; align-items: center; gap: 0.375rem;
          font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;
        }

        .card-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .pedido-fecha {
          display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--text-secondary);
        }
        .pedido-total {
          font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; font-weight: 700; color: var(--text-primary);
        }

        @media (max-width: 1024px) {
          .kanban-board { padding-bottom: 1rem; }
          .kanban-column { flex: 0 0 280px; }
        }
      `}</style>
    </>
  );
}
