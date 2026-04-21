"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  Zap,
  Droplets,
  Clock,
  Package,
  Percent,
  DollarSign,
} from "lucide-react";
import { crearCotizacion, editarCotizacion } from "@/app/actions/cotizaciones";
import { calcularCotizacion, formatearMoneda, formatearTiempo } from "@/lib/calculos";

interface Props {
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
  insumos: {
    id: string;
    codigoItem: string;
    nombre: string;
    valorUnidad: number;
  }[];
  // For edit mode
  cotizacion?: {
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
    costoInsumos: number;
    porcentajeGanancia: number;
    items?: any[];
  };
  personalSeleccionado?: string;
}

export default function FormularioCotizacion({
  clientes,
  maquinas,
  resinas,
  personal,
  insumos,
  cotizacion,
  personalSeleccionado,
}: Props) {
  const router = useRouter();
  const isEditing = !!cotizacion;

  // Form state
  const [clienteId, setClienteId] = useState(cotizacion?.clienteId || "");
  const [maquinaId, setMaquinaId] = useState(cotizacion?.maquinaId || "");
  const [resinaId, setResinaId] = useState(cotizacion?.resinaId || "");
  const [personalId, setPersonalId] = useState(personalSeleccionado || "");
  const [item, setItem] = useState(cotizacion?.item || "");
  const [descripcion, setDescripcion] = useState(cotizacion?.descripcion || "");
  const [cantidad, setCantidad] = useState(cotizacion?.cantidad || 1);
  const [tiempoImpresion, setTiempoImpresion] = useState(
    cotizacion?.tiempoImpresion || 0
  );
  const [tiempoDesarrollo, setTiempoDesarrollo] = useState(
    cotizacion?.tiempoDesarrollo || 0
  );
  const [tiempoArmado, setTiempoArmado] = useState(
    cotizacion?.tiempoArmado || 0
  );
  const [tiempoPintura, setTiempoPintura] = useState(
    cotizacion?.tiempoPintura || 0
  );
  const [volumenPieza, setVolumenPieza] = useState(
    cotizacion?.volumenPieza || 0
  );
  
  // Dynamic JSON Insumos State
  const [insumosList, setInsumosList] = useState<any[]>(cotizacion?.items || []);
  const [selectedInsumoId, setSelectedInsumoId] = useState("");
  const [selectedInsumoCantidad, setSelectedInsumoCantidad] = useState(1);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const [porcentajeGanancia, setPorcentajeGanancia] = useState(
    cotizacion?.porcentajeGanancia || 30
  );

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Selected master data
  const maquinaSeleccionada = maquinas.find((m) => m.id === maquinaId);
  const resinaSeleccionada = resinas.find((r) => r.id === resinaId);
  const personalSeleccionadoData = personal.find((p) => p.id === personalId);

  // Auto sum of selected insumos array
  const insumosExtra = useMemo(() => {
    return insumosList.reduce((acc, current) => acc + current.subtotal, 0);
  }, [insumosList]);

  const agregarInsumo = () => {
    const sum = insumos.find((i) => i.id === selectedInsumoId);
    if (!sum) return;
    if (selectedInsumoCantidad <= 0) return;
    const sub = sum.valorUnidad * selectedInsumoCantidad;

    setInsumosList([
      ...insumosList,
      {
        idUnico: Date.now(),
        insumoId: sum.id,
        nombre: sum.nombre,
        cantidad: selectedInsumoCantidad,
        valorUnidad: sum.valorUnidad,
        subtotal: sub,
        descripcion: `Fraccionado de ${sum.nombre}`,
      },
    ]);

    setSelectedInsumoId("");
    setSelectedInsumoCantidad(1);
  };

  // Real-time cost calculation
  const resultado = useMemo(() => {
    return calcularCotizacion({
      maquina: {
        valorMinuto: maquinaSeleccionada?.valorMinuto ?? 0,
        consumoEnergia: maquinaSeleccionada?.consumoEnergia ?? 0,
      },
      resina: {
        densidad: resinaSeleccionada?.densidad ?? 0,
        valorGramo: resinaSeleccionada?.valorGramo ?? 0,
      },
      personal: {
        valorMinuto: personalSeleccionadoData?.valorMinuto ?? 0,
      },
      tiempoImpresion,
      tiempoDesarrollo,
      tiempoArmado,
      tiempoPintura,
      volumenPieza,
      insumosExtra,
      porcentajeGanancia,
      cantidad,
    });
  }, [
    maquinaSeleccionada,
    resinaSeleccionada,
    personalSeleccionadoData,
    tiempoImpresion,
    tiempoDesarrollo,
    tiempoArmado,
    tiempoPintura,
    volumenPieza,
    insumosExtra,
    porcentajeGanancia,
    cantidad,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    // Add personalId as it's not a native form field we submit
    formData.set("personalId", personalId);

    let result;
    if (isEditing) {
      result = await editarCotizacion(cotizacion.id, formData);
    } else {
      result = await crearCotizacion(formData);
    }

    setSubmitting(false);

    if (result.success) {
      setToast({ type: "success", msg: result.message || "Guardado" });
      setTimeout(() => {
        if (result.data?.id) {
          router.push(`/cotizaciones/${result.data.id}`);
        } else {
          router.push("/cotizaciones");
        }
      }, 1000);
    } else if (result.errors) {
      setErrors(result.errors);
    } else {
      setToast({ type: "error", msg: result.message || "Error" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      {/* Toast */}
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
        <div className="header-left">
          <Link href="/cotizaciones" className="back-btn">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title">
              {isEditing
                ? `Editar ${cotizacion.numeroCot}`
                : "Nueva Cotización"}
            </h1>
            <p className="page-subtitle">
              {isEditing
                ? "Modifica los datos y recalcula los costos"
                : "Completa los datos para generar una cotización con cálculo automático"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-layout">
        {/* LEFT COLUMN - Form inputs */}
        <div className="form-column">
          {/* Cliente & Item */}
          <div className="form-section">
            <h3 className="section-label">
              <Package size={16} />
              Datos del producto
            </h3>

            <div className="field-grid">
              <div className="form-field span-2">
                <label>Cliente *</label>
                <select
                  name="clienteId"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.nombre}
                    </option>
                  ))}
                </select>
                {errors.clienteId && (
                  <span className="field-error">{errors.clienteId}</span>
                )}
              </div>

              <div className="form-field">
                <label>Item / Producto *</label>
                <input
                  type="text"
                  name="item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Ej: Figura decorativa"
                  required
                />
                {errors.item && (
                  <span className="field-error">{errors.item}</span>
                )}
              </div>

              <div className="form-field">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                />
              </div>

              <div className="form-field span-2">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles adicionales del producto..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="form-section">
            <h3 className="section-label">
              <Zap size={16} />
              Equipos y materiales
            </h3>

            <div className="field-grid">
              <div className="form-field">
                <label>Máquina</label>
                <select
                  name="maquinaId"
                  value={maquinaId}
                  onChange={(e) => setMaquinaId(e.target.value)}
                >
                  <option value="">Sin máquina</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({m.tipo})
                    </option>
                  ))}
                </select>
                {maquinaSeleccionada && (
                  <span className="field-hint">
                    {formatearMoneda(maquinaSeleccionada.valorMinuto)}/min ·{" "}
                    {maquinaSeleccionada.consumoEnergia} kW/h
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Resina</label>
                <select
                  name="resinaId"
                  value={resinaId}
                  onChange={(e) => setResinaId(e.target.value)}
                >
                  <option value="">Sin resina</option>
                  {resinas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.tipo} — {r.marca} ({r.color})
                    </option>
                  ))}
                </select>
                {resinaSeleccionada && (
                  <span className="field-hint">
                    Densidad: {resinaSeleccionada.densidad} g/cm³ ·{" "}
                    {formatearMoneda(resinaSeleccionada.valorGramo)}/g
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Personal</label>
                <select
                  value={personalId}
                  onChange={(e) => setPersonalId(e.target.value)}
                >
                  <option value="">Sin personal asignado</option>
                  {personal.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {personalSeleccionadoData && (
                  <span className="field-hint">
                    {formatearMoneda(personalSeleccionadoData.valorHora)}/hora ·{" "}
                    {formatearMoneda(personalSeleccionadoData.valorMinuto)}/min
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Volumen pieza (cm³)</label>
                <input
                  type="number"
                  name="volumenPieza"
                  value={volumenPieza}
                  onChange={(e) =>
                    setVolumenPieza(parseFloat(e.target.value) || 0)
                  }
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="form-section">
            <h3 className="section-label">
              <Clock size={16} />
              Tiempos (en minutos)
            </h3>

            <div className="field-grid grid-4">
              <div className="form-field">
                <label>Impresión</label>
                <input
                  type="number"
                  name="tiempoImpresion"
                  value={tiempoImpresion}
                  onChange={(e) =>
                    setTiempoImpresion(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.5"
                  placeholder="0"
                />
                {tiempoImpresion > 0 && (
                  <span className="field-hint">
                    {formatearTiempo(tiempoImpresion)}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Desarrollo</label>
                <input
                  type="number"
                  name="tiempoDesarrollo"
                  value={tiempoDesarrollo}
                  onChange={(e) =>
                    setTiempoDesarrollo(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.5"
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Armado</label>
                <input
                  type="number"
                  name="tiempoArmado"
                  value={tiempoArmado}
                  onChange={(e) =>
                    setTiempoArmado(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.5"
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Pintura</label>
                <input
                  type="number"
                  name="tiempoPintura"
                  value={tiempoPintura}
                  onChange={(e) =>
                    setTiempoPintura(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.5"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="form-section">
            <h3 className="section-label">
              <Percent size={16} />
              Costos adicionales
            </h3>

            <div className="field-grid">
              <div className="form-field span-2">
                <label>Insumos de Inventario</label>
                <div className="insumos-selector">
                  <select
                    value={selectedInsumoId}
                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                    style={{ flex: 2 }}
                  >
                    <option value="">Buscar insumo...</option>
                    {insumos.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.codigoItem} — {ins.nombre} ({formatearMoneda(ins.valorUnidad)}/u)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 0.10"
                    value={selectedInsumoCantidad}
                    onChange={(e) =>
                      setSelectedInsumoCantidad(parseFloat(e.target.value) || 0)
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-add-insumo"
                    onClick={agregarInsumo}
                  >
                    + Añadir
                  </button>
                </div>

                {insumosList.length > 0 && (
                  <div className="insumos-lista">
                    {insumosList.map((i, index) => (
                      <div key={i.idUnico || index} className="insumos-item">
                        <span>
                          {i.cantidad}x {i.nombre}
                        </span>
                        <span className="ins-sub">
                          {formatearMoneda(i.subtotal)}
                          <button
                            type="button"
                            onClick={() =>
                              setInsumosList(
                                insumosList.filter((_, idx) => idx !== index)
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="hidden"
                  name="insumosData"
                  value={JSON.stringify(insumosList)}
                />
              </div>

              <div className="form-field">
                <label>% Ganancia</label>
                <input
                  type="number"
                  name="porcentajeGanancia"
                  value={porcentajeGanancia}
                  onChange={(e) =>
                    setPorcentajeGanancia(parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  max={500}
                  step="1"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <Link href="/cotizaciones" className="btn-cancel">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || !clienteId || !item}
            >
              {submitting ? (
                <span className="spinner" />
              ) : (
                <Calculator size={16} />
              )}
              {isEditing ? "Guardar cambios" : "Crear cotización"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - Cost panel */}
        <div className="cost-panel">
          <div className="cost-card">
            <h3 className="cost-title">
              <Calculator size={18} />
              Desglose de costos
            </h3>

            <div className="cost-rows">
              <div className="cost-row">
                <span className="cost-label">
                  <Zap size={14} />
                  Energía
                </span>
                <span className="cost-value">
                  {formatearMoneda(resultado.costoEnergia)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">
                  <Droplets size={14} />
                  Resina
                  {resultado.pesoResina > 0 && (
                    <small> ({resultado.pesoResina}g)</small>
                  )}
                </span>
                <span className="cost-value">
                  {formatearMoneda(resultado.costoResina)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">
                  <Clock size={14} />
                  Mano de obra
                </span>
                <span className="cost-value">
                  {formatearMoneda(resultado.costoManoObra)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">
                  <Package size={14} />
                  Insumos extra
                </span>
                <span className="cost-value">
                  {formatearMoneda(resultado.costoInsumos)}
                </span>
              </div>

              <div className="cost-divider" />

              <div className="cost-row">
                <span className="cost-label bold">Costo base</span>
                <span className="cost-value">
                  {formatearMoneda(resultado.costoBase)}
                </span>
              </div>

              <div className="cost-row accent">
                <span className="cost-label">
                  Ganancia ({porcentajeGanancia}%)
                </span>
                <span className="cost-value">
                  +{formatearMoneda(resultado.ganancia)}
                </span>
              </div>

              <div className="cost-divider" />

              <div className="cost-row highlight">
                <span className="cost-label bold">Valor por unidad</span>
                <span className="cost-value bold">
                  {formatearMoneda(resultado.valorUnidad)}
                </span>
              </div>

              {cantidad > 1 && (
                <div className="cost-row total">
                  <span className="cost-label bold">
                    Total ({cantidad} uds.)
                  </span>
                  <span className="cost-value bold">
                    {formatearMoneda(resultado.valorTotal)}
                  </span>
                </div>
              )}
            </div>

            {/* Stats summary */}
            <div className="cost-stats">
              <div className="stat-item">
                <span className="stat-label">Tiempo total</span>
                <span className="stat-value">
                  {formatearTiempo(resultado.tiempoTotal)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Resina usada</span>
                <span className="stat-value">{resultado.pesoResina}g</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile Floating Action Button */}
      <button
        type="button"
        className="mobile-fab"
        onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
      >
        <Calculator size={20} />
        {isMobilePanelOpen ? "Ocultar panel" : "Ver Costos"}
        <span className="fab-badge">
          {formatearMoneda(resultado.valorTotal)}
        </span>
      </button>

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
          margin-bottom: 1.5rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s;
        }
        .back-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }
        .page-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          margin-top: 0.125rem;
        }

        /* ========== FORM LAYOUT ========== */
        .form-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .form-layout {
            grid-template-columns: 1fr;
          }
          .mobile-fab {
            display: flex !important;
          }
          .cost-panel {
            display: ${isMobilePanelOpen ? "block" : "none"};
            position: fixed;
            bottom: 5rem;
            left: 1rem;
            right: 1rem;
            z-index: 100;
            box-shadow: 0 -4px 25px rgba(0,0,0,0.6);
            opacity: ${isMobilePanelOpen ? "1" : "0"};
            animation: slideUp 0.3s ease-out;
          }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 768px) {
          .field-grid {
            grid-template-columns: 1fr;
          }
          .grid-4 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .span-2 {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .span-2 {
            grid-column: span 1;
          }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-field label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.625rem 0.75rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: inherit;
          transition: all 0.15s;
          width: 100%;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
        }

        .form-field textarea {
          resize: vertical;
          min-height: 60px;
        }

        .field-error {
          font-size: 0.75rem;
          color: var(--accent-danger);
        }

        .field-hint {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-family: "JetBrains Mono", monospace;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 0.5rem;
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s;
        }

        .btn-cancel:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ========== COST PANEL ========== */
        .cost-panel {
          position: sticky;
          top: 80px;
        }

        .cost-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          background-image: var(--gradient-card);
        }

        .cost-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .cost-rows {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.375rem 0;
        }

        .cost-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.8125rem;
        }

        .cost-label small {
          color: var(--text-muted);
        }

        .cost-value {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .cost-row.accent .cost-value {
          color: var(--accent-success);
        }

        .cost-row.highlight {
          background: rgba(0, 180, 216, 0.08);
          border-radius: var(--radius-sm);
          padding: 0.625rem 0.75rem;
          margin: 0 -0.75rem;
        }

        .cost-row.highlight .cost-value {
          color: var(--accent-primary);
          font-size: 1.125rem;
        }

        .cost-row.total {
          background: var(--gradient-primary);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          margin: 0.25rem -0.75rem 0;
        }

        .cost-row.total .cost-label {
          color: rgba(255, 255, 255, 0.85);
        }

        .cost-row.total .cost-value {
          color: white;
          font-size: 1.25rem;
        }

        .bold {
          font-weight: 700;
        }

        .cost-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.25rem 0;
        }

        .cost-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* ========== NUEVOS ESTILOS INSUMOS & FAB ========== */
        .mobile-fab {
          display: none;
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 101;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 0.8rem 1.25rem;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.4);
          cursor: pointer;
        }

        .fab-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 99px;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.8rem;
          margin-left: 0.25rem;
        }

        .insumos-selector {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-top: 0.25rem;
        }

        .btn-add-insumo {
          padding: 0.625rem 1rem;
          background: rgba(0, 180, 216, 0.1);
          color: var(--accent-primary);
          border: 1px solid var(--accent-primary);
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .btn-add-insumo:hover {
          background: var(--accent-primary);
          color: white;
        }

        .insumos-lista {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .insumos-item {
          display: flex;
          justify-content: space-between;
          background: var(--bg-card);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          border: 1px solid var(--border-color);
          align-items: center;
        }

        .ins-sub {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-family: "JetBrains Mono", monospace;
          color: var(--text-primary);
          font-weight: 600;
        }

        .ins-sub button {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--accent-danger);
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .ins-sub button:hover {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </>
  );
}
