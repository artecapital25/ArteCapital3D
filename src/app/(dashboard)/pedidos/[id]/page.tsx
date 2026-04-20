import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Clock, Package, Zap, Droplets, ArrowRight } from "lucide-react";
import { formatearMoneda, formatearTiempo } from "@/lib/calculos";
import "./page.css";

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


    </>
  );
}
