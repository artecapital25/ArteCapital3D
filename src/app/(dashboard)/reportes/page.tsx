"use client";

import { useState } from "react";
import { generarDatosReporte } from "@/app/actions/reportes";
import * as XLSX from "xlsx";
import { DownloadCloud, Calendar, Loader2 } from "lucide-react";

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(1); // Primer día del mes actual
    return d.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split("T")[0]; // Hoy
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDescargar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor selecciona ambas fechas");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generarDatosReporte(fechaInicio, fechaFin);
      
      if (!res.success || !res.cotizaciones || !res.gastos) {
        throw new Error("No se pudo extraer los datos.");
      }

      // Crear un Workbook de Excel
      const wb = XLSX.utils.book_new();

      // Hoja 1: Ingresos (Cotizaciones)
      const wsIngresos = XLSX.utils.json_to_sheet(res.cotizaciones);
      XLSX.utils.book_append_sheet(wb, wsIngresos, "Ventas y Cotizaciones");

      // Hoja 2: Gastos (Órdenes de Compra)
      const wsGastos = XLSX.utils.json_to_sheet(res.gastos);
      XLSX.utils.book_append_sheet(wb, wsGastos, "Gastos (Órdenes Compra)");

      // Generar archivo físico y disparar descarga
      XLSX.writeFile(wb, `Reporte_Financiero_ArteCapital_${fechaInicio}_al_${fechaFin}.xlsx`);

    } catch (error) {
      console.error(error);
      alert("Error al generar el archivo Excel");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-6">
      
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">Centro de Reportes</h1>
        <p className="text-sm text-gray-400">Extrae la metadata operativa estructurada en Excel directamente a tu equipo contable.</p>
      </div>

      <div className="bg-[#0e0e1a]/80 border border-white/5 p-6 rounded-xl relative overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
        
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <DownloadCloud size={20} className="text-emerald-400" />
          Descarga Consolidada (.xlsx)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
              <Calendar size={14} /> Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/5 transition-colors color-scheme-dark"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
              <Calendar size={14} /> Fecha de Fin (Corte)
            </label>
            <input
              type="date"
              value={fechaFin}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/5 transition-colors color-scheme-dark"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg mb-6">
          <h4 className="text-sm font-bold text-emerald-400 mb-2">¿Qué incluye este reporte?</h4>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Pestaña 1 (Ingresos):</strong> Todas las cotizaciones creadas en el rango de fechas, clientes que originan el ingreso, total pagado y estado del ciclo de vida.</li>
            <li><strong>Pestaña 2 (Egresos):</strong> Las órdenes de compra emitidas a proveedores de materia prima y costos desembolsados.</li>
          </ul>
        </div>

        <button
          onClick={handleDescargar}
          disabled={isGenerating || !fechaInicio || !fechaFin}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <><Loader2 size={18} className="animate-spin" /> Procesando cubos de datos...</>
          ) : (
            <><DownloadCloud size={18} /> Generar Archivo Excel</>
          )}
        </button>
      </div>
      
    </div>
  );
}
