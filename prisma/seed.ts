import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...\n");

  // ==========================================
  // 1. CREAR USUARIO ADMIN
  // ==========================================
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin3d.com" },
    update: {},
    create: {
      email: "admin@admin3d.com",
      name: "Administrador",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Usuario admin creado: ${admin.email}`);

  // ==========================================
  // 2. CREAR DATOS DE EJEMPLO - PERSONAL
  // ==========================================
  const personal = await prisma.personal.createMany({
    data: [
      {
        nombre: "Operario Principal",
        valorHora: 15000,
        valorMinuto: 250,
      },
      {
        nombre: "Técnico Senior",
        valorHora: 20000,
        valorMinuto: 333,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Personal creado: ${personal.count} registros`);

  // ==========================================
  // 3. CREAR DATOS DE EJEMPLO - MÁQUINAS
  // ==========================================
  const maquinas = await prisma.maquina.createMany({
    data: [
      {
        nombre: "Impresora Resina #1",
        tipo: "impresora",
        consumoEnergia: 0.12,
        valorMinuto: 50,
      },
      {
        nombre: "Impresora Resina #2",
        tipo: "impresora",
        consumoEnergia: 0.15,
        valorMinuto: 55,
      },
      {
        nombre: "Estación de Curado UV",
        tipo: "curado",
        consumoEnergia: 0.08,
        valorMinuto: 30,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Máquinas creadas: ${maquinas.count} registros`);

  // ==========================================
  // 4. CREAR DATOS DE EJEMPLO - RESINAS
  // ==========================================
  const resinas = await prisma.resina.createMany({
    data: [
      {
        tipo: "Standard",
        marca: "Elegoo",
        color: "Gris",
        volumenLitros: 1,
        densidad: 1.1,
        pesoGramos: 1100,
        valor: 80000,
        valorGramo: 72.73,
        velocidadImpresion: 30,
        resumen: "Resina estándar para prototipos",
      },
      {
        tipo: "ABS-Like",
        marca: "Elegoo",
        color: "Negro",
        volumenLitros: 1,
        densidad: 1.12,
        pesoGramos: 1120,
        valor: 95000,
        valorGramo: 84.82,
        velocidadImpresion: 25,
        resumen: "Resina tipo ABS para piezas funcionales",
      },
      {
        tipo: "Flexible",
        marca: "Siraya Tech",
        color: "Transparente",
        volumenLitros: 0.5,
        densidad: 1.08,
        pesoGramos: 540,
        valor: 120000,
        valorGramo: 222.22,
        velocidadImpresion: 20,
        resumen: "Resina flexible para juntas y sellos",
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Resinas creadas: ${resinas.count} registros`);

  // ==========================================
  // 5. CREAR DATOS DE EJEMPLO - INSUMOS
  // ==========================================
  const insumos = await prisma.insumo.createMany({
    data: [
      {
        codigoItem: "INS-001",
        nombre: "Alcohol Isopropílico 99%",
        marca: "Genérico",
        categoria: "Limpieza",
        volumen: 1,
        valor: 25000,
        valorUnidad: 25000,
        stock: 5,
        stockMinimo: 2,
      },
      {
        codigoItem: "INS-002",
        nombre: "Guantes Nitrilo (caja x100)",
        marca: "Genérico",
        categoria: "Seguridad",
        valor: 35000,
        valorUnidad: 350,
        stock: 3,
        stockMinimo: 1,
      },
      {
        codigoItem: "INS-003",
        nombre: "Película FEP",
        marca: "Elegoo",
        categoria: "Repuestos",
        valor: 45000,
        valorUnidad: 45000,
        stock: 2,
        stockMinimo: 1,
      },
      {
        codigoItem: "INS-004",
        nombre: "Pintura Acrílica Mate",
        marca: "Tamiya",
        categoria: "Acabado",
        volumen: 0.1,
        valor: 18000,
        valorUnidad: 180000,
        stock: 8,
        stockMinimo: 3,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Insumos creados: ${insumos.count} registros`);

  // ==========================================
  // 6. CREAR DATOS DE EJEMPLO - CLIENTES
  // ==========================================
  const clientes = await prisma.cliente.createMany({
    data: [
      {
        codigo: "CLI-001",
        nombre: "Industrias Tech S.A.S",
        nit: "900123456-7",
        telefono: "3001234567",
        correo: "contacto@industriastech.com",
        informacion: "Cliente frecuente, pedidos mensuales",
      },
      {
        codigo: "CLI-002",
        nombre: "Prototipos Rápidos Ltda",
        nit: "800987654-3",
        telefono: "3109876543",
        correo: "ventas@prototipos.com",
        informacion: "Especializado en prototipos funcionales",
      },
      {
        codigo: "CLI-003",
        nombre: "Carlos Martínez",
        telefono: "3205551234",
        correo: "carlos.m@gmail.com",
        informacion: "Cliente individual, coleccionista de miniaturas",
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Clientes creados: ${clientes.count} registros`);

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📋 Credenciales de acceso:");
  console.log("   Email: admin@admin3d.com");
  console.log("   Password: admin123");
  console.log("\n⚠️  Recuerda cambiar la contraseña en producción!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
