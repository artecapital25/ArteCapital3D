"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X, Box, Search, ExternalLink } from "lucide-react";
import { formatearMoneda } from "@/lib/calculos";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { recibirOC, cancelarOC } from "@/app/actions/ordenes-compra";
import { useRouter } from "next/navigation";

interface Orden {
  id: string;
  numeroOrden: string;
  proveedor: string;
  estado: string;
  total: number;
  itemsCount: number;
  fechaCreacion: string;
  fechaRecepcion: string | null;
}

export default function OrdenesTable({ ordenes }: { ordenes: Orden[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const filtered = ordenes.filter(
    (oc) =>
      oc.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oc.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecibir = (id: string, numero: string) => {
    setDialogConfig({
      isOpen: true,
      title: "Recibir Orden de Compra",
      message: `¿Confirmas que recibiste la orden ${numero}? Esto aumentará el inventario físico permanentemente y no se puede deshacer.`,
      action: async () => {
        setIsProcessing(true);
        const res = await recibirOC(id);
        setIsProcessing(false);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.message);
        }
      }
    });
  };

  const handleCancelar = (id: string, numero: string) => {
    setDialogConfig({
      isOpen: true,
      title: "Cancelar Orden",
      message: `¿Estás seguro de cancelar la orden ${numero}?`,
      action: async () => {
        setIsProcessing(true);
        const res = await cancelarOC(id);
        setIsProcessing(false);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.message);
        }
      }
    });
  };

  return (
    <>
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar orden o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00b4d8] focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 text-xs uppercase text-gray-400 font-semibold">
            <tr>
              <th className="px-6 py-4">N° Orden</th>
              <th className="px-6 py-4">Proveedor / Fecha</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                  No se encontraron órdenes de compra
                </td>
              </tr>
            ) : (
              filtered.map((oc) => (
                <tr key={oc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-200">
                    {oc.numeroOrden}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{oc.proveedor}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(oc.fechaCreacion), "MMM dd, yyyy", { locale: es })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs bg-white/5 w-fit px-2 py-1 rounded">
                      <Box size={14} className="text-gray-400" />
                      {oc.itemsCount} líneas
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#00b4d8] font-mono font-bold">
                    {formatearMoneda(oc.total)}
                  </td>
                  <td className="px-6 py-4">
                    {oc.estado === "pendiente" && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-md text-xs font-semibold mr-2 tracking-wide uppercase">
                        En camino
                      </span>
                    )}
                    {oc.estado === "recibida" && (
                      <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-md text-xs font-semibold mr-2 tracking-wide uppercase flex items-center w-fit gap-1">
                        <Check size={12} />
                        Recibida
                      </span>
                    )}
                     {oc.estado === "cancelada" && (
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-md text-xs font-semibold mr-2 tracking-wide flex items-center w-fit gap-1">
                        <X size={12} />
                        Cancelada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {oc.estado === "pendiente" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCancelar(oc.id, oc.numeroOrden)}
                          className="px-3 py-1.5 text-xs border border-white/10 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                          disabled={isProcessing}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleRecibir(oc.id, oc.numeroOrden)}
                          className="px-3 py-1.5 text-xs bg-[#00b4d8]/10 text-[#00b4d8] hover:bg-[#00b4d8]/20 border border-[#00b4d8]/30 rounded font-medium transition-colors"
                          disabled={isProcessing}
                        >
                          Marcar Recibida
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {dialogConfig && (
        <ConfirmDialog
          isOpen={dialogConfig.isOpen}
          title={dialogConfig.title}
          message={dialogConfig.message}
          onConfirm={async () => {
            await dialogConfig.action();
            setDialogConfig(null);
          }}
          onClose={() => setDialogConfig(null)}
        />
      )}
    </>
  );
}
