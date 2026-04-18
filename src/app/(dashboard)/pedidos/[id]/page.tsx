import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Clock, Package, Zap, Droplets, ArrowRight } from "lucide-react";
import { formatearMoneda, formatearTiempo } from "@/lib/calculos";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PageProps) {
  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cotizacion: {
        include: {
          cliente: true,
          maquina: true,
          resina: true,
        },
      },
      historial: {
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!pedido) notFound();

  const estConfig: Record<string, string> = {
    COTIZADO: "#64748b",
    APROBADO: "#8b5cf6",
    EN_PROCESO: "#f59e0b",
    EN_ENVIO: "#00b4d8",
    ENTREGADO: "#22c55e",
    CANCELADO: "#ef4444",
  };

  const currentColor = estConfig[pedido.estado] || estConfig.COTIZADO;

  return (
    <>
      {/* Header */}
      <div className="det-header">
        <div className="header-left">
          <Link href="/pedidos" className="back-btn"><ArrowLeft size={18} /></Link>
          <div>
            <div className="header-top-row">
              <h1 className="det-title">{pedido.numeroPedido}</h1>
              <span className="estado-badge" style={{ background: `${currentColor}15`, color: currentColor, border: `1px solid ${currentColor}40` }}>
                {pedido.estado.replace("_", " ")}
              </span>
            </div>
            <p className="det-subtitle">
              Cotización referenciada: <Link href={`/cotizaciones/${pedido.cotizacionId}`} className="text-link">COT-{pedido.cotizacion.numeroCot.split("-")[2]}</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Lado izquierdo: Detalles del pedido */}
        <div className="col-left">
          <div className="info-card">
            <h3 className="card-title"><Package size={16} /> Detalles del Item</h3>
            <div className="info-row">
              <span className="info-label">Cliente</span>
              <span className="info-val">{pedido.cotizacion.cliente.nombre}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total a cobrar</span>
              <span className="info-val total">{formatearMoneda(pedido.cotizacion.valorTotal)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Item</span>
              <span className="info-val">{pedido.cotizacion.item}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cantidad</span>
              <span className="info-val">{pedido.cotizacion.cantidad}</span>
            </div>
            {pedido.notas && (
              <div className="info-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                <span className="info-label">Notas</span>
                <span className="info-val" style={{ textAlign: "left", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{pedido.notas}</span>
              </div>
            )}
          </div>

          <div className="info-card mt-4">
            <h3 className="card-title">Tiempos y Materiales</h3>
            <div className="info-row">
              <span className="info-label"><Zap size={14} /> Máquina</span>
              <span className="info-val">{pedido.cotizacion.maquina?.nombre || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Droplets size={14} /> Resina</span>
              <span className="info-val">{pedido.cotizacion.resina?.tipo || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Clock size={14} /> T. Impresión</span>
              <span className="info-val">{formatearTiempo(pedido.cotizacion.tiempoImpresion)}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Clock size={14} /> T. Postprocesado</span>
              <span className="info-val">{formatearTiempo(pedido.cotizacion.tiempoDesarrollo + pedido.cotizacion.tiempoArmado + pedido.cotizacion.tiempoPintura)}</span>
            </div>
          </div>
        </div>

        {/* Lado derecho: Línea de Tiempo (Historial) */}
        <div className="col-right">
          <div className="timeline-card">
            <h3 className="card-title">Historial de Estados</h3>
            
            <div className="timeline">
              {pedido.historial.map((hist, i) => (
                <div key={hist.id} className="timeline-item">
                  <div className="timeline-connector">
                    <div className="timeline-dot" style={{ background: estConfig[hist.estadoNuevo] || "#475569" }} />
                    {i !== pedido.historial.length - 1 && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-estado">{hist.estadoNuevo.replace("_", " ")}</span>
                      <span className="timeline-date">
                        {format(new Date(hist.fecha), "dd MMM yyyy, hh:mm a", { locale: es })}
                      </span>
                    </div>
                    {hist.estadoAnterior !== hist.estadoNuevo && (
                      <div className="timeline-change">
                        <span style={{ color: "var(--text-muted)" }}>De: </span> 
                        <span style={{ color: estConfig[hist.estadoAnterior] }}>{hist.estadoAnterior.replace("_", " ")}</span>
                        <ArrowRight size={10} style={{ margin: "0 4px", color: "var(--text-muted)" }} />
                        <span style={{ color: estConfig[hist.estadoNuevo] }}>{hist.estadoNuevo.replace("_", " ")}</span>
                      </div>
                    )}
                    {hist.nota && (
                      <div className="timeline-note">"{hist.nota}"</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .det-header { margin-bottom: 2rem; }
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
        .estado-badge { padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .det-subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem; }
        .text-link { color: var(--accent-primary); text-decoration: none; font-weight: 500; }
        .text-link:hover { text-decoration: underline; }

        .layout-grid {
          display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem;
        }
        @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } }
        
        .col-left { display: flex; flex-direction: column; gap: 1.5rem; }
        .mt-4 { margin-top: 0; } /* Managed by gap */

        .info-card, .timeline-card {
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-lg); padding: 1.5rem;
        }
        .card-title {
          font-size: 0.875rem; font-weight: 700; color: var(--text-primary);
          margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        .info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.625rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 0.8125rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.375rem; }
        .info-val { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); text-align: right; max-width: 60%; }
        .total { font-size: 1.125rem; font-weight: 700; color: var(--accent-primary); font-family: 'JetBrains Mono', monospace; }

        .timeline { display: flex; flex-direction: column; }
        .timeline-item { display: flex; gap: 1rem; }
        .timeline-connector { display: flex; flex-direction: column; align-items: center; width: 12px; }
        .timeline-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-card); box-shadow: 0 0 0 1px var(--border-color); z-index: 2; margin-top: 4px; }
        .timeline-line { width: 1px; flex: 1; background: var(--border-color); margin: 4px 0; }
        .timeline-content { padding-bottom: 1.5rem; flex: 1; }
        .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .timeline-estado { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); text-transform: capitalize; }
        .timeline-date { font-size: 0.75rem; color: var(--text-muted); }
        .timeline-change { display: flex; align-items: center; font-size: 0.75rem; font-weight: 500; background: rgba(255,255,255,0.02); padding: 4px 8px; border-radius: 4px; margin-bottom: 0.5rem; border: 1px dashed rgba(255,255,255,0.05); display: inline-flex;}
        .timeline-note { font-size: 0.8125rem; color: var(--text-secondary); background: rgba(0,180,216,0.05); padding: 0.5rem 0.75rem; border-left: 2px solid var(--accent-primary); border-radius: 0 4px 4px 0; font-style: italic; }
      `}</style>
    </>
  );
}
