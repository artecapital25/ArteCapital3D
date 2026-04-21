import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const rawPassword = "GerJuaWen@2026#";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    
    // Actualizamos masivamente ambos administradores del panel en la base de datos Productiva
    const result = await prisma.user.updateMany({
      where: { 
        email: { 
          in: ["admin@artecapital.com", "admin@admin3d.com"] 
        } 
      },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      mensaje: `¡EJECUTADO EN LA NUBE VERCEL! Se actualizó exitosamente la contraseña de ${result.count} cuentas administradoras a: GerJuaWen@2026#`,
      exito: true
    });

  } catch (error: any) {
    return NextResponse.json({
      mensaje: "Fallo durante el cambio en producción",
      error: error.message || error.toString()
    });
  }
}
