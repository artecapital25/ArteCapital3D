import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_test");

const SENDER_EMAIL =
  process.env.NODE_ENV === "production"
    ? "pedidos@artecapital.com" // Reemplazar con el dominio verificado posteriormente
    : "onboarding@resend.dev"; // Requisito de Resend para cuentas en desarrollo

const REPLY_TO_EMAIL = "wjgeeks3d@gmail.com";

interface EmailPayload {
  to: string;
  subject: string;
  clienteNombre: string;
  numeroPedido: string;
  item: string;
  estado: "EN_ENVIO" | "ENTREGADO";
}

export async function enviarNotificacionPedido(payload: EmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ Simulación de Email (No hay RESEND_API_KEY):");
    console.log(payload);
    return { success: true, simulated: true };
  }

  const { to, subject, clienteNombre, numeroPedido, item, estado } = payload;

  const colorPrincipal = "#00b4d8";
  const title = estado === "EN_ENVIO" ? "¡Tu pedido va en camino! 🚚" : "¡Pedido Entregado! 🎉";
  const msgText =
    estado === "EN_ENVIO"
      ? "Nos emociona informarte que tu pedido ya fue despachado y está en camino hacia ti."
      : "Tu pedido ha sido marcado como entregado. ¡Esperamos que lo disfrutes!";

  const htmlTemplate = `
    <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 2rem; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- CABECERA -->
        <div style="background-color: #0e0e1a; padding: 2rem; text-align: center; border-bottom: 3px solid ${colorPrincipal};">
          <h1 style="color: ${colorPrincipal}; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Arte Capital</h1>
          <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Precisión Creativa · Impresión 3D</p>
        </div>

        <!-- CUERPO -->
        <div style="padding: 2.5rem 2rem;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Hola, ${clienteNombre}</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">
            ${title}
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">
            ${msgText}
          </p>

          <div style="background: #f1f5f9; border-left: 4px solid ${colorPrincipal}; padding: 1rem 1.5rem; border-radius: 0 4px 4px 0; margin: 2rem 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Detalles del pedido</p>
            <p style="margin: 8px 0 4px; font-size: 16px; font-weight: 600; color: #0f172a;"># ${numeroPedido}</p>
            <p style="margin: 0; font-size: 15px; color: #475569;">Item: ${item}</p>
          </div>

          <p style="font-size: 14px; margin-top: 2rem; color: #64748b;">
            Si tienes alguna duda o inconveniente, simplemente responde este correo a <a href="mailto:${REPLY_TO_EMAIL}" style="color: ${colorPrincipal};">${REPLY_TO_EMAIL}</a> o contáctanos por nuestros canales oficiales.
          </p>
        </div>

        <!-- PIE -->
        <div style="background-color: #f8fafc; padding: 1.5rem; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Arte Capital. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: `Arte Capital <${SENDER_EMAIL}>`,
      to: [to],
      replyTo: REPLY_TO_EMAIL,
      subject: subject,
      html: htmlTemplate,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: "Fallo desconocido al enviar email" };
  }
}
