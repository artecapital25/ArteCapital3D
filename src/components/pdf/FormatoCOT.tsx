import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Inter font for PDF
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: "2px solid #00b4d8",
    paddingBottom: 15,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#00b4d8",
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: 2,
    marginTop: 2,
  },
  headerRight: {
    textAlign: "right" as const,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 4,
  },
  docNumber: {
    fontSize: 12,
    fontWeight: 600,
    color: "#00b4d8",
    marginBottom: 2,
  },
  docDate: {
    fontSize: 9,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#00b4d8",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 120,
    fontSize: 9,
    color: "#64748b",
    fontWeight: 600,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 400,
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#0e0e1a",
    padding: 8,
    borderRadius: 4,
  },
  tableHeadCell: {
    color: "white",
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 9,
  },
  col1: { width: "35%" },
  col2: { width: "15%", textAlign: "center" as const },
  col3: { width: "25%", textAlign: "right" as const },
  col4: { width: "25%", textAlign: "right" as const },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end" as const,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    marginBottom: 4,
    padding: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: "#64748b",
    width: 140,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 600,
    width: 110,
    textAlign: "right" as const,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 250,
    padding: 8,
    backgroundColor: "#00b4d8",
    borderRadius: 4,
    marginTop: 4,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "white",
    width: 140,
  },
  totalFinalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "white",
    width: 110,
    textAlign: "right" as const,
  },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface FormatoCOTProps {
  cotizacion: {
    numeroCot: string;
    item: string;
    descripcion: string | null;
    cantidad: number;
    costoEnergia: number;
    costoResina: number;
    costoManoObra: number;
    costoInsumos: number;
    costoBase: number;
    porcentajeGanancia: number;
    valorUnidad: number;
    valorTotal: number;
    tiempoImpresion: number;
    tiempoDesarrollo: number;
    tiempoArmado: number;
    tiempoPintura: number;
    volumenPieza: number | null;
    fecha: Date;
    cliente: { nombre: string; codigo: string; nit: string | null; telefono: string | null; correo: string | null };
    maquina: { nombre: string; tipo: string } | null;
    resina: { tipo: string; marca: string; color: string } | null;
  };
}

export default function FormatoCOT({ cotizacion }: FormatoCOTProps) {
  const ganancia = cotizacion.valorUnidad - cotizacion.costoBase;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Arte Capital</Text>
            <Text style={styles.brandSubtitle}>Precisión Creativa · Impresión 3D</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>COTIZACIÓN</Text>
            <Text style={styles.docNumber}>{cotizacion.numeroCot}</Text>
            <Text style={styles.docDate}>
              {cotizacion.fecha.toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>
            {cotizacion.cliente.codigo} — {cotizacion.cliente.nombre}
          </Text>
        </View>
        {cotizacion.cliente.nit && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIT:</Text>
            <Text style={styles.infoValue}>{cotizacion.cliente.nit}</Text>
          </View>
        )}
        {cotizacion.cliente.telefono && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{cotizacion.cliente.telefono}</Text>
          </View>
        )}
        {cotizacion.cliente.correo && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo:</Text>
            <Text style={styles.infoValue}>{cotizacion.cliente.correo}</Text>
          </View>
        )}

        {/* Product Table */}
        <Text style={styles.sectionTitle}>Detalle del Producto</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.col1]}>Item</Text>
            <Text style={[styles.tableHeadCell, styles.col2]}>Cant.</Text>
            <Text style={[styles.tableHeadCell, styles.col3]}>V. Unitario</Text>
            <Text style={[styles.tableHeadCell, styles.col4]}>Subtotal</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={[styles.tableCell, { fontWeight: 600 }]}>
                {cotizacion.item}
              </Text>
              {cotizacion.descripcion && (
                <Text style={[styles.tableCell, { color: "#64748b", fontSize: 8, marginTop: 2 }]}>
                  {cotizacion.descripcion}
                </Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.col2]}>{cotizacion.cantidad}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{formatCOP(cotizacion.valorUnidad)}</Text>
            <Text style={[styles.tableCell, styles.col4, { fontWeight: 600 }]}>
              {formatCOP(cotizacion.valorTotal)}
            </Text>
          </View>
        </View>

        {/* Cost Breakdown */}
        <Text style={styles.sectionTitle}>Desglose de Costos</Text>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Energía:</Text>
            <Text style={styles.totalValue}>{formatCOP(cotizacion.costoEnergia)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Resina:</Text>
            <Text style={styles.totalValue}>{formatCOP(cotizacion.costoResina)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Mano de obra:</Text>
            <Text style={styles.totalValue}>{formatCOP(cotizacion.costoManoObra)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Insumos:</Text>
            <Text style={styles.totalValue}>{formatCOP(cotizacion.costoInsumos)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTop: "1px solid #e2e8f0", paddingTop: 8 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 600 }]}>Costo base:</Text>
            <Text style={styles.totalValue}>{formatCOP(cotizacion.costoBase)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Ganancia ({cotizacion.porcentajeGanancia}%):
            </Text>
            <Text style={[styles.totalValue, { color: "#22c55e" }]}>
              +{formatCOP(ganancia)}
            </Text>
          </View>
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL:</Text>
            <Text style={styles.totalFinalValue}>{formatCOP(cotizacion.valorTotal)}</Text>
          </View>
        </View>

        {/* Technical info */}
        {(cotizacion.maquina || cotizacion.resina) && (
          <>
            <Text style={styles.sectionTitle}>Especificaciones Técnicas</Text>
            {cotizacion.maquina && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Máquina:</Text>
                <Text style={styles.infoValue}>
                  {cotizacion.maquina.nombre} ({cotizacion.maquina.tipo})
                </Text>
              </View>
            )}
            {cotizacion.resina && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Resina:</Text>
                <Text style={styles.infoValue}>
                  {cotizacion.resina.tipo} — {cotizacion.resina.marca} ({cotizacion.resina.color})
                </Text>
              </View>
            )}
            {cotizacion.volumenPieza && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Volumen pieza:</Text>
                <Text style={styles.infoValue}>{cotizacion.volumenPieza} cm³</Text>
              </View>
            )}
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Arte Capital — Precisión Creativa · Impresión 3D
          </Text>
          <Text style={styles.footerText}>
            Cotización válida por 30 días · {cotizacion.numeroCot}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
