import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech');
const pool = new Pool({
  connectionString,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
});

const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
console.log('Tables in database:');
r.rows.forEach(row => console.log(' -', row.tablename));
await pool.end();
