import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";

function parseCurrency(val: any): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/\$|,|\s/g, "");
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

async function importPersonal() {
  const filePath = path.join(process.cwd(), "data", "WJGEEKS - PERSONAL.csv");
  if (!fs.existsSync(filePath)) return;

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = xlsx.utils.sheet_to_json(sheet);

  for (const row of data) {
    if (!row["Personal"]) continue;
    
    await prisma.personal.create({
      data: {
        nombre: String(row["Personal"]),
        valorHora: parseCurrency(row["Valor hora"]),
        valorMinuto: parseCurrency(row["Valor minuto"]),
      }
    });
  }
  console.log("✅ Personal importado");
}

async function importInsumos() {
  const filePath = path.join(process.cwd(), "data", "WJGEEKS - INSUMOS.csv");
  if (!fs.existsSync(filePath)) return;

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = xlsx.utils.sheet_to_json(sheet);

  for (const row of data) {
    if (!row["Codigo Item"] || row["Codigo Item"] === "0") continue;
    
    try {
      await prisma.insumo.upsert({
        where: { codigoItem: String(row["Codigo Item"]) },
        update: {},
        create: {
          codigoItem: String(row["Codigo Item"]),
          nombre: String(row["Item"] || "Sin nombre"),
          marca: String(row["Marca"] || ""),
          categoria: String(row["Categoria"] || ""),
          volumen: parseFloat(row["Volumen (ml)(g)(und)"]) || 0,
          valor: parseCurrency(row["Valor"]),
          valorUnidad: parseCurrency(row["Valor unidad"]),
          linkCompra: String(row["Link de compra"] || ""),
          stock: 0,
          stockMinimo: 0,
        }
      });
    } catch (e) {
      console.error("Error importando insumo", row["Codigo Item"], e);
    }
  }
  console.log("✅ Insumos importados");
}

async function importResinas() {
  const filePath = path.join(process.cwd(), "data", "WJGEEKS - RESINAS.csv");
  if (!fs.existsSync(filePath)) return;

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = xlsx.utils.sheet_to_json(sheet);

  for (const row of data) {
    if (!row["Tipo de resina "] || !row["Tipo de resina "].trim()) continue;
    
    try {
      await prisma.resina.create({
        data: {
          tipo: String(row["Tipo de resina "]).trim(),
          marca: String(row["Marca de la resina"] || ""),
          color: String(row["Color"] || ""),
          volumenLitros: parseFloat(row["Volumen (l)"]) || 0,
          densidad: parseFloat(row["Densidad (g/cm3)"]) || 0,
          pesoGramos: parseFloat(row["Peso (g)"]) || 0,
          valor: parseCurrency(row["Valor "]),
          valorGramo: parseCurrency(row["Valor gramo"]),
          velocidadImpresion: parseFloat(row["Velocidad de impresion (mm/h)"]) || 0,
          resumen: String(row["Resumen"] || ""),
        }
      });
    } catch (e) {
      console.error("Error importando resina", row["Tipo de resina "], e);
    }
  }
  console.log("✅ Resinas importadas");
}

async function importClientes() {
  const filePath = path.join(process.cwd(), "data", "WJGEEKS - CLIENTE.csv");
  if (!fs.existsSync(filePath)) return;

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = xlsx.utils.sheet_to_json(sheet);

  // Clear weird empty rows
  const validData = data.filter(r => r["Nombre "] && r["Nombre "].trim() !== "");

  for (const row of validData) {
    if (!row["Codigo "]) continue;
    const codigo = `CLI-${row["Codigo "]}`;
    
    try {
      await prisma.cliente.upsert({
        where: { codigo },
        update: {},
        create: {
          codigo,
          nombre: String(row["Nombre "]).trim(),
          nit: row["Nit"] ? String(row["Nit"]).trim() : null,
          telefono: row["Telefono"] ? String(row["Telefono"]).trim() : null,
          correo: row["Correo"] ? String(row["Correo"]).trim() : null,
          informacion: row["Informacion"] ? String(row["Informacion"]).trim() : null,
        }
      });
    } catch (e) {
      console.error("Error importando cliente", codigo, e);
    }
  }
  console.log("✅ Clientes importados");
}

async function main() {
  console.log("🌱 Iniciando importación desde CSV...");
  
  await importPersonal();
  await importInsumos();
  await importResinas();
  await importClientes();

  console.log("🎉 Importación completada!");
}

main()
  .catch((e) => {
    console.error("❌ Error en importación:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
