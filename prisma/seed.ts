import { PrismaClient, Role, AccountStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({
  connectionString,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing all sample data from database...');
  
  // Clean up in reverse relation dependency order
  await prisma.processAuditLog.deleteMany({});
  await prisma.punchListDefect.deleteMany({});
  await prisma.civilWorksMilestone.deleteMany({});
  await prisma.buyerKyc.deleteMany({});
  await prisma.titlePermitTracker.deleteMany({});
  await prisma.installmentLedger.deleteMany({});
  await prisma.clientPackage.deleteMany({});
  await prisma.weeklyProgressLog.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.landParcel.deleteMany({});
  await prisma.contractor.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.projectTask.deleteMany({});
  await prisma.dailySiteLog.deleteMany({});
  await prisma.projectDocument.deleteMany({});
  await prisma.projectRisk.deleteMany({});
  await prisma.changeOrder.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding core authenticator accounts (Admin & Inspector)...');
  
  // Admin User (COO)
  await prisma.user.create({
    data: {
      email: 'angelfiremaui_03@yahoo.com',
      name: 'Mauro R. Principe Jr. (Chief Operating Officer)',
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: hashPassword('admin123'),
      contact: '+63 900 000 0000',
    },
  });

  // Inspector User (Field Site Monitor)
  await prisma.user.create({
    data: {
      email: 'ricardo@jramrealty.com',
      name: 'Engr. Ricardo Gomez (Site Lead)',
      role: Role.INSPECTOR,
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: hashPassword('inspector123'),
      contact: '+63 900 111 2222',
    },
  });

  console.log('Seeding initial system initialization audit record...');
  await prisma.processAuditLog.create({
    data: {
      entityType: 'PARCEL',
      entityId: 'SYSTEM',
      action: 'CLEAN_SLATE_INITIALIZED',
      actorName: 'Mauro R. Principe Jr.',
      actorRole: 'ADMIN',
      details: 'System database initialized with zero sample data. Ready for fresh step-by-step project lifecycle testing.',
    }
  });

  console.log('100% Clean Slate Initialized with 0 sample records! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
