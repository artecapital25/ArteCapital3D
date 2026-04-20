import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import FormatoCOT from "@/components/pdf/FormatoCOT";
import FormatoCC from "@/components/pdf/FormatoCC";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || "cot";

    // Load cotización with relations
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            nombre: true,
            codigo: true,
            nit: true,
            telefono: true,
            correo: true,
          },
        },
        maquina: {
          select: { nombre: true, tipo: true },
        },
        resina: {
          select: { tipo: true, marca: true, color: true },
        },
      },
    });

    if (!cotizacion) {
      return NextResponse.json(
        { error: "Cotización no encontrada" },
        { status: 404 }
      );
    }

    let pdfBuffer: Uint8Array;
    let filename: string;

    if (tipo === "cc") {
      // Cuenta de Cobro
      const ccNumber = cotizacion.numeroCot.replace("COT", "CC");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await (renderToBuffer as any)(
        React.createElement(FormatoCC, { cotizacion })
      );
      filename = `${ccNumber}.pdf`;
    } else {
      // Cotización (default)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await (renderToBuffer as any)(
        React.createElement(FormatoCOT, { cotizacion })
      );
      filename = `${cotizacion.numeroCot}.pdf`;
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
