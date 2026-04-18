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
    borderBottom: "2px solid #e91e8c",
    paddingBottom: 15,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#e91e8c",
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
    color: "#e91e8c",
    marginBottom: 2,
  },
  docDate: {
    fontSize: 9,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#e91e8c",
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
    backgroundColor: "#1b1464",
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
  tableCell: {
    fontSize: 9,
  },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "center" as const },
  col3: { width: "20%", textAlign: "right" as const },
  col4: { width: "25%", textAlign: "right" as const },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 280,
    padding: 10,
    backgroundColor: "#e91e8c",
    borderRadius: 4,
    marginTop: 20,
    alignSelf: "flex-end" as const,
  },
  totalFinalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "white",
    width: 160,
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "white",
    width: 120,
    textAlign: "right" as const,
  },
  conditionsSection: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    border: "1px solid #e2e8f0",
  },
  conditionText: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 3,
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

interface FormatoCCProps {
  cotizacion: {
    numeroCot: string;
    item: string;
    descripcion: string | null;
    cantidad: number;
    valorUnidad: number;
    valorTotal: number;
    fecha: Date;
    cliente: {
      nombre: string;
      codigo: string;
      nit: string | null;
      telefono: string | null;
      correo: string | null;
    };
  };
}

export default function FormatoCC({ cotizacion }: FormatoCCProps) {
  const ccNumber = cotizacion.numeroCot.replace("COT", "CC");

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Arte Capital</Text>
            <Text style={styles.brandSubtitle}>
              Precisión Creativa · Impresión 3D
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>CUENTA DE COBRO</Text>
            <Text style={styles.docNumber}>{ccNumber}</Text>
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
        <Text style={styles.sectionTitle}>Cobrar a</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Señor(a):</Text>
          <Text style={[styles.infoValue, { fontWeight: 600 }]}>
            {cotizacion.cliente.nombre}
          </Text>
        </View>
        {cotizacion.cliente.nit && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIT / CC:</Text>
            <Text style={styles.infoValue}>{cotizacion.cliente.nit}</Text>
          </View>
        )}
        {cotizacion.cliente.telefono && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{cotizacion.cliente.telefono}</Text>
          </View>
        )}

        {/* Concept Table */}
        <Text style={styles.sectionTitle}>Concepto</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.col1]}>Descripción</Text>
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
                <Text
                  style={[
                    styles.tableCell,
                    { color: "#64748b", fontSize: 8, marginTop: 2 },
                  ]}
                >
                  {cotizacion.descripcion}
                </Text>
              )}
              <Text
                style={[
                  styles.tableCell,
                  { color: "#94a3b8", fontSize: 7, marginTop: 3 },
                ]}
              >
                Ref. Cotización: {cotizacion.numeroCot}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.col2]}>
              {cotizacion.cantidad}
            </Text>
            <Text style={[styles.tableCell, styles.col3]}>
              {formatCOP(cotizacion.valorUnidad)}
            </Text>
            <Text style={[styles.tableCell, styles.col4, { fontWeight: 600 }]}>
              {formatCOP(cotizacion.valorTotal)}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={{ alignItems: "flex-end", marginTop: 10 }}>
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL A PAGAR:</Text>
            <Text style={styles.totalFinalValue}>
              {formatCOP(cotizacion.valorTotal)}
            </Text>
          </View>
        </View>

        {/* Conditions */}
        <View style={styles.conditionsSection}>
          <Text style={[styles.conditionText, { fontWeight: 600, color: "#1e293b", marginBottom: 6 }]}>
            Condiciones de pago:
          </Text>
          <Text style={styles.conditionText}>
            • Pago al contado o transferencia bancaria.
          </Text>
          <Text style={styles.conditionText}>
            • Plazo máximo de pago: 15 días calendario a partir de la fecha de emisión.
          </Text>
          <Text style={styles.conditionText}>
            • Consignar a nombre de Arte Capital.
          </Text>
        </View>

        {/* Signature lines */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 50 }}>
          <View style={{ width: 200, borderTop: "1px solid #94a3b8", paddingTop: 6 }}>
            <Text style={{ fontSize: 8, color: "#64748b", textAlign: "center" }}>
              Firma — Arte Capital
            </Text>
          </View>
          <View style={{ width: 200, borderTop: "1px solid #94a3b8", paddingTop: 6 }}>
            <Text style={{ fontSize: 8, color: "#64748b", textAlign: "center" }}>
              Firma — {cotizacion.cliente.nombre}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Arte Capital — Precisión Creativa · Impresión 3D
          </Text>
          <Text style={styles.footerText}>
            Cuenta de Cobro · {ccNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
