"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Box, Store, Loader2, ArrowRight } from "lucide-react";
import { crearOC } from "@/app/actions/ordenes-compra";
import { formatearMoneda } from "@/lib/calculos";

interface InsumoDisponible {
  id: string;
  codigoItem: string;
  nombre: string;
  marca: string | null;
  stock: number;
  stockMinimo: number;
}

interface OCItem {
  id: string;
  insumoId: string;
  cantidad: number;
  valorUnitario: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function FormularioOC({ insumosDisponibles }: { insumosDisponibles: InsumoDisponible[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorObj, setErrorObj] = useState<Record<string, string> | null>(null);

  const [proveedor, setProveedor] = useState("");
  const [items, setItems] = useState<OCItem[]>([{ id: generateId(), insumoId: "", cantidad: 1, valorUnitario: 0 }]);

  const agregarFila = () => {
    setItems([...items, { id: generateId(), insumoId: "", cantidad: 1, valorUnitario: 0 }]);
  };

  const eliminarFila = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(it => it.id !== id));
  };

  const updateFila = (id: string, field: keyof OCItem, value: any) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const totalOC = items.reduce((acc, it) => acc + (it.cantidad * (it.valorUnitario || 0)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorObj(null);

    const formData = new FormData();
    formData.append("proveedor", proveedor);
    
    // Preparar items limpios sin el UI ID temporal
    const cleanItems = items.map(it => ({
      insumoId: it.insumoId,
      cantidad: it.cantidad,
      valorUnitario: it.valorUnitario
    }));
    formData.append("items", JSON.stringify(cleanItems));

    const result = await crearOC(formData);

    if (result.success) {
      router.push("/ordenes-compra");
    } else {
      setIsSubmitting(false);
      if (result.errors) {
        setErrorObj(result.errors);
      } else {
        alert(result.message || "Error al crear la orden");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos Básicos */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 p-6 rounded-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b4d8]/5 blur-3xl rounded-full" />
        
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Store size={18} className="text-[#00b4d8]" />
          Datos del Proveedor
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Nombre o Razón Social</label>
          <input
            type="text"
            required
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00b4d8] focus:bg-white/5 transition-colors"
            placeholder="Ej. Resinas 3D de Colombia"
          />
          {errorObj?.proveedor && <p className="text-red-400 text-xs mt-1">{errorObj.proveedor}</p>}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 p-6 rounded-xl relative backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Box size={18} className="text-emerald-400" />
          ítems a Comprar
        </h2>

        {errorObj?.items && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-2 border border-red-400/20 rounded-md">{errorObj.items}</p>}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-black/20 p-3 border border-white/5 rounded-lg">
              <div className="md:col-span-1 text-gray-500 font-mono text-sm self-center">#{index + 1}</div>
              
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Insumo</label>
                <select
                  required
                  value={item.insumoId}
                  onChange={(e) => updateFila(item.id, "insumoId", e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded text-sm px-3 py-2 text-white outline-none focus:border-[#00b4d8]"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {insumosDisponibles.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.nombre} {ins.marca ? `(${ins.marca})` : ""} - Stock: {ins.stock}
                    </option>
                  ))}
                </select>
                {errorObj?.[`items.${index}.insumoId`] && <p className="text-red-400 text-xs mt-1">Requerido</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={item.cantidad}
                  onChange={(e) => updateFila(item.id, "cantidad", Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded text-sm px-3 py-2 text-white outline-none focus:border-[#00b4d8]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unitario ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={item.valorUnitario}
                  onChange={(e) => updateFila(item.id, "valorUnitario", Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded text-sm px-3 py-2 text-white outline-none focus:border-[#00b4d8]"
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => eliminarFila(item.id)}
                  disabled={items.length === 1}
                  className="bg-red-500/10 text-red-400 p-2 rounded hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarFila}
          className="mt-4 flex items-center gap-1 text-sm text-[#00b4d8] hover:text-[#90e0ef] font-medium transition-colors p-2 hover:bg-[#00b4d8]/10 rounded-md"
        >
          <Plus size={16} /> Agregar ítem
        </button>
      </div>

      {/* Footer Total & Submit */}
      <div className="bg-[#0e0e1a]/90 border border-[#00b4d8]/30 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Estimado</p>
          <p className="text-3xl font-mono font-bold text-[#00b4d8]">
            {formatearMoneda(totalOC)}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || totalOC === 0 || items.some(i => !i.insumoId)}
          className="btn btn-primary px-8 py-3 w-full md:w-auto h-auto flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Guardando...
            </>
          ) : (
            <>
              Emitir Orden <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
