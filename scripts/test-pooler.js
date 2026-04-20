const { Client } = require("pg");
require("dotenv").config();

async function main() {
  console.log("Probando la conexión idéntica a la que hace Vercel (Puerto 6543)...");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // <-- Usamos la del Pooler
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

    console.log("Tablas encontradas desde el Pooler (6543):");
    res.rows.forEach(row => console.log("- " + row.table_name));

    if (res.rows.length === 0) {
      console.log("⚠️ LA BASE DE DATOS ESTÁ VACÍA VÍA POOLER (Ese es el problema de Vercel).");
    }
  } catch (err) {
    console.error("Error catastrófico en Pooler:", err.message);
  } finally {
    await client.end();
  }
}

main();
