const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
  console.log("Conectando directo a la BD (Sin Prisma)...");
  
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Conexión exitosa a Supabase.");

    const rawPassword = "admin12345";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    
    console.log("Aplicando el Hash matemático...");

    // Actualiza al usuario administrador
    const res = await client.query(
      `UPDATE "User" SET "password" = $1 WHERE "email" = 'admin@artecapital.com'`,
      [hashedPassword]
    );

    if (res.rowCount > 0) {
      console.log(`✅ ¡Contraseña de administrador actualizada exitosamente! (Hasheada)`);
    } else {
      console.log(`❌ No se encontró el usuario admin@artecapital.com en la tabla.`);
    }

  } catch (err) {
    console.error("❌ Error de actualización nativa:", err);
  } finally {
    await client.end();
  }
}

main();
