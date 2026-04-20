import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pw = searchParams.get("pw") || "admin12345";
  const email = "admin@artecapital.com";

  try {
    // 1. Check database connectivity
    console.log("[DEBUG] Verificando conexión a base de datos...");
    const userCount = await prisma.user.count();
    
    // 2. Query user
    console.log(`[DEBUG] Buscando usuario: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        step: "find_user",
        error: "Usuario no encontrado en la base de datos de Vercel",
        dbConnected: true,
        totalUsersInDb: userCount,
      });
    }

    // 3. Test Bcrypt logic
    console.log("[DEBUG] Validando contraseña con bcrypt...");
    const isValid = await bcrypt.compare(pw, user.password);

    return NextResponse.json({
      success: isValid,
      step: "bcrypt_compare",
      dbConnected: true,
      userFound: true,
      userRole: user.role,
      passwordMatch: isValid,
      totalUsersInDb: userCount,
      dbUrlMode: process.env.DATABASE_URL?.includes("6543") ? "POOLER" : "DIRECT",
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    });

  } catch (error: any) {
    console.error("[DEBUG] Excepción general:", error);
    return NextResponse.json({
      success: false,
      step: "exception",
      error: error.message || error.toString(),
      isDatabaseError: error.message?.includes("Prisma"),
    }, { status: 500 });
  }
}
