import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

const { Pool } = pg;
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({
  connectionString,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function updateAdmin() {
  const client = await pool.connect();
  try {
    // Show current users
    const current = await client.query('SELECT id, email, name, role FROM users ORDER BY "createdAt"');
    console.log('Current users:');
    current.rows.forEach(u => console.log(`  [${u.role}] ${u.email} — ${u.name}`));
    console.log('');

    // Delete ALL existing users (old admin + old inspector)
    const del = await client.query('DELETE FROM users');
    console.log(`Deleted ${del.rowCount} old user(s).`);

    // Create single ADMIN account
    const newHash = hashPassword('admin123');
    const newId = `USER-ADMIN-${Date.now()}`;
    
    await client.query(`
      INSERT INTO users (id, email, name, role, "accountStatus", "passwordHash", contact, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE', $4, '', NOW(), NOW())
    `, [newId, 'davematthewreglos@gmail.com', 'Dave Matthew Reglos', newHash]);

    console.log('✅ New admin account created:');
    console.log('   Email   : davematthewreglos@gmail.com');
    console.log('   Password: admin123');
    console.log('   Role    : ADMIN');

    // Verify
    const verify = await client.query('SELECT id, email, name, role FROM users');
    console.log('\nVerification:');
    verify.rows.forEach(u => console.log(`  [${u.role}] ${u.email} — ${u.name}`));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAdmin();
