import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const rawPassword = "GerJuaWen@2026#";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    
    const user = await prisma.user.update({
      where: { email: "admin@artecapital.com" },
      data: { password: hashedPassword },
    });

    if (user) {
      return NextResponse.json({
        mensaje: "¡EJECUTADO EN LA NUBE! Contraseña maestra cambiada exitosamente a GerJuaWen@2026# en Producción.",
        exito: true
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      mensaje: "Fallo durante el cambio en producción",
      error: error.message || error.toString()
    });
  }
}
