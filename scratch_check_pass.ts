import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const connectionString = process.env.DATABASE_URL || '';
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({ connectionString, ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}) });

async function main() {
  const hash = hashPassword('admin123');
  await pool.query('UPDATE users SET "passwordHash" = $1 WHERE email = $2', [hash, 'davematthewreglos@gmail.com']);
  console.log('Updated davematthewreglos@gmail.com password to admin123');
  await pool.end();
}
main();
