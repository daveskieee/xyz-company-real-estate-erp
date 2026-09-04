/**
 * Wipes ALL data from every operational table.
 * Preserves: admin and inspector user accounts.
 */
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({
  connectionString,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
});

async function wipeAllData() {
  const client = await pool.connect();
  try {
    console.log('🧹 Wiping all data (keeping admin/inspector accounts)...\n');

    // All operational tables in safe delete order (children before parents)
    const tables = [
      'process_audit_logs',
      'punch_list_defects',
      'civil_works_milestones',
      'buyer_kyc',
      'title_permit_trackers',
      'installment_ledgers',
      'client_packages',
      'weekly_progress_logs',
      'slots',
      'land_parcels',
      'contractors',
      'daily_manpower_audits',
      'payroll_records',
      'project_tasks',
      'daily_site_logs',
      'project_documents',
      'project_risks',
      'change_orders',
      // Raw pool-managed tables
      'government_permits',
      'schedule_events',
      'commercial_projects',
      'extended_payroll',
      'labor_allocations',
      'ai_manpower_recommendations',
      'fitout_quotations',
    ];

    for (const t of tables) {
      try {
        const r = await client.query(`DELETE FROM "${t}"`);
        console.log(`✓ ${t.padEnd(35)} ${r.rowCount} rows deleted`);
      } catch (e) {
        console.log(`⚠ ${t.padEnd(35)} ERROR: ${e.message.slice(0, 60)}`);
      }
    }

    // Delete CLIENT users only (keep ADMIN and INSPECTOR)
    const r = await client.query(`DELETE FROM users WHERE role = 'CLIENT'`);
    console.log(`✓ ${'users (CLIENT only)'.padEnd(35)} ${r.rowCount} rows deleted`);

    console.log('\n✅ Done! Database is clean.');
    console.log('   ➜ All projects, payroll, permits, clients, tasks etc. removed.');
    console.log('   ➜ Admin and Inspector accounts preserved.\n');

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

wipeAllData();
