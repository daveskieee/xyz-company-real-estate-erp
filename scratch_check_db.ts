import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({ connectionString, ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}) });

async function main() {
  const users = await pool.query('SELECT id, email, name, role, "passwordHash" FROM users');
  console.log('USERS IN DB:', users.rows);
  await pool.end();
}
main();
