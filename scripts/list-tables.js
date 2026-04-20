const { Client } = require("pg");
require("dotenv").config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Consulta para mostrar las tablas en el schema "public"
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    console.log("Tablas en tu Supabase:");
    res.rows.forEach(row => console.log("- " + row.table_name));

    if (res.rows.length === 0) {
      console.log("⚠️ LA BASE DE DATOS ESTÁ VACÍA (No existen tablas).");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
