import express from 'express';
import { 
  PrismaClient, Role, SlotStatus, PaymentMethod, PaymentStatus, 
  PayrollRole, DisbursementType, PayrollStatus, AccountStatus 
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';
import * as crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Instantiate Prisma Client with PostgreSQL adapter
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const isCloudDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech') || connectionString.includes('supabase') || connectionString.includes('render');
const pool = new Pool({
  connectionString,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json());

// Password security helpers using scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Helper function to map DB SlotStatus to Frontend SlotStatus string
function mapDbStatusToString(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.AVAILABLE: return 'Available';
    case SlotStatus.RESERVED: return 'Reserved';
    case SlotStatus.UNDER_CONTRACT: return 'Under Contract';
    case SlotStatus.DEVELOPING: return 'Developing';
    case SlotStatus.TITLING_PHASE: return 'Titling Phase';
    case SlotStatus.TURNOVER_READY: return 'Turnover Ready';
    case SlotStatus.HANDED_OVER: return 'Handed Over';
    case SlotStatus.SOLD: return 'Under Contract';
    default: return 'Available';
  }
}

// Helper function to map Frontend SlotStatus string to DB SlotStatus
function mapStringToDbStatus(status: string): SlotStatus {
  const s = status.toLowerCase();
  if (s.includes('reserve')) return SlotStatus.RESERVED;
  if (s.includes('contract')) return SlotStatus.UNDER_CONTRACT;
  if (s.includes('develop')) return SlotStatus.DEVELOPING;
  if (s.includes('titl')) return SlotStatus.TITLING_PHASE;
  if (s.includes('turnover') || s.includes('ready')) return SlotStatus.TURNOVER_READY;
  if (s.includes('hand') || s.includes('over')) return SlotStatus.HANDED_OVER;
  if (s.includes('sold')) return SlotStatus.SOLD;
  return SlotStatus.AVAILABLE;
}

// Helper function to map DB Client to Frontend Client structure
async function mapUserToClient(user: any) {
  const pkg = user.clientPackage;
  const ledgers = pkg?.installmentLedgers || [];
  const tracker = pkg?.titlePermitTracker;
  const kyc = user.buyerKyc;
  
  const totalContractPrice = Number(pkg?.price || 0);
  
  // Calculate paid amount and balance
  const paidLedgers = ledgers.filter((l: any) => l.status === PaymentStatus.PAID);
  const amountPaid = paidLedgers.reduce((sum: number, l: any) => sum + Number(l.amountPaid || 0), 0);
  const balance = Math.max(totalContractPrice - amountPaid, 0);

  // Get monthly installment amount from the first ledger item, or default
  const monthlyInstallment = ledgers.length > 0 ? Number(ledgers[0].amountDue) : 0;

  // Format payments array
  const payments = ledgers.map((l: any) => ({
    id: l.id,
    dueDate: l.dueDate.toISOString().split('T')[0],
    amount: Number(l.amountDue),
    status: l.status === PaymentStatus.PAID ? 'Paid' : 'Pending',
    paidDate: l.paymentDate ? l.paymentDate.toISOString().split('T')[0] : undefined,
  }));

  // Format full titling milestones
  const titleMilestones = {
    currentPhase: tracker?.currentPhase || 'Reservation & Buyer Qualification',
    motherTitleVerified: tracker?.motherTitleVerified ?? true,
    darClearanceApproved: tracker?.darClearanceApproved ?? true,
    lguPermitIssued: tracker?.lguPermitIssued ?? false,
    dhsudLicenseToSell: tracker?.dhsudLicenseToSell ?? false,
    ctsSigned: tracker?.ctsSigned ?? false,
    deedOfSaleSigned: tracker?.deedOfSaleSigned ?? false,
    birEcarIssued: tracker?.birEcarIssued ?? false,
    taxDeclarationTransferred: tracker?.taxDeclarationTransferred ?? false,
    registryOfDeedsTctReleased: tracker?.registryOfDeedsTctReleased ?? false,
    certificateOfAcceptanceSigned: tracker?.certificateOfAcceptanceSigned ?? false,
    tctNumber: tracker?.tctNumber || null,
    taxDecNumber: tracker?.taxDecNumber || null,
  };

  // Format buyer KYC
  const buyerKyc = kyc ? {
    govtIdVerified: kyc.govtIdVerified,
    tinVerified: kyc.tinVerified,
    proofOfIncomeVerified: kyc.proofOfIncomeVerified,
    proofOfAddressVerified: kyc.proofOfAddressVerified,
    maritalConsentVerified: kyc.maritalConsentVerified,
    kycStatus: kyc.kycStatus as 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED',
    verifiedAt: kyc.verifiedAt ? kyc.verifiedAt.toISOString() : null,
    notes: kyc.notes || '',
  } : {
    govtIdVerified: false,
    tinVerified: false,
    proofOfIncomeVerified: false,
    proofOfAddressVerified: false,
    maritalConsentVerified: false,
    kycStatus: 'PENDING' as const,
    verifiedAt: null,
    notes: '',
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    contact: user.contact || '',
    accountStatus: user.accountStatus || 'ACTIVE',
    inviteToken: user.inviteToken || null,
    inviteTokenExpiry: user.inviteTokenExpiry ? user.inviteTokenExpiry.toISOString() : null,
    slotId: pkg?.slotId || null,
    packageName: pkg?.packageType || '',
    paymentPlan: pkg?.paymentMethod === PaymentMethod.INSTALLMENT ? 'Installment' : 'Cash',
    totalContractPrice,
    monthlyInstallment,
    balance,
    amountPaid,
    titleMilestones,
    buyerKyc,
    payments,
    registrationDate: user.createdAt.toISOString().split('T')[0],
  };
}

// 1. GET /api/all-data: Fetches all operational models for frontend initial render
app.get('/api/all-data', async (req, res) => {
  try {
    // A. Parcels
    const dbParcels = await prisma.landParcel.findMany({
      include: { slots: true, civilWorksMilestones: { orderBy: { phaseName: 'asc' } } }
    });
    const parcels = dbParcels.map(p => ({
      id: p.id,
      name: p.name,
      location: p.location,
      totalAreaSqm: p.totalAreaSqm,
      acquisitionCost: Number(p.purchaseCost),
      subdividedSlotsCount: p.totalSlots,
      acquisitionDate: p.acquisitionDate.toISOString().split('T')[0],
    }));

    // B. Slots with 7-stage lifecycle status
    const dbSlots = await prisma.slot.findMany({
      include: { clientPackage: true },
      orderBy: { slotNumber: 'asc' }
    });
    const slots = dbSlots.map(s => ({
      id: s.id,
      parcelId: s.parcelId,
      slotNumber: s.slotNumber,
      areaSqm: s.sizeSqm,
      basePrice: Number(s.price),
      status: mapDbStatusToString(s.status),
      row: s.row,
      col: s.col,
      assignedClientId: s.clientPackage?.userId || null,
    }));

    // C. Clients
    const dbClients = await prisma.user.findMany({
      where: { role: Role.CLIENT },
      include: {
        buyerKyc: true,
        clientPackage: {
          include: {
            installmentLedgers: { orderBy: { dueDate: 'asc' } },
            titlePermitTracker: true
          }
        }
      }
    });
    const clients = await Promise.all(dbClients.map(c => mapUserToClient(c)));

    // D. Contractors
    const dbContractors = await prisma.contractor.findMany();
    const contractors = dbContractors.map(c => ({
      id: c.id,
      name: c.name,
      company: c.company || '',
      specialty: c.specialty || 'Land Leveling',
      contractAmount: Number(c.contractAmount || 0),
      paidAmount: Number(c.paidAmount || 0),
      activeManpower: c.activeManpower,
      milestoneProgress: c.milestoneProgress,
      rating: c.rating || 0,
    }));

    // E. QA Logs
    const dbQaLogs = await prisma.weeklyProgressLog.findMany({
      include: { inspector: true },
      orderBy: { date: 'desc' }
    });
    const qaLogs = dbQaLogs.map(l => ({
      id: l.id,
      date: l.date.toISOString().split('T')[0],
      inspectorName: l.inspector.name,
      slotId: l.slotId,
      complianceStatus: l.complianceStatus || 'Compliant',
      progressPercentage: l.percentageComplete,
      structuralCheck: l.structuralCheck || 'Pass',
      safetyCheck: l.safetyCheck || 'Pass',
      remarks: l.notes,
      siteActivity: l.siteActivity || 'Ready',
    }));

    // F. Punch-List Defects
    const dbDefects = await prisma.punchListDefect.findMany({
      include: { inspector: true, contractor: true },
      orderBy: { createdAt: 'desc' }
    });
    const punchListDefects = dbDefects.map(d => ({
      id: d.id,
      slotId: d.slotId,
      inspectorId: d.inspectorId,
      inspectorName: d.inspector?.name || 'Site Monitor',
      contractorId: d.contractorId,
      contractorName: d.contractor?.name || 'Unassigned Contractor',
      title: d.title,
      description: d.description,
      severity: d.severity,
      status: d.status,
      category: d.category,
      resolutionNotes: d.resolutionNotes || '',
      targetDate: d.targetDate ? d.targetDate.toISOString().split('T')[0] : null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    // G. Civil Works Milestones
    const dbCivilMilestones = await prisma.civilWorksMilestone.findMany({
      orderBy: { phaseName: 'asc' }
    });
    const civilWorksMilestones = dbCivilMilestones.map(m => ({
      id: m.id,
      parcelId: m.parcelId,
      phaseName: m.phaseName,
      targetPercentage: m.targetPercentage,
      currentPercentage: m.currentPercentage,
      status: m.status,
      inspectorSignOff: m.inspectorSignOff,
      signOffDate: m.signOffDate ? m.signOffDate.toISOString().split('T')[0] : null,
      remarks: m.remarks || '',
    }));

    // H. Process Audit Logs
    const dbAuditLogs = await prisma.processAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    const auditLogs = dbAuditLogs.map(a => ({
      id: a.id,
      entityType: a.entityType,
      entityId: a.entityId,
      action: a.action,
      actorName: a.actorName,
      actorRole: a.actorRole,
      details: a.details,
      createdAt: a.createdAt.toISOString(),
    }));

    // I. Payroll & Budget Overview
    const dbPayroll = await prisma.payrollRecord.findMany({
      orderBy: { date: 'desc' }
    });
    const payroll = dbPayroll.map(p => ({
      id: p.id,
      date: p.date.toISOString().split('T')[0],
      payeeName: p.payeeName,
      role: p.role === PayrollRole.INTERNAL_STAFF ? 'Internal Staff' : p.role === PayrollRole.SITE_MONITOR ? 'Site Monitor' : 'Contractor',
      disbursementType: p.disbursementType === DisbursementType.SALARY ? 'Salary' : 'Contract Milestone',
      amount: Number(p.amount),
      status: p.status === PayrollStatus.DISBURSED ? 'Disbursed' : 'Pending',
      paymentMethod: p.paymentMethod,
    }));

    const totalParcelsCount = dbParcels.length;
    const initialCapital = 800000 + Math.max(totalParcelsCount - 1, 0) * 500000;
    const landAcquisitionCost = parcels.reduce((sum, p) => sum + p.acquisitionCost, 0);
    const subdevelopmentCostPaid = payroll.filter(p => p.status === 'Disbursed').reduce((sum, p) => sum + p.amount, 0);
    const ledgerPaidSum = await prisma.installmentLedger.aggregate({
      _sum: { amountPaid: true },
      where: { status: PaymentStatus.PAID }
    });
    const clientPackagesCount = await prisma.clientPackage.count();
    const collectedInstallments = Number(ledgerPaidSum._sum.amountPaid || 0) + clientPackagesCount * 5000;
    const roadInfrastructureFee = 75000;
    const currentCashReserve = initialCapital + collectedInstallments - landAcquisitionCost - subdevelopmentCostPaid - roadInfrastructureFee;

    const budget = {
      initialCapital,
      landAcquisitionCost,
      subdevelopmentCostPaid,
      collectedInstallments,
      currentCashReserve,
      roadInfrastructureFee,
      nextHectareCost: 500000,
    };

    // J. Daily Manpower Audits (Field Spot-Check Roll-Calls)
    let manpowerAudits: any[] = [];
    try {
      if ((prisma as any).dailyManpowerAudit) {
        const dbManpowerAudits = await (prisma as any).dailyManpowerAudit.findMany({
          orderBy: { date: 'desc' }
        });
        manpowerAudits = dbManpowerAudits.map((m: any) => ({
          id: m.id,
          date: m.date.toISOString().split('T')[0],
          contractorId: m.contractorId,
          contractorName: m.contractorName,
          specialty: m.specialty,
          shift: m.shift,
          claimedHeadcount: m.claimedHeadcount,
          verifiedHeadcount: m.verifiedHeadcount,
          discrepancy: m.discrepancy,
          assignedSectorOrLot: m.assignedSectorOrLot,
          supervisorName: m.supervisorName,
          gpsCoordinates: m.gpsCoordinates,
          verificationStatus: m.verificationStatus,
          photoEvidenceVerified: m.photoEvidenceVerified,
          remarks: m.remarks,
          productivityIndex: m.productivityIndex
        }));
      }
    } catch (e) {
      console.warn('Manpower audits table not yet initialized in DB, returning empty array');
    }

    res.json({
      parcels,
      slots,
      clients,
      contractors,
      qaLogs,
      punchListDefects,
      civilWorksMilestones,
      auditLogs,
      payroll,
      budget,
      manpowerAudits
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================================
// AUTHENTICATION & DEVELOPER-TO-BUYER HANDOVER PIPELINE
// ============================================================================

// 1. POST /api/auth/login: Real credential verification with PostgreSQL
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Please provide an email address.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      include: {
        clientPackage: true,
        buyerKyc: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'No user account found matching this email.' });
    }

    // Password validation logic
    let isPasswordValid = false;
    if (user.passwordHash) {
      isPasswordValid = verifyPassword(password || '', user.passwordHash);
    } else {
      // Demo fallback passkeys for newly created or legacy unhashed demo accounts
      if (password === 'admin123' || password === 'inspector123' || password === 'client123' || password === 'demo-session-key') {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      if (user.accountStatus === 'INVITED') {
        return res.status(403).json({
          error: 'This buyer account has not been activated yet. Please click your Handover Activation Link to set your password.',
          isInvited: true,
          inviteToken: user.inviteToken
        });
      }
      return res.status(401).json({ error: 'Incorrect security passkey. Please verify your credentials.' });
    }

    const session: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === Role.ADMIN ? 'Admin' : user.role === Role.INSPECTOR ? 'Inspector' : 'Client',
      clientId: user.role === Role.CLIENT ? user.id : undefined,
      accountStatus: user.accountStatus,
    };

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
});

// 2. POST /api/auth/verify-invite: Validates a buyer onboarding invitation token
app.post('/api/auth/verify-invite', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Activation token is required.' });
  }

  try {
    const cleanToken = token.trim();
    let user = await prisma.user.findFirst({
      where: { inviteToken: cleanToken },
      include: {
        clientPackage: true,
        buyerKyc: true,
      }
    });

    // Special helper for Demo Token: if demo token was already claimed previously, allow re-verifying CLI-006 for presentation testing
    if (!user && cleanToken === 'demo-handover-token-2026') {
      const demoUser = await prisma.user.findFirst({
        where: { email: 'francis.laurel@example.com' },
        include: {
          clientPackage: true,
          buyerKyc: true,
        }
      });
      if (demoUser) {
        user = demoUser;
      }
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'Invalid activation token or account has already been claimed.',
        alreadyClaimed: true 
      });
    }

    if (user.inviteTokenExpiry && new Date() > user.inviteTokenExpiry && cleanToken !== 'demo-handover-token-2026') {
      return res.status(410).json({ error: 'This handover activation link has expired (7-day validity). Please contact the subdivision sales office for a new link.' });
    }

    res.json({
      valid: true,
      client: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact || '',
        slotId: user.clientPackage?.slotId || 'SLOT-06',
        packageName: user.clientPackage?.packageType || 'Cavinti Highland Crest Land Parcel',
        totalContractPrice: Number(user.clientPackage?.price || 52000),
        accountStatus: user.accountStatus,
      }
    });
  } catch (error) {
    console.error('Error verifying invite token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/auth/activate: Buyer sets password and claims account
app.post('/api/auth/activate', async (req, res) => {
  const { token, password, contact } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Activation token and new password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const cleanToken = token.trim();
    let user = await prisma.user.findFirst({
      where: { inviteToken: cleanToken }
    });

    // Special helper for Demo Token: allow re-activating CLI-006 during presentation
    if (!user && cleanToken === 'demo-handover-token-2026') {
      const demoUser = await prisma.user.findFirst({
        where: { email: 'francis.laurel@example.com' }
      });
      if (demoUser) {
        user = demoUser;
      }
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'Invalid activation token or this account has already been claimed. If you already set a password, please sign in with your email.',
        alreadyClaimed: true 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        accountStatus: 'ACTIVE',
        inviteToken: cleanToken === 'demo-handover-token-2026' ? 'demo-handover-token-2026' : null,
        inviteTokenExpiry: null,
        contact: contact || user.contact,
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: user.id,
        action: 'BUYER_ACCOUNT_ACTIVATED',
        actorName: user.name,
        actorRole: 'CLIENT',
        details: `Buyer ${user.name} claimed portal access and set account credentials.`,
      }
    });

    const session: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: 'Client',
      clientId: updatedUser.id,
      accountStatus: 'ACTIVE',
    };

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error activating buyer account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. POST /api/clients/generate-invite: Admin issues an onboarding handover link
app.post('/api/clients/generate-invite', async (req, res) => {
  const { clientId, actorName, actorRole } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }

  try {
    const token = crypto.randomBytes(24).toString('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days validity

    const updatedUser = await prisma.user.update({
      where: { id: clientId },
      data: {
        inviteToken: token,
        inviteTokenExpiry: expiry,
        accountStatus: 'INVITED',
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: clientId,
        action: 'HANDOVER_INVITE_GENERATED',
        actorName: actorName || 'Operations Lead',
        actorRole: actorRole || 'ADMIN',
        details: `Generated new developer-to-buyer handover link for ${updatedUser.name} (${updatedUser.email}).`,
      }
    });

    res.json({
      success: true,
      inviteToken: token,
      inviteTokenExpiry: expiry.toISOString(),
      buyerName: updatedUser.name,
      buyerEmail: updatedUser.email,
    });
  } catch (error) {
    console.error('Error generating invite token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST /api/parcels: Adds a new land parcel
app.post('/api/parcels', async (req, res) => {
  const { id, name, location, acquisitionCost, totalAreaSqm, subdividedSlotsCount, acquisitionDate } = req.body;
  try {
    const parcel = await prisma.landParcel.create({
      data: {
        id,
        name,
        location,
        purchaseCost: acquisitionCost,
        totalAreaSqm,
        totalSlots: subdividedSlotsCount,
        acquisitionDate: new Date(acquisitionDate),
      }
    });

    // Create standard default civil works milestones for this new parcel
    const defaultPhases = [
      'Phase A: Boundary Staking & Land Grading',
      'Phase B: Road Network & Concrete Curbing',
      'Phase C: Storm Drainage & RCBC Culverts',
      'Phase D: Water Reticulation & Power Grid Post Lines',
      'Phase E: Security Perimeter & Subdivision Gate',
    ];
    for (const phaseName of defaultPhases) {
      await prisma.civilWorksMilestone.create({
        data: {
          parcelId: parcel.id,
          phaseName,
          targetPercentage: 100,
          currentPercentage: 0,
          status: 'NOT_STARTED',
        }
      });
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'PARCEL',
        entityId: parcel.id,
        action: 'LAND_PARCEL_ACQUIRED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Acquired parcel ${parcel.name} (${totalAreaSqm} sqm in ${location}) with ${subdividedSlotsCount} planned lots.`,
      }
    });

    res.json(parcel);
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST /api/slots/subdivide: Create subdivisions inside a parcel
app.post('/api/slots/subdivide', async (req, res) => {
  const { parcelId, areaSqm, price, startLotNumber } = req.body;
  try {
    const createdSlots = [];
    for (let idx = 0; idx < 5; idx++) {
      const slotNum = startLotNumber + idx;
      const slot = await prisma.slot.create({
        data: {
          id: `SLOT-${slotNum.toString().padStart(2, '0')}`,
          parcelId,
          slotNumber: slotNum,
          sizeSqm: areaSqm,
          price,
          status: SlotStatus.AVAILABLE,
          row: Math.ceil(slotNum / 5),
          col: ((slotNum - 1) % 5) + 1,
        }
      });
      createdSlots.push(slot);
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: parcelId,
        action: 'LOTS_SUBDIVIDED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Subdivided 5 new lots (Lots ${startLotNumber} to ${startLotNumber + 4}) at ${areaSqm} sqm each.`,
      }
    });

    res.json(createdSlots);
  } catch (error) {
    console.error('Error subdividing slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. POST /api/slots/transition-status: Transitions a slot along the 7-stage lifecycle
app.post('/api/slots/transition-status', async (req, res) => {
  const { slotId, newStatus, actorName, actorRole, notes, clientId } = req.body;
  try {
    const dbStatus = mapStringToDbStatus(newStatus);
    
    const updatedSlot = await prisma.slot.update({
      where: { id: slotId },
      data: { status: dbStatus }
    });

    // If setting to available, disconnect client package if present
    if (dbStatus === SlotStatus.AVAILABLE) {
      await prisma.clientPackage.updateMany({
        where: { slotId },
        data: { slotId: '' }
      });
    } else if (clientId) {
      // Connect client package if not connected
      await prisma.clientPackage.updateMany({
        where: { userId: clientId },
        data: { slotId }
      });
    }

    // Log in Process Audit Trail
    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: slotId,
        action: 'SLOT_LIFECYCLE_TRANSITION',
        actorName: actorName || 'Operations Head',
        actorRole: actorRole || 'ADMIN',
        details: `Lot ${slotId} status transitioned to ${newStatus}. ${notes ? `Remarks: ${notes}` : ''}`,
      }
    });

    res.json({
      slot: {
        ...updatedSlot,
        status: mapDbStatusToString(updatedSlot.status),
      }
    });
  } catch (error) {
    console.error('Error transitioning slot status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. POST /api/clients: Register new client profile with initial KYC & Title Tracker
app.post('/api/clients', async (req, res) => {
  const { id, name, email, contact, packageName, paymentPlan, totalContractPrice, registrationDate } = req.body;
  try {
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        id: id || `CLI-${Date.now().toString().slice(-4)}`,
        name,
        email,
        contact,
        role: Role.CLIENT,
        accountStatus: 'INVITED',
        inviteToken,
        inviteTokenExpiry,
        createdAt: new Date(registrationDate || Date.now()),
      }
    });

    const clientPackage = await prisma.clientPackage.create({
      data: {
        userId: user.id,
        slotId: '', // unassigned initially
        price: totalContractPrice || 45000,
        packageType: packageName || 'Standard Land Parcel Access Package',
        paymentMethod: paymentPlan === 'Installment' ? PaymentMethod.INSTALLMENT : PaymentMethod.SPOT_CASH,
      }
    });

    // Initialize full Government Titling Tracker
    await prisma.titlePermitTracker.create({
      data: {
        clientPackageId: clientPackage.id,
        currentPhase: 'Reservation & Buyer KYC Verification',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: false,
        dhsudLicenseToSell: false,
        ctsSigned: false,
        deedOfSaleSigned: false,
        birEcarIssued: false,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
      }
    });

    // Initialize Buyer KYC
    await prisma.buyerKyc.create({
      data: {
        userId: user.id,
        govtIdVerified: false,
        tinVerified: false,
        proofOfIncomeVerified: false,
        proofOfAddressVerified: false,
        maritalConsentVerified: false,
        kycStatus: 'PENDING',
        notes: 'Client account created. Pending document submission.',
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: user.id,
        action: 'CLIENT_REGISTERED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Registered buyer profile for ${user.name} (${user.email}).`,
      }
    });

    const fullClientData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        buyerKyc: true,
        clientPackage: {
          include: {
            installmentLedgers: { orderBy: { dueDate: 'asc' } },
            titlePermitTracker: true
          }
        }
      }
    });

    const mapped = await mapUserToClient(fullClientData);
    res.json(mapped);
  } catch (error) {
    console.error('Error registering client:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. POST /api/clients/assign-slot: Binds a Client to a slot and advances slot to RESERVED / UNDER_CONTRACT
app.post('/api/clients/assign-slot', async (req, res) => {
  const { clientId, slotId } = req.body;
  try {
    const clientPackage = await prisma.clientPackage.update({
      where: { userId: clientId },
      data: { slotId }
    });

    const slot = await prisma.slot.update({
      where: { id: slotId },
      data: { status: SlotStatus.RESERVED }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: slotId,
        action: 'SLOT_RESERVED_FOR_CLIENT',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Assigned Lot ${slotId} to buyer ${clientId}. Status set to RESERVED.`,
      }
    });

    res.json({ clientPackage, slot: { ...slot, status: mapDbStatusToString(slot.status) } });
  } catch (error) {
    console.error('Error assigning client to slot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. POST /api/clients/update-title-pipeline: Government Permitting & Titling Pipeline Manager
app.post('/api/clients/update-title-pipeline', async (req, res) => {
  const { clientId, stepKey, value, tctNumber, taxDecNumber, actorName } = req.body;
  try {
    const clientPackage = await prisma.clientPackage.findUnique({
      where: { userId: clientId },
      include: { titlePermitTracker: true, slot: true }
    });

    if (!clientPackage || !clientPackage.titlePermitTracker) {
      return res.status(404).json({ error: 'Client Package or Titling Tracker Not Found' });
    }

    const updatePayload: any = {};
    if (stepKey !== undefined) {
      updatePayload[stepKey] = value;
    }
    if (tctNumber !== undefined) updatePayload.tctNumber = tctNumber;
    if (taxDecNumber !== undefined) updatePayload.taxDecNumber = taxDecNumber;

    const updated = await prisma.titlePermitTracker.update({
      where: { id: clientPackage.titlePermitTracker.id },
      data: updatePayload
    });

    // Derive currentPhase based on verified government agency steps
    let currentPhase = 'Reservation & Buyer KYC Verification';
    if (updated.certificateOfAcceptanceSigned) {
      currentPhase = 'Title Transferred & Property Handed Over';
    } else if (updated.registryOfDeedsTctReleased) {
      currentPhase = 'Registry of Deeds TCT Released (Turnover Ready)';
    } else if (updated.taxDeclarationTransferred) {
      currentPhase = 'Assessor Tax Declaration Transferred';
    } else if (updated.birEcarIssued) {
      currentPhase = 'BIR eCAR & Capital Gains Tax Clearance';
    } else if (updated.deedOfSaleSigned) {
      currentPhase = 'Deed of Absolute Sale (DOAS) Executed';
    } else if (updated.ctsSigned) {
      currentPhase = 'Contract to Sell (CTS) Executed';
    } else if (updated.dhsudLicenseToSell && updated.lguPermitIssued) {
      currentPhase = 'LGU & DHSUD Project Permitting Approved';
    }

    await prisma.titlePermitTracker.update({
      where: { id: updated.id },
      data: { currentPhase }
    });

    // If Registry of Deeds TCT is released and slot is currently under contract or titling, advance to TURNOVER_READY
    if (updated.registryOfDeedsTctReleased && clientPackage.slotId) {
      const currentSlot = await prisma.slot.findUnique({ where: { id: clientPackage.slotId } });
      if (currentSlot && (currentSlot.status === SlotStatus.TITLING_PHASE || currentSlot.status === SlotStatus.UNDER_CONTRACT || currentSlot.status === SlotStatus.RESERVED)) {
        await prisma.slot.update({
          where: { id: clientPackage.slotId },
          data: { status: SlotStatus.TURNOVER_READY }
        });
      }
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'TITLING',
        entityId: clientPackage.slotId || clientId,
        action: 'TITLING_PIPELINE_UPDATED',
        actorName: actorName || 'Legal & Titling Officer',
        actorRole: 'ADMIN',
        details: `Updated titling step ${stepKey || 'metadata'} for client ${clientId}. Current Phase: ${currentPhase}.`,
      }
    });

    res.json({ ...updated, currentPhase });
  } catch (error) {
    console.error('Error updating titling pipeline:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 8. POST /api/clients/verify-kyc: Buyer KYC Document Compliance Checker
app.post('/api/clients/verify-kyc', async (req, res) => {
  const { clientId, docKey, verified, notes, actorName } = req.body;
  try {
    let kyc = await prisma.buyerKyc.findUnique({ where: { userId: clientId } });
    if (!kyc) {
      kyc = await prisma.buyerKyc.create({
        data: { userId: clientId, kycStatus: 'PENDING' }
      });
    }

    const updateData: any = { [docKey]: verified };
    if (notes) updateData.notes = notes;

    // Check if all essential documents are verified
    const prospectiveState = { ...kyc, ...updateData };
    const allVerified = prospectiveState.govtIdVerified && prospectiveState.tinVerified && prospectiveState.proofOfIncomeVerified && prospectiveState.proofOfAddressVerified;
    updateData.kycStatus = allVerified ? 'VERIFIED' : 'UNDER_REVIEW';
    if (allVerified) updateData.verifiedAt = new Date();

    const updatedKyc = await prisma.buyerKyc.update({
      where: { userId: clientId },
      data: updateData
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: clientId,
        action: 'BUYER_KYC_UPDATED',
        actorName: actorName || 'Compliance Officer',
        actorRole: 'ADMIN',
        details: `Updated ${docKey} to ${verified ? 'Verified' : 'Pending'} for buyer ${clientId}. KYC Status: ${updateData.kycStatus}.`,
      }
    });

    res.json(updatedKyc);
  } catch (error) {
    console.error('Error verifying buyer KYC:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 9. POST /api/clients/sign-acceptance: Client lot turnover sign-off
app.post('/api/clients/sign-acceptance', async (req, res) => {
  const { clientId, clientName } = req.body;
  try {
    const clientPackage = await prisma.clientPackage.findUnique({
      where: { userId: clientId },
      include: { titlePermitTracker: true, slot: true }
    });

    if (!clientPackage || !clientPackage.titlePermitTracker) {
      return res.status(404).json({ error: 'Client Package or Titling Tracker Not Found' });
    }

    // Update Title Tracker
    await prisma.titlePermitTracker.update({
      where: { id: clientPackage.titlePermitTracker.id },
      data: {
        certificateOfAcceptanceSigned: true,
        currentPhase: 'Title Transferred & Property Handed Over',
      }
    });

    // Advance slot status to HANDED_OVER
    if (clientPackage.slotId) {
      await prisma.slot.update({
        where: { id: clientPackage.slotId },
        data: { status: SlotStatus.HANDED_OVER }
      });
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'TURNOVER',
        entityId: clientPackage.slotId || clientId,
        action: 'LOT_TURNOVER_ACCEPTED',
        actorName: clientName || 'Buyer',
        actorRole: 'CLIENT',
        details: `Certificate of Lot Acceptance signed. Physical lot handover markers released for Lot ${clientPackage.slotId}.`,
      }
    });

    res.json({ success: true, message: 'Certificate of Acceptance signed and property handed over.' });
  } catch (error) {
    console.error('Error signing acceptance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 10. POST /api/punch-lists: Log a defect punch-list ticket
app.post('/api/punch-lists', async (req, res) => {
  const { slotId, inspectorId, contractorId, title, description, severity, category, targetDate } = req.body;
  try {
    const inspector = await prisma.user.findFirst({
      where: { role: Role.INSPECTOR }
    });

    const defect = await prisma.punchListDefect.create({
      data: {
        slotId,
        inspectorId: inspectorId || inspector?.id || 'ricardo-gomez',
        contractorId: contractorId || null,
        title,
        description,
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        category: category || 'ROADS',
        targetDate: targetDate ? new Date(targetDate) : null,
      },
      include: { inspector: true, contractor: true }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'DEFECT',
        entityId: defect.id,
        action: 'DEFECT_TICKET_LOGGED',
        actorName: defect.inspector?.name || 'Site Monitor',
        actorRole: 'INSPECTOR',
        details: `Logged [${severity}] defect on Lot ${slotId}: "${title}". Assigned to: ${defect.contractor?.name || 'Unassigned'}.`,
      }
    });

    res.json({
      id: defect.id,
      slotId: defect.slotId,
      inspectorId: defect.inspectorId,
      inspectorName: defect.inspector?.name || 'Site Monitor',
      contractorId: defect.contractorId,
      contractorName: defect.contractor?.name || 'Unassigned Contractor',
      title: defect.title,
      description: defect.description,
      severity: defect.severity,
      status: defect.status,
      category: defect.category,
      resolutionNotes: defect.resolutionNotes || '',
      targetDate: defect.targetDate ? defect.targetDate.toISOString().split('T')[0] : null,
      createdAt: defect.createdAt.toISOString(),
      updatedAt: defect.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating defect ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 11. PATCH /api/punch-lists/:id: Update defect resolution or status
app.patch('/api/punch-lists/:id', async (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes, contractorId, actorName, actorRole } = req.body;
  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;
    if (contractorId) updateData.contractorId = contractorId;

    const updated = await prisma.punchListDefect.update({
      where: { id },
      data: updateData,
      include: { inspector: true, contractor: true }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'DEFECT',
        entityId: id,
        action: `DEFECT_${status || 'UPDATED'}`,
        actorName: actorName || 'Field Team',
        actorRole: actorRole || 'INSPECTOR',
        details: `Defect "${updated.title}" updated to status ${status}. Notes: ${resolutionNotes || 'None'}.`,
      }
    });

    res.json({
      id: updated.id,
      slotId: updated.slotId,
      inspectorId: updated.inspectorId,
      inspectorName: updated.inspector?.name || 'Site Monitor',
      contractorId: updated.contractorId,
      contractorName: updated.contractor?.name || 'Unassigned Contractor',
      title: updated.title,
      description: updated.description,
      severity: updated.severity,
      status: updated.status,
      category: updated.category,
      resolutionNotes: updated.resolutionNotes || '',
      targetDate: updated.targetDate ? updated.targetDate.toISOString().split('T')[0] : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating defect ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 12. POST /api/civil-works/update-milestone: Update site engineering milestone
app.post('/api/civil-works/update-milestone', async (req, res) => {
  const { milestoneId, currentPercentage, status, inspectorSignOff, remarks, actorName } = req.body;
  try {
    const updateData: any = {};
    if (currentPercentage !== undefined) updateData.currentPercentage = currentPercentage;
    if (status) updateData.status = status;
    if (inspectorSignOff !== undefined) {
      updateData.inspectorSignOff = inspectorSignOff;
      if (inspectorSignOff) updateData.signOffDate = new Date();
    }
    if (remarks !== undefined) updateData.remarks = remarks;

    const updated = await prisma.civilWorksMilestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CIVIL_WORKS',
        entityId: milestoneId,
        action: 'CIVIL_MILESTONE_UPDATED',
        actorName: actorName || 'Engr. Ricardo Gomez',
        actorRole: 'INSPECTOR',
        details: `${updated.phaseName} updated to ${updated.currentPercentage}%. Status: ${updated.status}. Sign-off: ${updated.inspectorSignOff ? 'APPROVED' : 'PENDING'}.`,
      }
    });

    res.json({
      id: updated.id,
      parcelId: updated.parcelId,
      phaseName: updated.phaseName,
      targetPercentage: updated.targetPercentage,
      currentPercentage: updated.currentPercentage,
      status: updated.status,
      inspectorSignOff: updated.inspectorSignOff,
      signOffDate: updated.signOffDate ? updated.signOffDate.toISOString().split('T')[0] : null,
      remarks: updated.remarks || '',
    });
  } catch (error) {
    console.error('Error updating civil works milestone:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 13. POST /api/qa-logs: Submit a weekly progress site inspection log
app.post('/api/qa-logs', async (req, res) => {
  const { slotId, complianceStatus, progressPercentage, structuralCheck, safetyCheck, remarks, siteActivity } = req.body;
  try {
    const inspector = await prisma.user.findFirst({
      where: { role: Role.INSPECTOR }
    });

    if (!inspector) {
      return res.status(400).json({ error: 'No Inspector user found in database' });
    }

    const log = await prisma.weeklyProgressLog.create({
      data: {
        slotId,
        inspectorId: inspector.id,
        complianceStatus,
        percentageComplete: progressPercentage,
        structuralCheck,
        safetyCheck,
        notes: remarks,
        materialsUsed: 'Standard concrete aggregates, leveling grids, drainage pipelines',
        siteActivity,
      },
      include: { inspector: true }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: slotId,
        action: 'QA_INSPECTION_RECORDED',
        actorName: inspector.name,
        actorRole: 'INSPECTOR',
        details: `QA Log submitted for Lot ${slotId}: ${progressPercentage}% complete. Compliance: ${complianceStatus}.`,
      }
    });

    res.json({
      id: log.id,
      date: log.date.toISOString().split('T')[0],
      inspectorName: log.inspector.name,
      slotId: log.slotId,
      complianceStatus: log.complianceStatus || 'Compliant',
      progressPercentage: log.percentageComplete,
      structuralCheck: log.structuralCheck || 'Pass',
      safetyCheck: log.safetyCheck || 'Pass',
      remarks: log.notes,
      siteActivity: log.siteActivity || 'Ready',
    });
  } catch (error) {
    console.error('Error submitting QA log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 14. POST /api/contractors/update-progress: Sync contractor changes
app.post('/api/contractors/update-progress', async (req, res) => {
  const { contractors } = req.body;
  try {
    const updatedContractors = [];
    for (const c of contractors) {
      const updated = await prisma.contractor.update({
        where: { id: c.id },
        data: {
          activeManpower: c.activeManpower,
          milestoneProgress: c.milestoneProgress
        }
      });
      updatedContractors.push(updated);
    }
    res.json(updatedContractors);
  } catch (error) {
    console.error('Error syncing contractors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 15. POST /api/manpower-audits: Submits a daily field roll-call and spot-check audit
app.post('/api/manpower-audits', async (req, res) => {
  const {
    contractorId,
    contractorName,
    specialty,
    shift = 'Morning',
    claimedHeadcount,
    verifiedHeadcount,
    assignedSectorOrLot,
    supervisorName = 'Engr. Ricardo Gomez',
    gpsCoordinates = '14.2612° N, 121.5124° E (Cavinti Highland Site)',
    remarks = '',
    productivityIndex = 90
  } = req.body;

  try {
    const discrepancy = Number(claimedHeadcount || 0) - Number(verifiedHeadcount || 0);
    const verificationStatus = discrepancy === 0 ? 'VERIFIED_MATCH' : 'DISCREPANCY_FLAGGED';

    let auditId = `AUD-${Date.now()}`;
    let auditRecord: any = {
      id: auditId,
      date: new Date().toISOString().split('T')[0],
      contractorId,
      contractorName,
      specialty,
      shift,
      claimedHeadcount: Number(claimedHeadcount || 0),
      verifiedHeadcount: Number(verifiedHeadcount || 0),
      discrepancy,
      assignedSectorOrLot,
      supervisorName,
      gpsCoordinates,
      verificationStatus,
      photoEvidenceVerified: true,
      remarks,
      productivityIndex: Number(productivityIndex || 90)
    };

    if ((prisma as any).dailyManpowerAudit) {
      try {
        const created = await (prisma as any).dailyManpowerAudit.create({
          data: {
            contractorId,
            contractorName,
            specialty,
            shift,
            claimedHeadcount: Number(claimedHeadcount || 0),
            verifiedHeadcount: Number(verifiedHeadcount || 0),
            discrepancy,
            assignedSectorOrLot,
            supervisorName,
            gpsCoordinates,
            verificationStatus,
            photoEvidenceVerified: true,
            remarks,
            productivityIndex: Number(productivityIndex || 90)
          }
        });
        auditRecord.id = created.id;
        auditRecord.date = created.date.toISOString().split('T')[0];
      } catch (dbErr) {
        console.warn('Could not insert to DB dailyManpowerAudit table directly, using generated record:', dbErr);
      }
    }

    // Automatically synchronize the contractor's verified active manpower
    try {
      if (contractorId) {
        await prisma.contractor.update({
          where: { id: contractorId },
          data: {
            activeManpower: Number(verifiedHeadcount || 0)
          }
        });
      }
    } catch (contractorErr) {
      console.warn('Could not update contractor headcount directly:', contractorErr);
    }

    // Record in ProcessAuditLog
    await prisma.processAuditLog.create({
      data: {
        entityType: 'CIVIL_WORKS',
        entityId: contractorId || auditId,
        action: 'MANPOWER_ROLLCALL_AUDITED',
        actorName: supervisorName,
        actorRole: 'INSPECTOR',
        details: `Field spot-check for ${contractorName}: Claimed ${claimedHeadcount} vs Verified ${verifiedHeadcount} workers. Status: ${verificationStatus}.`,
      }
    });

    res.json(auditRecord);
  } catch (error) {
    console.error('Error recording manpower audit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Serve Vite build outputs in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend Server API is running on http://localhost:${PORT}`);
});
