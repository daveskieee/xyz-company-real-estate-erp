import { PrismaClient, Role, SlotStatus, PaymentMethod, PaymentStatus, PayrollRole, DisbursementType, PayrollStatus, AccountStatus } from '@prisma/client';
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
  console.log('Clearing existing database entries...');
  
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
  await prisma.user.deleteMany({});

  console.log('Seeding contractors...');
  const contractors = [
    {
      id: 'CONT-001',
      name: 'Laguna Geodetic Earthmovers',
      company: 'Laguna Geodetic & Earthmovers Inc.',
      specialty: 'Land Leveling & Grading',
      contractAmount: 120000,
      paidAmount: 85000,
      activeManpower: 16,
      milestoneProgress: 85,
      rating: 4.8,
      contact: '+63 917 111 2222',
      activeProjectSite: 'Laguna Project Site A',
    },
    {
      id: 'CONT-002',
      name: 'Calabarzon Road Masters',
      company: 'Calabarzon Pavement & Highway Builders',
      specialty: 'Road Paving & Curbs',
      contractAmount: 180000,
      paidAmount: 95000,
      activeManpower: 28,
      milestoneProgress: 65,
      rating: 4.5,
      contact: '+63 918 333 4444',
      activeProjectSite: 'Calabarzon Project Site B',
    },
    {
      id: 'CONT-003',
      name: 'Agua-Laguna Drainage Corp',
      company: 'Agua-Laguna Drainage & Structural Engineering',
      specialty: 'Civil Drainage & Utilities',
      contractAmount: 75000,
      paidAmount: 30000,
      activeManpower: 14,
      milestoneProgress: 50,
      rating: 4.3,
      contact: '+63 919 555 6666',
      activeProjectSite: 'Laguna Drainage Site C',
    },
  ];

  for (const c of contractors) {
    await prisma.contractor.create({ data: c });
  }

  console.log('Seeding users (Admin, Inspectors, Clients)...');
  
  // Admin User (Password: admin123)
  const adminUser = await prisma.user.create({
    data: {
      email: 'angelfiremaui_03@yahoo.com',
      name: 'Mauro R. Principe Jr. (Chief Operating Officer)',
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: hashPassword('admin123'),
      contact: '+63 900 000 0000',
    },
  });

  // Inspector User (Password: inspector123)
  const inspectorUser = await prisma.user.create({
    data: {
      email: 'ricardo@jramrealty.com',
      name: 'Engr. Ricardo Gomez (Site Monitor)',
      role: Role.INSPECTOR,
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: hashPassword('inspector123'),
      contact: '+63 900 111 2222',
    },
  });

  // Client Users (Default password: client123)
  const clientData = [
    { id: 'CLI-001', name: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', contact: '+63 917 123 4567', status: AccountStatus.ACTIVE },
    { id: 'CLI-002', name: 'Dave Matthew Reglos', email: 'davematthewreglos@gmail.com', contact: '+63 928 987 6543', status: AccountStatus.ACTIVE },
    { id: 'CLI-003', name: 'Maria Regina Santos', email: 'maria.santos@example.com', contact: '+63 915 222 3344', status: AccountStatus.ACTIVE },
    { id: 'CLI-004', name: 'Emilio Alcantara', email: 'emilio.alcantara@example.com', contact: '+1 415 555 2671', status: AccountStatus.ACTIVE },
    { id: 'CLI-005', name: 'Clarissa Reyes', email: 'clarissa.reyes@example.com', contact: '+63 905 444 8888', status: AccountStatus.ACTIVE },
    { id: 'CLI-006', name: 'Francis Laurel', email: 'francis.laurel@example.com', contact: '+63 947 122 9988', status: AccountStatus.INVITED, inviteToken: 'demo-handover-token-2026' },
  ];

  for (const c of clientData) {
    await prisma.user.create({
      data: {
        id: c.id,
        email: c.email,
        name: c.name,
        role: Role.CLIENT,
        accountStatus: c.status,
        passwordHash: c.status === AccountStatus.ACTIVE ? hashPassword('client123') : null,
        inviteToken: c.inviteToken || null,
        inviteTokenExpiry: c.inviteToken ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        contact: c.contact,
      },
    });

    // Seed Buyer KYC
    await prisma.buyerKyc.create({
      data: {
        userId: c.id,
        govtIdVerified: true,
        tinVerified: c.id !== 'CLI-003',
        proofOfIncomeVerified: true,
        proofOfAddressVerified: true,
        maritalConsentVerified: c.id !== 'CLI-005',
        kycStatus: c.id === 'CLI-003' || c.id === 'CLI-005' ? 'UNDER_REVIEW' : 'VERIFIED',
        verifiedAt: new Date(),
        notes: 'Documents verified against Philippine national registry records.',
      }
    });
  }

  console.log('Seeding LandParcels & Civil Works Milestones...');
  const parcel = await prisma.landParcel.create({
    data: {
      id: 'PARCEL-CST',
      name: 'Cavinti Highland Crest',
      location: 'Brgy. Santiaguel, Cavinti, Laguna',
      purchaseCost: 450000,
      totalAreaSqm: 10000,
      totalSlots: 20,
      acquisitionDate: new Date('2026-01-10'),
    },
  });

  const civilMilestones = [
    {
      parcelId: 'PARCEL-CST',
      phaseName: 'Phase A: Boundary Staking & Land Grading',
      targetPercentage: 100,
      currentPercentage: 100,
      status: 'COMPLETED',
      inspectorSignOff: true,
      signOffDate: new Date('2026-02-15'),
      remarks: 'Topographic contouring and plot staking 100% compliant with approved subdivision plan.',
    },
    {
      parcelId: 'PARCEL-CST',
      phaseName: 'Phase B: Road Network & Concrete Curbing',
      targetPercentage: 100,
      currentPercentage: 85,
      status: 'IN_PROGRESS',
      inspectorSignOff: false,
      remarks: '6.5-meter spine road subgrade compacted with gravel base course. Curb pouring ongoing.',
    },
    {
      parcelId: 'PARCEL-CST',
      phaseName: 'Phase C: Storm Drainage & RCBC Culverts',
      targetPercentage: 100,
      currentPercentage: 70,
      status: 'IN_PROGRESS',
      inspectorSignOff: false,
      remarks: 'Reinforced concrete culverts laid along main drainage outfall with slope verification.',
    },
    {
      parcelId: 'PARCEL-CST',
      phaseName: 'Phase D: Water Reticulation & Power Grid Post Lines',
      targetPercentage: 100,
      currentPercentage: 45,
      status: 'IN_PROGRESS',
      inspectorSignOff: false,
      remarks: 'Main pipeline trenches dug. Meralco electrification pole layout submitted to LGU.',
    },
    {
      parcelId: 'PARCEL-CST',
      phaseName: 'Phase E: Security Perimeter & Subdivision Gate',
      targetPercentage: 100,
      currentPercentage: 20,
      status: 'IN_PROGRESS',
      inspectorSignOff: false,
      remarks: 'Perimeter concrete hollow block foundation poured on eastern parcel boundary.',
    },
  ];

  for (const m of civilMilestones) {
    await prisma.civilWorksMilestone.create({ data: m });
  }

  console.log('Seeding slots with full lifecycle states...');
  const slots = [
    // Row 1
    { id: 'SLOT-01', parcelId: 'PARCEL-CST', slotNumber: 1, sizeSqm: 500, price: 45000, status: SlotStatus.UNDER_CONTRACT, row: 1, col: 1 },
    { id: 'SLOT-02', parcelId: 'PARCEL-CST', slotNumber: 2, sizeSqm: 500, price: 45000, status: SlotStatus.AVAILABLE, row: 1, col: 2 },
    { id: 'SLOT-03', parcelId: 'PARCEL-CST', slotNumber: 3, sizeSqm: 500, price: 45000, status: SlotStatus.TITLING_PHASE, row: 1, col: 3 },
    { id: 'SLOT-04', parcelId: 'PARCEL-CST', slotNumber: 4, sizeSqm: 500, price: 45000, status: SlotStatus.DEVELOPING, row: 1, col: 4 },
    { id: 'SLOT-05', parcelId: 'PARCEL-CST', slotNumber: 5, sizeSqm: 500, price: 45000, status: SlotStatus.RESERVED, row: 1, col: 5 },
    // Row 2
    { id: 'SLOT-06', parcelId: 'PARCEL-CST', slotNumber: 6, sizeSqm: 500, price: 48000, status: SlotStatus.AVAILABLE, row: 2, col: 1 },
    { id: 'SLOT-07', parcelId: 'PARCEL-CST', slotNumber: 7, sizeSqm: 500, price: 48000, status: SlotStatus.AVAILABLE, row: 2, col: 2 },
    { id: 'SLOT-08', parcelId: 'PARCEL-CST', slotNumber: 8, sizeSqm: 500, price: 48000, status: SlotStatus.HANDED_OVER, row: 2, col: 3 },
    { id: 'SLOT-09', parcelId: 'PARCEL-CST', slotNumber: 9, sizeSqm: 500, price: 48000, status: SlotStatus.AVAILABLE, row: 2, col: 4 },
    { id: 'SLOT-10', parcelId: 'PARCEL-CST', slotNumber: 10, sizeSqm: 500, price: 48000, status: SlotStatus.DEVELOPING, row: 2, col: 5 },
    // Row 3
    { id: 'SLOT-11', parcelId: 'PARCEL-CST', slotNumber: 11, sizeSqm: 500, price: 50000, status: SlotStatus.AVAILABLE, row: 3, col: 1 },
    { id: 'SLOT-12', parcelId: 'PARCEL-CST', slotNumber: 12, sizeSqm: 500, price: 50000, status: SlotStatus.TURNOVER_READY, row: 3, col: 2 },
    { id: 'SLOT-13', parcelId: 'PARCEL-CST', slotNumber: 13, sizeSqm: 500, price: 50000, status: SlotStatus.AVAILABLE, row: 3, col: 3 },
    { id: 'SLOT-14', parcelId: 'PARCEL-CST', slotNumber: 14, sizeSqm: 500, price: 50000, status: SlotStatus.AVAILABLE, row: 3, col: 4 },
    { id: 'SLOT-15', parcelId: 'PARCEL-CST', slotNumber: 15, sizeSqm: 500, price: 50000, status: SlotStatus.AVAILABLE, row: 3, col: 5 },
    // Row 4
    { id: 'SLOT-16', parcelId: 'PARCEL-CST', slotNumber: 16, sizeSqm: 500, price: 52000, status: SlotStatus.AVAILABLE, row: 4, col: 1 },
    { id: 'SLOT-17', parcelId: 'PARCEL-CST', slotNumber: 17, sizeSqm: 500, price: 52000, status: SlotStatus.AVAILABLE, row: 4, col: 2 },
    { id: 'SLOT-18', parcelId: 'PARCEL-CST', slotNumber: 18, sizeSqm: 500, price: 52000, status: SlotStatus.AVAILABLE, row: 4, col: 3 },
    { id: 'SLOT-19', parcelId: 'PARCEL-CST', slotNumber: 19, sizeSqm: 500, price: 52000, status: SlotStatus.UNDER_CONTRACT, row: 4, col: 4 },
    { id: 'SLOT-20', parcelId: 'PARCEL-CST', slotNumber: 20, sizeSqm: 500, price: 52000, status: SlotStatus.AVAILABLE, row: 4, col: 5 },
  ];

  for (const s of slots) {
    await prisma.slot.create({ data: s });
  }

  console.log('Seeding ClientPackages & Comprehensive Title Trackers...');
  
  const clientPackages = [
    {
      userId: 'CLI-001',
      slotId: 'SLOT-01',
      price: 50000,
      packageType: 'Land Plot + DHSUD Grading Access',
      paymentMethod: PaymentMethod.INSTALLMENT,
      titleMilestones: {
        currentPhase: 'Contract to Sell (CTS) Executed',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: true,
        ctsSigned: true,
        deedOfSaleSigned: false,
        birEcarIssued: false,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
        tctNumber: null,
        taxDecNumber: null,
      },
      payments: [
        { dueDate: new Date('2026-02-15'), amountDue: 1500, amountPaid: 1500, paymentDate: new Date('2026-02-14'), status: PaymentStatus.PAID },
        { dueDate: new Date('2026-03-15'), amountDue: 1500, amountPaid: 1500, paymentDate: new Date('2026-03-15'), status: PaymentStatus.PAID },
      ],
    },
    {
      userId: 'CLI-002',
      slotId: 'SLOT-03',
      price: 52000,
      packageType: 'Land Plot + Pagsanjan Road Access System',
      paymentMethod: PaymentMethod.INSTALLMENT,
      titleMilestones: {
        currentPhase: 'BIR eCAR & Capital Gains Tax Clearance',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: true,
        ctsSigned: true,
        deedOfSaleSigned: true,
        birEcarIssued: true,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
        tctNumber: 'PENDING-RD-0892',
        taxDecNumber: 'TD-2026-CVNT-0891',
      },
      payments: [
        { dueDate: new Date('2026-03-01'), amountDue: 2000, amountPaid: 2000, paymentDate: new Date('2026-02-28'), status: PaymentStatus.PAID },
      ],
    },
    {
      userId: 'CLI-003',
      slotId: 'SLOT-05',
      price: 47000,
      packageType: 'Land Plot + Sta. Cruz Municipal Leveling Grade',
      paymentMethod: PaymentMethod.INSTALLMENT,
      titleMilestones: {
        currentPhase: 'Reservation & Buyer KYC Verification',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: false,
        ctsSigned: false,
        deedOfSaleSigned: false,
        birEcarIssued: false,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
        tctNumber: null,
        taxDecNumber: null,
      },
      payments: [],
    },
    {
      userId: 'CLI-004',
      slotId: 'SLOT-08',
      price: 48000,
      packageType: 'Premium Land slot + Cavinti Drainage Culvert',
      paymentMethod: PaymentMethod.SPOT_CASH,
      titleMilestones: {
        currentPhase: 'Title Transferred & Property Handed Over',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: true,
        ctsSigned: true,
        deedOfSaleSigned: true,
        birEcarIssued: true,
        taxDeclarationTransferred: true,
        registryOfDeedsTctReleased: true,
        certificateOfAcceptanceSigned: true,
        tctNumber: 'TCT-2026-0049182-RD-LAGUNA',
        taxDecNumber: 'TD-2026-CVNT-9982-A',
      },
      payments: [],
    },
    {
      userId: 'CLI-005',
      slotId: 'SLOT-12',
      price: 51000,
      packageType: 'Land Plot + Road Aggregates Subbase',
      paymentMethod: PaymentMethod.INSTALLMENT,
      titleMilestones: {
        currentPhase: 'Registry of Deeds TCT Released (Turnover Ready)',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: true,
        ctsSigned: true,
        deedOfSaleSigned: true,
        birEcarIssued: true,
        taxDeclarationTransferred: true,
        registryOfDeedsTctReleased: true,
        certificateOfAcceptanceSigned: false,
        tctNumber: 'TCT-2026-0058291-RD-LAGUNA',
        taxDecNumber: 'TD-2026-CVNT-7712-B',
      },
      payments: [],
    },
    {
      userId: 'CLI-006',
      slotId: 'SLOT-19',
      price: 53000,
      packageType: 'Land Plot + Full Road Access & Concrete Culverts',
      paymentMethod: PaymentMethod.INSTALLMENT,
      titleMilestones: {
        currentPhase: 'Contract to Sell (CTS) Executed',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: true,
        dhsudLicenseToSell: true,
        ctsSigned: true,
        deedOfSaleSigned: false,
        birEcarIssued: false,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
        tctNumber: null,
        taxDecNumber: null,
      },
      payments: [],
    },
  ];

  for (const pkg of clientPackages) {
    const createdPkg = await prisma.clientPackage.create({
      data: {
        userId: pkg.userId,
        slotId: pkg.slotId,
        price: pkg.price,
        packageType: pkg.packageType,
        paymentMethod: pkg.paymentMethod,
      },
    });

    await prisma.titlePermitTracker.create({
      data: {
        clientPackageId: createdPkg.id,
        currentPhase: pkg.titleMilestones.currentPhase,
        motherTitleVerified: pkg.titleMilestones.motherTitleVerified,
        darClearanceApproved: pkg.titleMilestones.darClearanceApproved,
        lguPermitIssued: pkg.titleMilestones.lguPermitIssued,
        dhsudLicenseToSell: pkg.titleMilestones.dhsudLicenseToSell,
        ctsSigned: pkg.titleMilestones.ctsSigned,
        deedOfSaleSigned: pkg.titleMilestones.deedOfSaleSigned,
        birEcarIssued: pkg.titleMilestones.birEcarIssued,
        taxDeclarationTransferred: pkg.titleMilestones.taxDeclarationTransferred,
        registryOfDeedsTctReleased: pkg.titleMilestones.registryOfDeedsTctReleased,
        certificateOfAcceptanceSigned: pkg.titleMilestones.certificateOfAcceptanceSigned,
        tctNumber: pkg.titleMilestones.tctNumber,
        taxDecNumber: pkg.titleMilestones.taxDecNumber,
      },
    });

    for (const pay of pkg.payments) {
      await prisma.installmentLedger.create({
        data: {
          clientPackageId: createdPkg.id,
          dueDate: pay.dueDate,
          amountDue: pay.amountDue,
          amountPaid: pay.amountPaid,
          paymentDate: pay.paymentDate,
          status: pay.status,
        },
      });
    }
  }

  console.log('Seeding WeeklyProgressLog (QA logs)...');
  const qaLogs = [
    {
      id: 'QA-1001',
      date: new Date('2026-05-10'),
      inspectorId: inspectorUser.id,
      slotId: 'SLOT-01',
      complianceStatus: 'Compliant',
      percentageComplete: 85,
      structuralCheck: 'Pass',
      safetyCheck: 'Pass',
      remarks: 'Subgraded road compaction validated for Cavinti parcel. Municipal drainage slope compliance has been successfully verified without ponding hazards.',
      siteActivity: 'Road Subgrade',
    },
    {
      id: 'QA-1002',
      date: new Date('2026-05-18'),
      inspectorId: inspectorUser.id,
      slotId: 'SLOT-03',
      complianceStatus: 'Compliant',
      percentageComplete: 65,
      structuralCheck: 'Pass',
      safetyCheck: 'Pass',
      remarks: 'Site grading completed. Grade compliance verified. Gravel and aggregates foundation poured ready for cement pour.',
      siteActivity: 'Leveling',
    },
    {
      id: 'QA-1003',
      date: new Date('2026-05-22'),
      inspectorId: inspectorUser.id,
      slotId: 'SLOT-05',
      complianceStatus: 'Corrective Action Required',
      percentageComplete: 35,
      structuralCheck: 'Fail',
      safetyCheck: 'Pass',
      remarks: 'Minor soil slide on western corner after heavy Laguna rains. Instructed contractor to set up reinforced sand-bag walls and retaining layout.',
      siteActivity: 'Excavation',
    },
  ];

  for (const log of qaLogs) {
    await prisma.weeklyProgressLog.create({
      data: {
        id: log.id,
        date: log.date,
        inspectorId: log.inspectorId,
        slotId: log.slotId,
        complianceStatus: log.complianceStatus,
        percentageComplete: log.percentageComplete,
        structuralCheck: log.structuralCheck,
        safetyCheck: log.safetyCheck,
        notes: log.remarks,
        materialsUsed: 'Standard structural inspection materials and tools',
        siteActivity: log.siteActivity,
      },
    });
  }

  console.log('Seeding PunchListDefects...');
  const punchListDefects = [
    {
      id: 'PUNCH-001',
      slotId: 'SLOT-05',
      inspectorId: inspectorUser.id,
      contractorId: 'CONT-001',
      title: 'Western Slope Runoff Retention Required',
      description: 'Rain runoff creates mild erosion on west boundary marker. Requires temporary gabion sandbagging and compacted backfill.',
      severity: 'HIGH',
      status: 'OPEN',
      category: 'GRADING',
      resolutionNotes: 'Contractor notified to mobilize leveling crew by Friday.',
      targetDate: new Date('2026-06-05'),
    },
    {
      id: 'PUNCH-002',
      slotId: 'SLOT-04',
      inspectorId: inspectorUser.id,
      contractorId: 'CONT-002',
      title: 'Spine Road Curb Alignment Adjustment',
      description: 'Curb line at Lot 4 entrance has 3cm elevation offset from drainage inlet grate.',
      severity: 'MEDIUM',
      status: 'CONTRACTOR_RECTIFIED',
      category: 'ROADS',
      resolutionNotes: 'Re-aligned curb poured with 3000 PSI concrete mix on May 24.',
      targetDate: new Date('2026-05-30'),
    },
    {
      id: 'PUNCH-003',
      slotId: 'SLOT-01',
      inspectorId: inspectorUser.id,
      contractorId: 'CONT-003',
      title: 'Drainage Pipe Debris Cleanout',
      description: 'Minor silt accumulation inside concrete culvert mouth during early road grading.',
      severity: 'LOW',
      status: 'CLOSED',
      category: 'DRAINAGE',
      resolutionNotes: 'Culvert flushed and verified clear by Engr. Ricardo Gomez on May 20.',
      targetDate: new Date('2026-05-22'),
    },
  ];

  for (const def of punchListDefects) {
    await prisma.punchListDefect.create({ data: def });
  }

  console.log('Seeding ProcessAuditLogs...');
  const auditLogs = [
    {
      entityType: 'SLOT',
      entityId: 'SLOT-08',
      action: 'LOT_TURNOVER_COMPLETED',
      actorName: 'Mauro R. Principe Jr.',
      actorRole: 'ADMIN',
      details: 'Lot 08 Certificate of Acceptance signed by Emilio Alcantara. Physical property markers released.',
      createdAt: new Date('2026-05-20T10:30:00Z'),
    },
    {
      entityType: 'TITLING',
      entityId: 'SLOT-12',
      action: 'TCT_ISSUANCE_CONFIRMED',
      actorName: 'Mauro R. Principe Jr.',
      actorRole: 'ADMIN',
      details: 'Registry of Deeds Laguna issued individual TCT-2026-0058291-RD-LAGUNA. Lot marked Turnover Ready.',
      createdAt: new Date('2026-05-18T14:15:00Z'),
    },
    {
      entityType: 'DEFECT',
      entityId: 'PUNCH-002',
      action: 'DEFECT_RECTIFIED_BY_CONTRACTOR',
      actorName: 'Calabarzon Road Masters',
      actorRole: 'CONTRACTOR',
      details: 'Curb line at Lot 4 entrance re-aligned and ready for inspector re-check.',
      createdAt: new Date('2026-05-24T09:00:00Z'),
    },
    {
      entityType: 'CIVIL_WORKS',
      entityId: 'PARCEL-CST',
      action: 'PHASE_A_SIGNOFF',
      actorName: 'Engr. Ricardo Gomez',
      actorRole: 'INSPECTOR',
      details: 'Phase A Boundary Staking & Land Grading verified 100% complete and approved.',
      createdAt: new Date('2026-02-15T16:00:00Z'),
    },
  ];

  for (const a of auditLogs) {
    await prisma.processAuditLog.create({ data: a });
  }

  console.log('Seeding PayrollRecords...');
  const payroll = [
    {
      id: 'PAY-101',
      date: new Date('2026-04-30'),
      payeeName: 'Engr. Ricardo Gomez',
      role: PayrollRole.SITE_MONITOR,
      disbursementType: DisbursementType.SALARY,
      amount: 3200,
      status: PayrollStatus.DISBURSED,
      paymentMethod: 'GCash Enterprise Payroll',
    },
    {
      id: 'PAY-102',
      date: new Date('2026-04-30'),
      payeeName: 'Atty. Katrina Alvero',
      role: PayrollRole.INTERNAL_STAFF,
      disbursementType: DisbursementType.SALARY,
      amount: 4500,
      status: PayrollStatus.DISBURSED,
      paymentMethod: 'BDO Unibank Bank Transfer',
    },
    {
      id: 'PAY-103',
      date: new Date('2026-05-15'),
      payeeName: 'Laguna Geodetic Earthmovers',
      role: PayrollRole.CONTRACTOR,
      disbursementType: DisbursementType.CONTRACT_MILESTONE,
      amount: 25000,
      status: PayrollStatus.DISBURSED,
      paymentMethod: 'RCBC Corporate check',
    },
    {
      id: 'PAY-104',
      date: new Date('2026-05-20'),
      payeeName: 'Calabarzon Road Masters',
      role: PayrollRole.CONTRACTOR,
      disbursementType: DisbursementType.CONTRACT_MILESTONE,
      amount: 30000,
      status: PayrollStatus.DISBURSED,
      paymentMethod: 'BPI Escrow Direct',
    },
  ];

  for (const p of payroll) {
    await prisma.payrollRecord.create({ data: p });
  }

  console.log('Database Seeding Successful! 🚀');
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
