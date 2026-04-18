/**
 * Motor de cálculo de costos para cotizaciones de impresión 3D.
 * Replica la lógica del Excel original en código TypeScript.
 */

export interface ParamsCotizacion {
  maquina: { valorMinuto: number; consumoEnergia: number };
  resina: { densidad: number; valorGramo: number };
  personal: { valorMinuto: number };
  tiempoImpresion: number;      // minutos
  tiempoDesarrollo: number;     // minutos
  tiempoArmado: number;         // minutos
  tiempoPintura: number;        // minutos
  volumenPieza: number;         // cm3
  insumosExtra: number;         // valor adicional de insumos
  porcentajeGanancia: number;   // ej: 30 para 30%
  cantidad: number;             // unidades
}

export interface ResultadoCotizacion {
  costoEnergia: number;
  costoResina: number;
  costoManoObra: number;
  costoInsumos: number;
  costoBase: number;
  ganancia: number;
  valorUnidad: number;
  valorTotal: number;
  pesoResina: number;           // gramos de resina usados
  tiempoTotal: number;          // tiempo total en minutos
}

export function calcularCotizacion(
  params: ParamsCotizacion
): ResultadoCotizacion {
  // Costo de energía = valor/minuto de la máquina × tiempo de impresión
  const costoEnergia = params.maquina.valorMinuto * params.tiempoImpresion;

  // Peso de resina = volumen de la pieza (cm3) × densidad (g/cm3)
  const pesoResina = params.volumenPieza * params.resina.densidad;

  // Costo de resina = peso en gramos × valor por gramo
  const costoResina = pesoResina * params.resina.valorGramo;

  // Tiempo de mano de obra total
  const tiempoManoObra =
    params.tiempoDesarrollo + params.tiempoArmado + params.tiempoPintura;

  // Costo de mano de obra = valor/minuto del personal × tiempo total
  const costoManoObra = params.personal.valorMinuto * tiempoManoObra;

  // Costo de insumos extras
  const costoInsumos = params.insumosExtra;

  // Costo base = suma de todos los costos
  const costoBase = costoEnergia + costoResina + costoManoObra + costoInsumos;

  // Ganancia sobre el costo base
  const ganancia = costoBase * (params.porcentajeGanancia / 100);

  // Valor por unidad = costo base + ganancia
  const valorUnidad = costoBase + ganancia;

  // Valor total = valor por unidad × cantidad
  const valorTotal = valorUnidad * params.cantidad;

  // Tiempo total (impresión + mano de obra)
  const tiempoTotal = params.tiempoImpresion + tiempoManoObra;

  return {
    costoEnergia: redondear(costoEnergia),
    costoResina: redondear(costoResina),
    costoManoObra: redondear(costoManoObra),
    costoInsumos: redondear(costoInsumos),
    costoBase: redondear(costoBase),
    ganancia: redondear(ganancia),
    valorUnidad: redondear(valorUnidad),
    valorTotal: redondear(valorTotal),
    pesoResina: redondear(pesoResina),
    tiempoTotal: redondear(tiempoTotal),
  };
}

/**
 * Redondea a 2 decimales
 */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Formatea un valor como moneda COP
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Formatea minutos como horas y minutos legibles
 */
export function formatearTiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
}
