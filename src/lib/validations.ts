import { z } from "zod";

// ==========================================
// SANITIZACIÓN — Strip HTML tags para prevenir XSS
// ==========================================
const sanitize = (val: string) => val.replace(/<[^>]*>/g, "").trim();
const sanitizedString = z.string().transform(sanitize);

// ==========================================
// CLIENTE
// ==========================================
export const clienteSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio")
    .max(20, "El código no puede exceder 20 caracteres")
    .transform(sanitize),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform(sanitize),
  nit: z.string().max(20, "El NIT no puede exceder 20 caracteres").transform(sanitize).optional().or(z.literal("")),
  telefono: z.string().max(20, "El teléfono no puede exceder 20 caracteres").transform(sanitize).optional().or(z.literal("")),
  correo: z
    .string()
    .email("Correo electrónico inválido")
    .transform(sanitize)
    .optional()
    .or(z.literal("")),
  informacion: z.string().max(500, "La información no puede exceder 500 caracteres").transform(sanitize).optional().or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

// ==========================================
// RESINA
// ==========================================
export const resinaSchema = z.object({
  tipo: z
    .string()
    .min(1, "El tipo es obligatorio")
    .max(50)
    .transform(sanitize),
  marca: z
    .string()
    .min(1, "La marca es obligatoria")
    .max(50)
    .transform(sanitize),
  color: z
    .string()
    .min(1, "El color es obligatorio")
    .max(30)
    .transform(sanitize),
  volumenLitros: z.coerce
    .number()
    .positive("El volumen debe ser positivo")
    .max(100, "Volumen demasiado alto"),
  densidad: z.coerce
    .number()
    .positive("La densidad debe ser positiva")
    .max(20, "Densidad demasiado alta"),
  pesoGramos: z.coerce
    .number()
    .positive("El peso debe ser positivo"),
  valor: z.coerce
    .number()
    .positive("El valor debe ser positivo"),
  valorGramo: z.coerce
    .number()
    .positive("El valor por gramo debe ser positivo"),
  velocidadImpresion: z.coerce
    .number()
    .positive("La velocidad debe ser positiva")
    .max(500, "Velocidad demasiado alta"),
  resumen: z.string().max(300).transform(sanitize).optional().or(z.literal("")),
});

export type ResinaInput = z.infer<typeof resinaSchema>;

// ==========================================
// INSUMO
// ==========================================
export const insumoSchema = z.object({
  codigoItem: z
    .string()
    .min(1, "El código es obligatorio")
    .max(20)
    .transform(sanitize),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100)
    .transform(sanitize),
  marca: z.string().max(50).transform(sanitize).optional().or(z.literal("")),
  categoria: z.string().max(50).transform(sanitize).optional().or(z.literal("")),
  volumen: z.coerce.number().nonnegative().optional().or(z.literal("").transform(() => undefined)),
  valor: z.coerce.number().positive("El valor debe ser positivo"),
  valorUnidad: z.coerce.number().positive("El valor por unidad debe ser positivo"),
  linkCompra: z.string().url("URL inválida").optional().or(z.literal("")),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo").default(0),
  stockMinimo: z.coerce.number().int().nonnegative("El stock mínimo no puede ser negativo").default(0),
});

export type InsumoInput = z.infer<typeof insumoSchema>;

// ==========================================
// MÁQUINA
// ==========================================
export const maquinaSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100)
    .transform(sanitize),
  tipo: z.enum(["impresora", "curado", "pintura"], {
    message: "Tipo debe ser: impresora, curado o pintura",
  }),
  consumoEnergia: z.coerce
    .number()
    .positive("El consumo debe ser positivo")
    .max(100, "Consumo demasiado alto"),
  valorMinuto: z.coerce
    .number()
    .positive("El valor por minuto debe ser positivo"),
});

export type MaquinaInput = z.infer<typeof maquinaSchema>;

// ==========================================
// PERSONAL
// ==========================================
export const personalSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100)
    .transform(sanitize),
  valorHora: z.coerce
    .number()
    .positive("El valor por hora debe ser positivo"),
  valorMinuto: z.coerce
    .number()
    .positive("El valor por minuto debe ser positivo"),
});

export type PersonalInput = z.infer<typeof personalSchema>;

// ==========================================
// STOCK UPDATE
// ==========================================
export const stockUpdateSchema = z.object({
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser positiva"),
  tipo: z.enum(["entrada", "salida"], {
    message: "El tipo debe ser entrada o salida",
  }),
});

export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;

// ==========================================
// COTIZACIÓN
// ==========================================
export const cotizacionSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  maquinaId: z.string().min(1, "Selecciona una máquina").optional().or(z.literal("")),
  resinaId: z.string().min(1, "Selecciona una resina").optional().or(z.literal("")),
  personalId: z.string().min(1, "Selecciona personal").optional().or(z.literal("")),
  item: z
    .string()
    .min(2, "El nombre del item debe tener al menos 2 caracteres")
    .max(200)
    .transform(sanitize),
  descripcion: z.string().max(500).transform(sanitize).optional().or(z.literal("")),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser positiva").default(1),
  tiempoImpresion: z.coerce.number().nonnegative("El tiempo debe ser positivo o cero"),
  tiempoDesarrollo: z.coerce.number().nonnegative("El tiempo debe ser positivo o cero"),
  tiempoArmado: z.coerce.number().nonnegative("El tiempo debe ser positivo o cero"),
  tiempoPintura: z.coerce.number().nonnegative("El tiempo debe ser positivo o cero"),
  volumenPieza: z.coerce.number().nonnegative("El volumen debe ser positivo o cero").optional().or(z.literal("").transform(() => 0)),
  insumosExtra: z.coerce.number().nonnegative("Los insumos deben ser positivos o cero").default(0),
  porcentajeGanancia: z.coerce.number().min(0).max(500, "% ganancia máx. 500").default(30),
});

export type CotizacionInput = z.infer<typeof cotizacionSchema>;

// ==========================================
// CAMBIAR ESTADO COTIZACIÓN
// ==========================================
export const estadoCotizacionSchema = z.object({
  estado: z.enum(["pendiente", "aceptado", "rechazado"], {
    message: "Estado debe ser: pendiente, aceptado o rechazado",
  }),
});

// ==========================================
// CAMBIAR ESTADO PEDIDO
// ==========================================
export const estadoPedidoSchema = z.object({
  estado: z.enum(["COTIZADO", "APROBADO", "EN_PROCESO", "EN_ENVIO", "ENTREGADO", "CANCELADO"], {
    message: "Estado de pedido inválido",
  }),
  nota: z.string().max(500).transform(sanitize).optional().or(z.literal("")),
});

// ==========================================
// ORDEN DE COMPRA
// ==========================================
export const ordenCompraItemSchema = z.object({
  insumoId: z.string().min(1, "Selecciona un insumo"),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser positiva"),
  valorUnitario: z.coerce.number().positive("El valor unitario debe ser positivo"),
});

export const ordenCompraSchema = z.object({
  proveedor: z
    .string()
    .min(2, "El proveedor debe tener al menos 2 caracteres")
    .max(200)
    .transform(sanitize),
  items: z.array(ordenCompraItemSchema).min(1, "Debe tener al menos un item"),
});

export type OrdenCompraInput = z.infer<typeof ordenCompraSchema>;

// ==========================================
// HELPER: Parsear FormData con un schema Zod
// ==========================================
export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const rawData: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const result = schema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
