"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, ChevronRight, Package, FileText } from "lucide-react";

interface ListasRecientesProps {
  alertas: { id: string; nombre: string; stock: number; stockMinimo: number }[];
  ultimosPedidos: { id: string; num: string; item: string; cliente: string; fecha: string }[];
  ultimasCots: { id: string; num: string; item: string; cliente: string; fecha: string }[];
}

export default function ListasRecientes({ alertas, ultimosPedidos, ultimasCots }: ListasRecientesProps) {
  return (
    <div className="space-y-6">
      
      {/* ALERTAS DE INVENTARIO */}
      {alertas.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl overflow-hidden p-0">
          <div className="bg-amber-500/10 px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
              <AlertTriangle size={16} /> Escasez de Insumos
            </h3>
            <Link href="/inventario/insumos" className="text-xs text-amber-500/70 hover:text-amber-500 flex items-center">
               Resolver <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-amber-500/10">
            {alertas.map(a => (
              <div key={a.id} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="text-white font-medium text-xs">{a.nombre}</p>
                  <p className="text-amber-500/70 text-[10px]">Mínimo requerido: {a.stockMinimo}</p>
                </div>
                <span className="font-mono font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs">
                  {a.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECIENTES: PEDIDOS */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package size={16} className="text-emerald-400" /> Trabajos Recientes
          </h3>
          <Link href="/pedidos" className="text-xs text-gray-500 hover:text-white transition-colors">
            Ver Kanban <ChevronRight size={14} className="inline" />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {ultimosPedidos.length > 0 ? ultimosPedidos.map(p => (
            <Link key={p.id} href={`/pedidos/${p.id}`} className="block hover:bg-white/[0.02] p-3 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-mono font-bold text-gray-300">{p.num}</p>
                <span className="text-[10px] text-gray-500">{format(new Date(p.fecha), "MMM dd", { locale: es })}</span>
              </div>
              <p className="text-sm text-white font-medium truncate">{p.item}</p>
              <p className="text-xs text-gray-500 truncate">{p.cliente}</p>
            </Link>
          )) : (
            <p className="p-4 text-xs text-gray-500 text-center italic">Sin pedidos recientes</p>
          )}
        </div>
      </div>

      {/* RECIENTES: COTIZACIONES */}
      <div className="bg-[#0e0e1a]/80 border border-white/5 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-[#00b4d8]" /> Últimas Cotizaciones
          </h3>
          <Link href="/cotizaciones" className="text-xs text-gray-500 hover:text-white transition-colors">
            Ver todas <ChevronRight size={14} className="inline" />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {ultimasCots.length > 0 ? ultimasCots.map(c => (
            <Link key={c.id} href={`/cotizaciones/${c.id}`} className="block hover:bg-white/[0.02] p-3 transition-colors">
               <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-mono font-bold text-gray-300">{c.num}</p>
                <span className="text-[10px] text-gray-500">{format(new Date(c.fecha), "MMM dd", { locale: es })}</span>
              </div>
              <p className="text-sm text-white font-medium truncate">{c.item}</p>
              <p className="text-xs text-gray-500 truncate">{c.cliente}</p>
            </Link>
          )) : (
            <p className="p-4 text-xs text-gray-500 text-center italic">Sin cotizaciones</p>
          )}
        </div>
      </div>

    </div>
  );
}
