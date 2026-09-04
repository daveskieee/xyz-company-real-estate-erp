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

const tables = [
  'users', 'land_parcels', 'slots', 'contractors', 'civil_works_milestones',
  'punch_list_defects', 'process_audit_logs', 'payroll_records',
  'project_tasks', 'daily_site_logs', 'project_documents', 'project_risks',
  'change_orders', 'daily_manpower_audits', 'client_packages',
  'installment_ledgers', 'title_permit_trackers', 'buyer_kyc',
  'government_permits', 'schedule_events', 'commercial_projects',
  'extended_payroll', 'labor_allocations', 'ai_manpower_recommendations',
];

let allClear = true;
for (const t of tables) {
  const r = await pool.query(`SELECT COUNT(*) FROM "${t}"`);
  const count = parseInt(r.rows[0].count, 10);
  const icon = count === 0 ? '✅' : (t === 'users' ? '👤' : '⚠️ HAS DATA');
  console.log(`${icon.padEnd(4)} ${t.padEnd(35)} ${count} rows`);
  if (count > 0 && t !== 'users') allClear = false;
}

console.log(allClear ? '\n✅ All tables clean — ready for live data!' : '\n⚠️  Some tables still contain data!');
await pool.end();
