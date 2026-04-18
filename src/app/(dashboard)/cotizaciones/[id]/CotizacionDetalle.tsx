"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  Truck,
  DollarSign,
  Zap,
  Droplets,
  Package,
} from "lucide-react";
import { cambiarEstadoCotizacion } from "@/app/actions/cotizaciones";
import { formatearMoneda, formatearTiempo } from "@/lib/calculos";
import FormularioCotizacion from "../nueva/FormularioCotizacion";

interface CotizacionData {
  id: string;
  numeroCot: string;
  clienteId: string;
  maquinaId: string | null;
  resinaId: string | null;
  item: string;
  descripcion: string | null;
  cantidad: number;
  tiempoImpresion: number;
  tiempoDesarrollo: number;
  tiempoArmado: number;
  tiempoPintura: number;
  volumenPieza: number | null;
  costoEnergia: number;
  costoResina: number;
  costoManoObra: number;
  costoInsumos: number;
  costoBase: number;
  porcentajeGanancia: number;
  valorUnidad: number;
  valorTotal: number;
  estado: string;
  fecha: string;
  cliente: { id: string; nombre: string; codigo: string };
  maquina: {
    id: string;
    nombre: string;
    tipo: string;
    valorMinuto: number;
    consumoEnergia: number;
  } | null;
  resina: {
    id: string;
    tipo: string;
    marca: string;
    color: string;
    densidad: number;
    valorGramo: number;
  } | null;
  pedido: {
    id: string;
    numeroPedido: string;
    estado: string;
  } | null;
}

interface Props {
  cotizacion: CotizacionData;
  clientes: { id: string; nombre: string; codigo: string }[];
  maquinas: {
    id: string;
    nombre: string;
    tipo: string;
    valorMinuto: number;
    consumoEnergia: number;
  }[];
  resinas: {
    id: string;
    tipo: string;
    marca: string;
    color: string;
    densidad: number;
    valorGramo: number;
  }[];
  personal: {
    id: string;
    nombre: string;
    valorMinuto: number;
    valorHora: number;
  }[];
}

const estadoConfig: Record<
  string,
  { label: string; bg: string; text: string; borderColor: string }
> = {
  pendiente: {
    label: "Pendiente",
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  aceptado: {
    label: "Aceptado",
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#22c55e",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  rechazado: {
    label: "Rechazado",
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#ef4444",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
};

export default function CotizacionDetalle({
  cotizacion,
  clientes,
  maquinas,
  resinas,
  personal,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const est = estadoConfig[cotizacion.estado] || estadoConfig.pendiente;
  const hasPedido = !!cotizacion.pedido;

  const handleEstadoChange = async (nuevoEstado: string) => {
    const result = await cambiarEstadoCotizacion(cotizacion.id, nuevoEstado);
    if (result.success) {
      setToast({ type: "success", msg: result.message || "Estado actualizado" });
      router.refresh();
    } else {
      setToast({ type: "error", msg: result.message || "Error" });
    }
    setTimeout(() => setToast(null), 4000);
  };

  if (mode === "edit") {
    return (
      <FormularioCotizacion
        clientes={clientes}
        maquinas={maquinas}
        resinas={resinas}
        personal={personal}
        cotizacion={cotizacion}
      />
    );
  }

  return (
    <>
      {toast && (
        <div
          className={`toast animate-fade-in toast-${toast.type}`}
          onClick={() => setToast(null)}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="det-header">
        <div className="header-left">
          <Link href="/cotizaciones" className="back-btn">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="header-top-row">
              <h1 className="det-title">{cotizacion.numeroCot}</h1>
              <span
                className="estado-badge"
                style={{
                  background: est.bg,
                  color: est.text,
                  border: `1px solid ${est.borderColor}`,
                }}
              >
                {est.label}
              </span>
            </div>
            <p className="det-subtitle">
              {cotizacion.cliente.codigo} — {cotizacion.cliente.nombre} ·{" "}
              {new Date(cotizacion.fecha).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* PDF download */}
          <a
            href={`/api/cotizaciones/${cotizacion.id}/pdf?tipo=cot`}
            target="_blank"
            rel="noopener"
            className="action-btn-lg"
          >
            <Download size={16} /> PDF COT
          </a>
          <a
            href={`/api/cotizaciones/${cotizacion.id}/pdf?tipo=cc`}
            target="_blank"
            rel="noopener"
            className="action-btn-lg action-secondary"
          >
            <FileText size={16} /> PDF CC
          </a>

          {/* Edit */}
          {!hasPedido && (
            <button
              className="action-btn-lg action-edit"
              onClick={() => setMode("edit")}
            >
              <Edit2 size={16} /> Editar
            </button>
          )}

          {/* Status actions */}
          {cotizacion.estado === "pendiente" && (
            <>
              <button
                className="action-btn-lg action-accept"
                onClick={() => handleEstadoChange("aceptado")}
              >
                <CheckCircle size={16} /> Aceptar
              </button>
              <button
                className="action-btn-lg action-reject"
                onClick={() => handleEstadoChange("rechazado")}
              >
                <XCircle size={16} /> Rechazar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="det-grid">
        {/* Left: Details */}
        <div className="det-section">
          <h3 className="sec-title">Información del producto</h3>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Item</span>
              <span className="info-value">{cotizacion.item}</span>
            </div>
            {cotizacion.descripcion && (
              <div className="info-row">
                <span className="info-label">Descripción</span>
                <span className="info-value">{cotizacion.descripcion}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Cantidad</span>
              <span className="info-value">{cotizacion.cantidad} unidad(es)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Máquina</span>
              <span className="info-value">
                {cotizacion.maquina
                  ? `${cotizacion.maquina.nombre} (${cotizacion.maquina.tipo})`
                  : "—"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Resina</span>
              <span className="info-value">
                {cotizacion.resina
                  ? `${cotizacion.resina.tipo} — ${cotizacion.resina.marca} (${cotizacion.resina.color})`
                  : "—"}
              </span>
            </div>
            {cotizacion.volumenPieza && (
              <div className="info-row">
                <span className="info-label">Volumen pieza</span>
                <span className="info-value">{cotizacion.volumenPieza} cm³</span>
              </div>
            )}
          </div>

          <h3 className="sec-title" style={{ marginTop: "1.5rem" }}>Tiempos</h3>
          <div className="times-grid">
            <div className="time-card">
              <span className="time-label">Impresión</span>
              <span className="time-value">
                {formatearTiempo(cotizacion.tiempoImpresion)}
              </span>
            </div>
            <div className="time-card">
              <span className="time-label">Desarrollo</span>
              <span className="time-value">
                {formatearTiempo(cotizacion.tiempoDesarrollo)}
              </span>
            </div>
            <div className="time-card">
              <span className="time-label">Armado</span>
              <span className="time-value">
                {formatearTiempo(cotizacion.tiempoArmado)}
              </span>
            </div>
            <div className="time-card">
              <span className="time-label">Pintura</span>
              <span className="time-value">
                {formatearTiempo(cotizacion.tiempoPintura)}
              </span>
            </div>
          </div>

          {/* Pedido info */}
          {hasPedido && cotizacion.pedido && (
            <div className="pedido-banner">
              <Truck size={18} />
              <div>
                <strong>Pedido #{cotizacion.pedido.numeroPedido}</strong>
                <span>Estado: {cotizacion.pedido.estado}</span>
              </div>
              <Link href={`/pedidos/${cotizacion.pedido.id}`} className="pedido-link">
                Ver pedido →
              </Link>
            </div>
          )}
        </div>

        {/* Right: Costs */}
        <div className="cost-card">
          <h3 className="sec-title">
            <DollarSign size={16} />
            Desglose de costos
          </h3>
          <div className="cost-rows">
            <div className="cost-row">
              <span className="cost-label"><Zap size={14} /> Energía</span>
              <span className="cost-val">{formatearMoneda(cotizacion.costoEnergia)}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label"><Droplets size={14} /> Resina</span>
              <span className="cost-val">{formatearMoneda(cotizacion.costoResina)}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label"><Clock size={14} /> Mano de obra</span>
              <span className="cost-val">{formatearMoneda(cotizacion.costoManoObra)}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label"><Package size={14} /> Insumos extra</span>
              <span className="cost-val">{formatearMoneda(cotizacion.costoInsumos)}</span>
            </div>
            <div className="cost-divider" />
            <div className="cost-row">
              <span className="cost-label bold">Costo base</span>
              <span className="cost-val">{formatearMoneda(cotizacion.costoBase)}</span>
            </div>
            <div className="cost-row accent">
              <span className="cost-label">Ganancia ({cotizacion.porcentajeGanancia}%)</span>
              <span className="cost-val">
                +{formatearMoneda(cotizacion.valorUnidad - cotizacion.costoBase)}
              </span>
            </div>
            <div className="cost-divider" />
            <div className="cost-row highlight">
              <span className="cost-label bold">Valor unitario</span>
              <span className="cost-val bold">{formatearMoneda(cotizacion.valorUnidad)}</span>
            </div>
            {cotizacion.cantidad > 1 && (
              <div className="cost-row total-row">
                <span className="cost-label bold">
                  Total ({cotizacion.cantidad} uds.)
                </span>
                <span className="cost-val bold">{formatearMoneda(cotizacion.valorTotal)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .toast {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 200;
          padding: 0.75rem 1.25rem; border-radius: var(--radius-md);
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          box-shadow: var(--shadow-lg);
        }
        .toast-success {
          background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #22c55e;
        }
        .toast-error {
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444;
        }
        .det-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
        }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .back-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          background: var(--bg-card); border: 1px solid var(--border-color);
          color: var(--text-secondary); text-decoration: none; transition: all 0.15s;
        }
        .back-btn:hover { color: var(--text-primary); background: var(--bg-card-hover); }
        .header-top-row { display: flex; align-items: center; gap: 0.75rem; }
        .det-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; font-family: 'JetBrains Mono', monospace; }
        .det-subtitle { color: var(--text-secondary); font-size: 0.8125rem; margin-top: 0.125rem; }
        .estado-badge {
          padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem;
          font-weight: 600; text-transform: capitalize;
        }
        .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .action-btn-lg {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.5rem 0.875rem; border-radius: var(--radius-md);
          font-size: 0.8125rem; font-weight: 600; border: none; cursor: pointer;
          text-decoration: none; transition: all 0.15s; font-family: inherit;
          background: rgba(0,180,216,0.1); color: #00b4d8;
        }
        .action-btn-lg:hover { background: rgba(0,180,216,0.2); }
        .action-secondary { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .action-secondary:hover { background: rgba(139,92,246,0.2); }
        .action-edit { background: rgba(99,102,241,0.1); color: #6366f1; }
        .action-edit:hover { background: rgba(99,102,241,0.2); }
        .action-accept { background: rgba(34,197,94,0.1); color: #22c55e; }
        .action-accept:hover { background: rgba(34,197,94,0.2); }
        .action-reject { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .action-reject:hover { background: rgba(245,158,11,0.2); }

        .det-grid {
          display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start;
        }
        @media (max-width: 1100px) { .det-grid { grid-template-columns: 1fr; } }

        .det-section {
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-lg); padding: 1.5rem;
        }
        .sec-title {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; font-weight: 700; color: var(--accent-primary);
          margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .info-rows { display: flex; flex-direction: column; gap: 0.75rem; }
        .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.25rem 0; }
        .info-label { font-size: 0.8125rem; color: var(--text-muted); }
        .info-value { font-size: 0.875rem; font-weight: 500; text-align: right; max-width: 60%; }

        .times-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
        @media (max-width: 640px) { .times-grid { grid-template-columns: 1fr 1fr; } }
        .time-card {
          background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: var(--radius-md); padding: 0.75rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
        }
        .time-label { font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .time-value { font-size: 0.9375rem; font-weight: 700; }

        .pedido-banner {
          display: flex; align-items: center; gap: 0.75rem;
          margin-top: 1.5rem; padding: 1rem;
          background: rgba(0,180,216,0.08); border: 1px solid rgba(0,180,216,0.2);
          border-radius: var(--radius-md); color: var(--accent-primary);
        }
        .pedido-banner div { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
        .pedido-banner span { font-size: 0.75rem; color: var(--text-secondary); }
        .pedido-link {
          color: var(--accent-primary); text-decoration: none; font-weight: 600; font-size: 0.8125rem;
        }
        .pedido-link:hover { text-decoration: underline; }

        .cost-card {
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-lg); padding: 1.5rem; background-image: var(--gradient-card);
          position: sticky; top: 80px;
        }
        .cost-rows { display: flex; flex-direction: column; gap: 0.625rem; }
        .cost-row { display: flex; justify-content: space-between; align-items: center; padding: 0.375rem 0; }
        .cost-label { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8125rem; }
        .cost-val { font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; color: var(--text-primary); }
        .cost-row.accent .cost-val { color: var(--accent-success); }
        .cost-row.highlight {
          background: rgba(0,180,216,0.08); border-radius: var(--radius-sm);
          padding: 0.625rem 0.75rem; margin: 0 -0.75rem;
        }
        .cost-row.highlight .cost-val { color: var(--accent-primary); font-size: 1.125rem; }
        .cost-row.total-row {
          background: var(--gradient-primary); border-radius: var(--radius-sm);
          padding: 0.75rem; margin: 0.25rem -0.75rem 0;
        }
        .cost-row.total-row .cost-label { color: rgba(255,255,255,0.85); }
        .cost-row.total-row .cost-val { color: white; font-size: 1.25rem; }
        .bold { font-weight: 700; }
        .cost-divider { height: 1px; background: var(--border-color); margin: 0.25rem 0; }
      `}</style>
    </>
  );
}
