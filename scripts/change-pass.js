const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
  const client = new Client({
    connectionString: `postgresql://postgres:GerWenJua%402026%23@db.imkwvaifkkkgeqooxsmm.supabase.co:5432/postgres`, 
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const rawPassword = "GerJuaWen@2026#";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    
    const res = await client.query(
      `UPDATE "User" SET "password" = $1 WHERE "email" = 'admin@artecapital.com'`,
      [hashedPassword]
    );

    if (res.rowCount > 0) {
      console.log(`✅ Contraseña del sistema actualizada con éxito.`);
    } else {
      console.log(`❌ Usuario no encontrado.`);
    }
  } catch (err) {
    console.error("Error cambiando la clave:", err.message);
  } finally {
    await client.end();
  }
}

main();
