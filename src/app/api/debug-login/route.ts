import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Intentamos hacer un query en crudo (RAW) saltándonos el chequeo de modelos de Prisma
    const dbName: any[] = await prisma.$queryRaw`SELECT current_database();`;
    const userRole: any[] = await prisma.$queryRaw`SELECT current_user;`;
    
    // Consultar las tablas existentes en esta DB fantasma de Vercel
    const tables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    // Obtener la string limpia que está viendo Vercel sin exponer la clave
    const rawUrl = process.env.DATABASE_URL || "";
    let safeUrl = rawUrl;
    if (safeUrl.includes("@")) {
      const parts = safeUrl.split("@");
      const prefix = parts[0].substring(0, parts[0].indexOf(":") + 3);
      safeUrl = prefix + "***oculto***@" + parts[1];
    } else {
      safeUrl = "Formato de URL irreconocible o vacía";
    }

    return NextResponse.json({
      mensaje: "Investigación Forense de Vercel",
      baseDeDatosActual: dbName[0]?.current_database || "Desconocida",
      usuarioConectado: userRole[0]?.current_user || "Desconocido",
      urlExactaInterpretada: safeUrl,
      tablasEncontradas: tables.map(t => t.table_name),
      tieneComillasLaUrl: rawUrl.startsWith('"') || rawUrl.endsWith('"'),
      nextAuthSecretExiste: !!process.env.NEXTAUTH_SECRET,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      paso: "falla_conexion_extrema",
      error: error.message || error.toString(),
      urlExactaInterpretada: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***oculto***@"),
    }, { status: 500 });
  }
}
