import express from 'express';
import { 
  PrismaClient, Role, SlotStatus, PaymentMethod, PaymentStatus, 
  PayrollRole, DisbursementType, PayrollStatus, AccountStatus 
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      polygonPoints: s.polygonPoints,
      blockName: s.blockName,
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

    // K. Project Management System (PMS) Models
    let tasks: any[] = [];
    try {
      const dbTasks = await prisma.projectTask.findMany({ orderBy: { createdAt: 'desc' } });
      tasks = dbTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        assigneeName: t.assigneeName || '',
        assigneeRole: t.assigneeRole || '',
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
        startDate: t.startDate ? t.startDate.toISOString().split('T')[0] : '',
        estimatedHours: t.estimatedHours || 0,
        actualHours: t.actualHours || 0,
        category: t.category || '',
        milestonePhase: t.milestonePhase || '',
        subtasks: t.subtasksJson ? JSON.parse(t.subtasksJson) : [],
        tags: t.tags ? t.tags.split(',') : [],
        createdAt: t.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Project tasks error:', e);
    }

    let siteLogs: any[] = [];
    try {
      const dbSiteLogs = await prisma.dailySiteLog.findMany({ orderBy: { date: 'desc' } });
      siteLogs = dbSiteLogs.map(s => ({
        id: s.id,
        date: s.date.toISOString(),
        weather: s.weather,
        temperature: s.temperature || '',
        activeHeadcount: s.activeHeadcount,
        equipmentOnSite: s.equipmentOnSite || '',
        toolboxTopic: s.toolboxTopic || '',
        workCompleted: s.workCompleted,
        delaysOrIssues: s.delaysOrIssues || '',
        supervisorName: s.supervisorName,
        createdAt: s.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Site logs error:', e);
    }

    let documents: any[] = [];
    try {
      const dbDocs = await prisma.projectDocument.findMany({ orderBy: { createdAt: 'desc' } });
      documents = dbDocs.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        fileUrl: d.fileUrl || '',
        fileSize: d.fileSize || '',
        version: d.version,
        status: d.status,
        uploadedBy: d.uploadedBy,
        notes: d.notes || '',
        createdAt: d.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Documents error:', e);
    }

    let risks: any[] = [];
    try {
      const dbRisks = await prisma.projectRisk.findMany({ orderBy: { riskScore: 'desc' } });
      risks = dbRisks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        riskScore: r.riskScore,
        mitigationPlan: r.mitigationPlan,
        status: r.status,
        ownerName: r.ownerName,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Risks error:', e);
    }

    let changeOrders: any[] = [];
    try {
      const dbCOs = await prisma.changeOrder.findMany({ orderBy: { createdAt: 'desc' } });
      changeOrders = dbCOs.map(c => ({
        id: c.id,
        orderNumber: c.orderNumber,
        title: c.title,
        contractorName: c.contractorName,
        requestedAmount: Number(c.requestedAmount),
        approvedAmount: c.approvedAmount ? Number(c.approvedAmount) : null,
        status: c.status,
        justification: c.justification,
        approvedBy: c.approvedBy || '',
        createdAt: c.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Change orders error:', e);
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
      manpowerAudits,
      tasks,
      siteLogs,
      documents,
      risks,
      changeOrders
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================================
// REAL-TIME SSE (SERVER-SENT EVENTS) ENGINE
// Pushes live data change notifications to all connected browser clients.
// No polling needed — the browser receives a push within ~50ms of any mutation.
// ============================================================================

// Registry of all active SSE connections
const sseClients = new Set<import('express').Response>();

// Broadcast a data-change event to every connected browser tab
export function broadcastChange(entity: string, payload?: Record<string, unknown>) {
  const message = `data: ${JSON.stringify({ type: 'data_changed', entity, ...payload })}\n\n`;
  sseClients.forEach(client => {
    try { client.write(message); } catch { /* client disconnected */ }
  });
}

// GET /api/events — long-lived SSE stream (one connection per browser tab)
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial heartbeat so the browser knows it's connected
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  sseClients.add(res);

  // Keep-alive ping every 25 seconds to prevent proxy timeouts
  const pingInterval = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(pingInterval); }
  }, 25000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
  });
});

// ============================================================================
// GRANULAR GET ENDPOINTS (for targeted post-mutation refetch)
// Each endpoint returns only one data slice — much faster than /api/all-data.
// ============================================================================

// GET /api/clients — Buyer roster only
app.get('/api/clients', async (req, res) => {
  try {
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
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/slots — Lot inventory only
app.get('/api/slots', async (req, res) => {
  try {
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
      polygonPoints: s.polygonPoints,
      blockName: s.blockName,
      assignedClientId: s.clientPackage?.userId || null,
    }));
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/punch-lists — Defect tickets only
app.get('/api/punch-lists', async (req, res) => {
  try {
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
    res.json(punchListDefects);
  } catch (error) {
    console.error('Error fetching punch lists:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/civil-milestones — Civil works milestones only
app.get('/api/civil-milestones', async (req, res) => {
  try {
    const dbMilestones = await prisma.civilWorksMilestone.findMany({
      orderBy: { phaseName: 'asc' }
    });
    const civilWorksMilestones = dbMilestones.map(m => ({
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
    res.json(civilWorksMilestones);
  } catch (error) {
    console.error('Error fetching civil milestones:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/audit-logs — Process audit log (last 50)
app.get('/api/audit-logs', async (req, res) => {
  try {
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
    res.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/payroll-records — Payroll list only
app.get('/api/payroll-records', async (req, res) => {
  try {
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
    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tasks-list — Project tasks only
app.get('/api/tasks-list', async (req, res) => {
  try {
    const dbTasks = await prisma.projectTask.findMany({ orderBy: { createdAt: 'desc' } });
    const tasks = dbTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      assigneeName: t.assigneeName || '',
      assigneeRole: t.assigneeRole || '',
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
      startDate: t.startDate ? t.startDate.toISOString().split('T')[0] : '',
      estimatedHours: t.estimatedHours || 0,
      actualHours: t.actualHours || 0,
      category: t.category || '',
      milestonePhase: t.milestonePhase || '',
      subtasks: t.subtasksJson ? JSON.parse(t.subtasksJson) : [],
      tags: t.tags ? t.tags.split(',') : [],
      createdAt: t.createdAt.toISOString(),
    }));
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/contractors-list — Contractor roster only
app.get('/api/contractors-list', async (req, res) => {
  try {
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
    res.json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



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

    if (!user) {
      return res.status(404).json({ 
        error: 'Invalid activation token or account has already been claimed.',
        alreadyClaimed: true 
      });
    }

    if (user.inviteTokenExpiry && new Date() > user.inviteTokenExpiry) {
      return res.status(410).json({ error: 'This handover activation link has expired (7-day validity). Please contact the subdivision sales office for a new link.' });
    }

    res.json({
      valid: true,
      client: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact || '',
        slotId: user.clientPackage?.slotId || null,
        packageName: user.clientPackage?.packageType || 'Cavinti Highland Crest Land Parcel',
        totalContractPrice: Number(user.clientPackage?.price || 48000),
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
    const user = await prisma.user.findFirst({
      where: { inviteToken: cleanToken }
    });

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
        inviteToken: null,
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
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: clientId },
          { email: clientId.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Buyer record ${clientId} not found.` });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days validity

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        inviteToken: token,
        inviteTokenExpiry: expiry,
        accountStatus: 'INVITED',
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: user.id,
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

// ============================================================================
// DIRECT SMTP / EMAIL DISPATCH ENGINE (Node.js counterpart to PHPMailer)
// ============================================================================

export async function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (user && pass) {
    if (host.includes('gmail') || user.includes('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendHandoverActivationEmail({
  toEmail,
  buyerName,
  inviteToken,
  slotId,
  originUrl,
}: {
  toEmail: string;
  buyerName: string;
  inviteToken: string;
  slotId?: string;
  originUrl?: string;
}) {
  const baseUrl = originUrl || process.env.APP_URL || 'http://localhost:3000';
  const activationUrl = `${baseUrl}/?activateToken=${inviteToken}`;
  const senderFrom = process.env.SMTP_FROM || '"Cavinti Highland Crest" <no-reply@cavintihighlandcrest.ph>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 8px 0 0 0; letter-spacing: -0.5px; }
        .subtitle { color: #60a5fa; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 14px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 20px; }
        .card { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #cbd5e1; }
        .card-row:last-child { margin-bottom: 0; }
        .highlight { color: #38bdf8; font-weight: bold; font-family: monospace; }
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 1px; }
        .token-box { background: #020617; border: 1px dashed #334155; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 12px; }
        .footer { background: #020617; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="subtitle">DEVELOPER-TO-BUYER HANDOVER PIPELINE</div>
          <div class="title">Cavinti Highland Crest</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${buyerName},</div>
          <div class="text">
            Welcome to Cavinti Highland Crest! Your buyer portal account has been officially provisioned. You can now claim your account to access your live property documents, subdivision civil works progress, and government titling milestones (LGU, DAR, DHSUD, BIR eCAR, and Registry of Deeds TCT releases).
          </div>
          
          <div class="card">
            <div class="card-row">
              <span>Assigned Lot:</span>
              <span class="highlight">${slotId || 'Cavinti Highland Crest Land Parcel'}</span>
            </div>
            <div class="card-row">
              <span>Account Status:</span>
              <span style="color: #34d399; font-weight: bold;">INVITATION READY</span>
            </div>
            <div class="card-row">
              <span>Link Validity:</span>
              <span>7 Calendar Days</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${activationUrl}" class="btn" target="_blank">Claim & Activate Buyer Portal</a>
          </div>

          <div class="text" style="font-size: 12px;">
            Or copy and paste your direct activation link into your browser:
            <div class="token-box">${activationUrl}</div>
          </div>
        </div>
        <div class="footer">
          XYZ Realty Development Corp. • Cavinti, Laguna, Philippines<br>
          Official Encrypted Property Management & Titling Registry
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getMailTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: senderFrom,
        to: toEmail,
        subject: `[Cavinti Highland Crest] Activate Your Property Buyer Account - ${buyerName}`,
        html: htmlContent,
        text: `Hello ${buyerName},\n\nYour buyer account for Cavinti Highland Crest is ready for handover.\nPlease activate your account using this link:\n${activationUrl}\n\nXYZ Realty Corp.`,
      });
      return {
        success: true,
        delivered: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) ? String(nodemailer.getTestMessageUrl(info)) : null,
        mode: 'GMAIL_SMTP',
      };
    } catch (smtpErr: any) {
      if (smtpErr?.code === 'EAUTH') {
        throw new Error('Gmail SMTP Authentication Failed (535 Bad Credentials). Please confirm 2-Step Verification is enabled on your Google Account and generate a new 16-character App Password at https://myaccount.google.com/apppasswords');
      }
      throw smtpErr;
    }
  } else {
    // Ethereal test inbox fallback when SMTP credentials are not yet configured in .env
    let etherealPreview: string | null = null;
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const info = await testTransporter.sendMail({
        from: senderFrom,
        to: toEmail,
        subject: `[Cavinti Highland Crest] Activate Your Property Buyer Account - ${buyerName}`,
        html: htmlContent,
        text: `Hello ${buyerName},\n\nYour buyer account for Cavinti Highland Crest is ready.\nLink: ${activationUrl}`,
      });
      etherealPreview = nodemailer.getTestMessageUrl(info) ? String(nodemailer.getTestMessageUrl(info)) : null;
    } catch (e) {
      console.warn('Ethereal fallback notice:', e);
    }

    return {
      success: true,
      delivered: true,
      messageId: `DEV-MAIL-${Date.now()}`,
      previewUrl: etherealPreview,
      mode: etherealPreview ? 'ETHEREAL_TEST' : 'DEV_SIMULATION',
    };
  }
}

// 4.1 POST /api/clients/send-handover-email: Sends direct HTML email to the buyer
app.post('/api/clients/send-handover-email', async (req, res) => {
  const { clientId, email, originUrl, actorName, actorRole } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      include: { clientPackage: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    // Ensure token exists
    let token = user.inviteToken;
    let expiry = user.inviteTokenExpiry;
    if (!token) {
      token = crypto.randomBytes(24).toString('hex');
      expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: clientId },
        data: {
          inviteToken: token,
          inviteTokenExpiry: expiry,
          accountStatus: 'INVITED',
        }
      });
    }

    const targetEmail = email || user.email;
    const sendResult = await sendHandoverActivationEmail({
      toEmail: targetEmail,
      buyerName: user.name,
      inviteToken: token,
      slotId: user.clientPackage?.slotId || undefined,
      originUrl,
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: clientId,
        action: 'HANDOVER_EMAIL_DISPATCHED',
        actorName: actorName || 'Operations Lead',
        actorRole: actorRole || 'ADMIN',
        details: `Dispatched direct handover onboarding email to ${user.name} (${targetEmail}). Mode: ${sendResult.mode}.`,
      }
    });

    res.json({
      success: true,
      deliveredTo: targetEmail,
      buyerName: user.name,
      mode: sendResult.mode,
      messageId: sendResult.messageId,
      previewUrl: sendResult.previewUrl,
    });
  } catch (error: any) {
    console.error('Error dispatching handover email:', error);
    res.status(500).json({ error: error?.message || 'Failed to dispatch email.' });
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

    broadcastChange('parcels');
    broadcastChange('slots');
    res.json(parcel);
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2.5. DELETE /api/parcels/:id: Deletes a land parcel and resets related records
app.delete('/api/parcels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Unlink any client packages tied to slots in this parcel
    const parcelSlots = await prisma.slot.findMany({ where: { parcelId: id }, select: { id: true } });
    const slotIds = parcelSlots.map(s => s.id);
    if (slotIds.length > 0) {
      await prisma.clientPackage.updateMany({
        where: { slotId: { in: slotIds } },
        data: { slotId: null }
      });
      await prisma.slot.deleteMany({ where: { parcelId: id } });
    }

    await prisma.civilWorksMilestone.deleteMany({ where: { parcelId: id } });
    await prisma.landParcel.delete({ where: { id } });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'PARCEL',
        entityId: id,
        action: 'LAND_PARCEL_DELETED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Deleted land parcel tract ID: ${id}.`,
      }
    });

    broadcastChange('parcels');
    broadcastChange('slots');
    res.json({ success: true, message: `Parcel ${id} removed.` });
  } catch (error) {
    console.error('Error deleting parcel:', error);
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

    broadcastChange('slots');
    broadcastChange('auditLogs');
    res.json(createdSlots);
  } catch (error) {
    console.error('Error subdividing slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3.5. POST /api/slots/import-cad: Bulk imports parsed AutoCAD lots into PostgreSQL
app.post('/api/slots/import-cad', async (req, res) => {
  const { parcelId = 'PARCEL-CST', lots = [] } = req.body;
  try {
    if (!Array.isArray(lots) || lots.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of parsed CAD lots.' });
    }

    // Ensure valid target parcel exists in DB
    let targetParcelId = parcelId;
    const existingParcel = await prisma.landParcel.findFirst({
      where: { id: targetParcelId }
    });
    if (!existingParcel) {
      const firstParcel = await prisma.landParcel.findFirst();
      if (firstParcel) {
        targetParcelId = firstParcel.id;
      } else {
        const defaultParcel = await prisma.landParcel.create({
          data: {
            id: 'PARCEL-CST',
            name: 'Cavinti Highland Phase 1',
            location: 'Cavinti, Laguna, Philippines',
            totalAreaSqm: 10000,
            purchaseCost: 450000,
            totalSlots: lots.length,
            acquisitionDate: new Date(),
          }
        });
        targetParcelId = defaultParcel.id;
      }
    }

    const createdSlots = [];
    for (const lot of lots) {
      const slotId = `SLOT-${Number(lot.slotNumber).toString().padStart(2, '0')}`;
      const pointsJson = lot.points ? JSON.stringify(lot.points) : null;
      const row = Math.ceil(lot.slotNumber / 5);
      const col = ((lot.slotNumber - 1) % 5) + 1;

      const slot = await prisma.slot.upsert({
        where: { id: slotId },
        update: {
          parcelId: targetParcelId,
          sizeSqm: lot.areaSqm || 500,
          price: lot.basePrice || (lot.areaSqm || 500) * 100,
          polygonPoints: pointsJson,
          blockName: lot.blockName || 'Phase 1',
        },
        create: {
          id: slotId,
          parcelId: targetParcelId,
          slotNumber: lot.slotNumber,
          sizeSqm: lot.areaSqm || 500,
          price: lot.basePrice || (lot.areaSqm || 500) * 100,
          status: SlotStatus.AVAILABLE,
          row,
          col,
          polygonPoints: pointsJson,
          blockName: lot.blockName || 'Phase 1',
        }
      });
      createdSlots.push(slot);
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: parcelId,
        action: 'AUTOCAD_LOTS_IMPORTED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Imported and synchronized ${lots.length} lots from AutoCAD masterplan drawing.`,
      }
    });

    broadcastChange('slots');
    res.json({ success: true, count: createdSlots.length, slots: createdSlots });
  } catch (error) {
    console.error('Error importing CAD lots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3.6. DELETE /api/slots/clear-all: Wipes all slots for a blank masterplan
app.delete('/api/slots/clear-all', async (req, res) => {
  try {
    // Unlink any client packages
    await prisma.clientPackage.updateMany({
      data: { slotId: null }
    });

    await prisma.slot.deleteMany({});

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: 'PARCEL-CST',
        action: 'MASTERPLAN_CLEARED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: 'Cleared all lot records from masterplan grid. Ready for new AutoCAD survey import.',
      }
    });

    broadcastChange('slots');
    broadcastChange('clients');
    res.json({ success: true, message: 'All lots cleared successfully.' });
  } catch (error) {
    console.error('Error clearing lots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3.7. POST /api/ai/suggest-lot-pricing: AI Lot Pricing & Expense Valuation
app.post('/api/ai/suggest-lot-pricing', async (req, res) => {
  const { 
    parcelId, 
    targetProfitMargin = 35, 
    contingencyPercent = 8, 
    customAcquisitionCost, 
    customCivilWorksCost, 
    customLaborCost 
  } = req.body;

  try {
    let parcel = null;
    if (parcelId) {
      parcel = await prisma.landParcel.findUnique({ where: { id: parcelId } });
    }
    if (!parcel) {
      parcel = await prisma.landParcel.findFirst();
    }

    const acquisitionCost = customAcquisitionCost !== undefined 
      ? Number(customAcquisitionCost) 
      : Number(parcel?.purchaseCost || 450000);

    const milestones = await prisma.civilWorksMilestone.findMany({
      where: parcel ? { parcelId: parcel.id } : undefined
    });
    const civilWorksCost = customCivilWorksCost !== undefined
      ? Number(customCivilWorksCost)
      : Math.max(milestones.length * 35000, 175000);

    const contractors = await prisma.contractor.findMany();
    const payrollRecords = await prisma.payrollRecord.findMany();
    const totalContractorAmount = contractors.reduce((sum, c) => sum + Number(c.contractAmount || 0), 0);
    const totalPayroll = payrollRecords.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const contractorLaborCost = customLaborCost !== undefined
      ? Number(customLaborCost)
      : Math.max(totalContractorAmount, totalPayroll, 120000);

    const dbSlots = await prisma.slot.findMany({
      where: parcel ? { parcelId: parcel.id } : undefined,
      orderBy: { slotNumber: 'asc' }
    });

    const slots: any[] = dbSlots.map(s => ({
      id: s.id,
      parcelId: s.parcelId,
      slotNumber: s.slotNumber,
      areaSqm: s.sizeSqm,
      basePrice: Number(s.price),
      status: mapDbStatusToString(s.status),
      row: s.row,
      col: s.col,
      polygonPoints: s.polygonPoints,
      blockName: s.blockName,
      assignedClientId: null,
    }));

    const { calculateAILotPricing } = await import('./src/utils/aiPricingEngine.js');
    const result = calculateAILotPricing({
      acquisitionCost,
      civilWorksCost,
      contractorLaborCost,
      permittingOverheadCost: 65000,
      contingencyPercent: Number(contingencyPercent) || 8,
      targetProfitMargin: Number(targetProfitMargin) || 35,
      slots,
      parcel: parcel ? {
        id: parcel.id,
        name: parcel.name,
        location: parcel.location,
        totalAreaSqm: parcel.totalAreaSqm,
        acquisitionCost: Number(parcel.purchaseCost),
        subdividedSlotsCount: parcel.totalSlots,
        acquisitionDate: parcel.acquisitionDate.toISOString().split('T')[0],
      } : null,
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating AI lot pricing suggestion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3.8. POST /api/slots/apply-ai-pricing: Batch apply AI recommended prices to slots
app.post('/api/slots/apply-ai-pricing', async (req, res) => {
  const { updates, parcelId, targetMargin = 35, actorName, actorRole } = req.body;
  try {
    let count = 0;
    if (Array.isArray(updates) && updates.length > 0) {
      for (const item of updates) {
        if (item.slotId && item.newBasePrice) {
          await prisma.slot.update({
            where: { id: item.slotId },
            data: { price: Number(item.newBasePrice) }
          });
          count++;
        }
      }
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: parcelId || 'PARCEL-CST',
        action: 'AI_LOT_PRICING_APPLIED',
        actorName: actorName || 'Operations Lead',
        actorRole: actorRole || 'ADMIN',
        details: `Applied AI Lot Pricing Model (${targetMargin}% target margin) to ${count} subdivided lots based on actual land acquisition and development expenses.`,
      }
    });

    broadcastChange('slots');
    broadcastChange('auditLogs');
    res.json({ success: true, count, message: `Successfully updated pricing for ${count} lots.` });
  } catch (error) {
    console.error('Error applying AI pricing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================================
// PROJECT MANAGEMENT SYSTEM (PMS) API ENDPOINTS
// ============================================================================

// A. Tasks CRUD
app.post('/api/tasks', async (req, res) => {
  const { title, description, assigneeName, assigneeRole, priority, status, dueDate, startDate, estimatedHours, category, milestonePhase, subtasks, tags } = req.body;
  try {
    const task = await prisma.projectTask.create({
      data: {
        title,
        description,
        assigneeName,
        assigneeRole,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        estimatedHours: Number(estimatedHours) || 0,
        actualHours: 0,
        category,
        milestonePhase,
        subtasksJson: subtasks ? JSON.stringify(subtasks) : null,
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CIVIL_WORKS',
        entityId: task.id,
        action: 'TASK_CREATED',
        actorName: 'Mauro R. Principe Jr.',
        actorRole: 'ADMIN',
        details: `Created task "${task.title}" assigned to ${task.assigneeName || 'team'}.`,
      }
    });

    broadcastChange('tasks');
    broadcastChange('auditLogs');
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, subtasks, actualHours, description } = req.body;
  try {
    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (subtasks) data.subtasksJson = JSON.stringify(subtasks);
    if (actualHours !== undefined) data.actualHours = Number(actualHours);
    if (description !== undefined) data.description = description;

    const task = await prisma.projectTask.update({
      where: { id },
      data,
    });
    broadcastChange('tasks');
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.projectTask.delete({ where: { id } });
    broadcastChange('tasks');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// B. Daily Site Logs
app.post('/api/site-logs', async (req, res) => {
  const { weather, temperature, activeHeadcount, equipmentOnSite, toolboxTopic, workCompleted, delaysOrIssues, supervisorName } = req.body;
  try {
    const siteLog = await prisma.dailySiteLog.create({
      data: {
        date: new Date(),
        weather: weather || 'SUNNY',
        temperature,
        activeHeadcount: Number(activeHeadcount) || 0,
        equipmentOnSite,
        toolboxTopic,
        workCompleted,
        delaysOrIssues,
        supervisorName: supervisorName || 'Engr. Ricardo Gomez',
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CIVIL_WORKS',
        entityId: siteLog.id,
        action: 'DAILY_SITE_LOG_POSTED',
        actorName: supervisorName || 'Engr. Ricardo Gomez',
        actorRole: 'INSPECTOR',
        details: `Recorded daily site diary (${weather}, ${activeHeadcount} workers).`,
      }
    });

    broadcastChange('siteLogs');
    broadcastChange('auditLogs');
    res.json(siteLog);
  } catch (error) {
    console.error('Error creating site log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// C. Documents DMS
app.post('/api/documents', async (req, res) => {
  const { title, category, fileUrl, fileSize, version, status, uploadedBy, notes } = req.body;
  try {
    const doc = await prisma.projectDocument.create({
      data: {
        title,
        category: category || 'CAD_DRAWING',
        fileUrl,
        fileSize: fileSize || '2.4 MB',
        version: version || '1.0',
        status: status || 'APPROVED',
        uploadedBy: uploadedBy || 'Mauro R. Principe Jr.',
        notes,
      }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'TITLING',
        entityId: doc.id,
        action: 'DOCUMENT_UPLOADED',
        actorName: uploadedBy || 'Mauro R. Principe Jr.',
        actorRole: 'ADMIN',
        details: `Uploaded ${doc.category} document: "${doc.title}" (v${doc.version}).`,
      }
    });

    broadcastChange('documents');
    broadcastChange('auditLogs');
    res.json(doc);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D. Project Risks
app.post('/api/risks', async (req, res) => {
  const { title, category, likelihood, impact, mitigationPlan, status, ownerName } = req.body;
  try {
    const score = (Number(likelihood) || 3) * (Number(impact) || 3);
    const risk = await prisma.projectRisk.create({
      data: {
        title,
        category: category || 'WEATHER',
        likelihood: Number(likelihood) || 3,
        impact: Number(impact) || 3,
        riskScore: score,
        mitigationPlan: mitigationPlan || '',
        status: status || 'OPEN',
        ownerName: ownerName || 'Engr. Ricardo Gomez',
      }
    });
    broadcastChange('risks');
    res.json(risk);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/risks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, mitigationPlan } = req.body;
  try {
    const data: any = {};
    if (status) data.status = status;
    if (mitigationPlan) data.mitigationPlan = mitigationPlan;
    const risk = await prisma.projectRisk.update({ where: { id }, data });
    res.json(risk);
  } catch (error) {
    console.error('Error updating risk:', error);
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

    broadcastChange('slots');
    broadcastChange('clients');
    broadcastChange('auditLogs');
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
  const { id, name, email, contact, packageName, paymentPlan, totalContractPrice, slotId, registrationDate } = req.body;
  try {
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanSlotId = slotId && typeof slotId === 'string' && slotId.trim().length > 0 ? slotId.trim() : null;

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name,
        contact: contact || undefined,
        inviteToken,
        inviteTokenExpiry,
        accountStatus: 'INVITED',
      },
      create: {
        id: id || `CLI-${Date.now().toString().slice(-4)}`,
        name,
        email: cleanEmail,
        contact: contact || '',
        role: Role.CLIENT,
        accountStatus: 'INVITED',
        inviteToken,
        inviteTokenExpiry,
        createdAt: new Date(registrationDate || Date.now()),
      }
    });

    const clientPackage = await prisma.clientPackage.upsert({
      where: { userId: user.id },
      update: {
        slotId: cleanSlotId,
        price: totalContractPrice || 45000,
        packageType: packageName || 'Standard Land Parcel Access Package',
        paymentMethod: paymentPlan === 'Installment' ? PaymentMethod.INSTALLMENT : PaymentMethod.SPOT_CASH,
      },
      create: {
        userId: user.id,
        slotId: cleanSlotId,
        price: totalContractPrice || 45000,
        packageType: packageName || 'Standard Land Parcel Access Package',
        paymentMethod: paymentPlan === 'Installment' ? PaymentMethod.INSTALLMENT : PaymentMethod.SPOT_CASH,
      }
    });

    // If slot is assigned, update slot status
    if (cleanSlotId) {
      await prisma.slot.updateMany({
        where: { id: cleanSlotId },
        data: { status: SlotStatus.RESERVED }
      });
    }

    // Initialize or keep full Government Titling Tracker
    await prisma.titlePermitTracker.upsert({
      where: { clientPackageId: clientPackage.id },
      update: {},
      create: {
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

    // Initialize or keep Buyer KYC
    await prisma.buyerKyc.upsert({
      where: { userId: user.id },
      update: {},
      create: {
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
        details: `Registered buyer profile for ${user.name} (${user.email}). ${cleanSlotId ? `Assigned Lot: ${cleanSlotId}` : 'Pending lot assignment'}.`,
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
    broadcastChange('clients');
    broadcastChange('slots');
    broadcastChange('auditLogs');
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
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: clientId },
          { email: clientId.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Buyer record ${clientId} not found.` });
    }

    const cleanSlotId = slotId && typeof slotId === 'string' && slotId.trim().length > 0 ? slotId.trim() : null;

    if (cleanSlotId) {
      // Unlink this slot from any other client if previously bound
      await prisma.clientPackage.updateMany({
        where: { slotId: cleanSlotId, userId: { not: user.id } },
        data: { slotId: null }
      });
    }

    const clientPackage = await prisma.clientPackage.upsert({
      where: { userId: user.id },
      update: { slotId: cleanSlotId },
      create: {
        userId: user.id,
        slotId: cleanSlotId,
        price: 48000,
        packageType: 'Cavinti Highland Crest Land Parcel',
        paymentMethod: PaymentMethod.INSTALLMENT,
      }
    });

    let updatedSlot = null;
    if (cleanSlotId) {
      updatedSlot = await prisma.slot.update({
        where: { id: cleanSlotId },
        data: { status: SlotStatus.RESERVED }
      });
    }

    await prisma.processAuditLog.create({
      data: {
        entityType: 'SLOT',
        entityId: cleanSlotId || user.id,
        action: 'SLOT_RESERVED_FOR_CLIENT',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Assigned Lot ${cleanSlotId || 'None'} to buyer ${user.name} (${user.id}). Status set to RESERVED.`,
      }
    });

    broadcastChange('clients');
    broadcastChange('slots');
    broadcastChange('auditLogs');
    res.json({ clientPackage, slot: updatedSlot ? { ...updatedSlot, status: mapDbStatusToString(updatedSlot.status) } : null });
  } catch (error) {
    console.error('Error assigning client to slot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6.5. DELETE /api/clients/:id: Delete Client Account and Release Slot
app.delete('/api/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        clientPackage: true,
        buyerKyc: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Client account ${clientId} not found.` });
    }

    const assignedSlotId = user.clientPackage?.slotId;

    // 1. Release assigned slot back to AVAILABLE if bound
    if (assignedSlotId) {
      await prisma.slot.updateMany({
        where: { id: assignedSlotId },
        data: { status: SlotStatus.AVAILABLE }
      });
    }

    // 2. Cascade delete dependent client records
    if (user.clientPackage) {
      await prisma.installmentLedger.deleteMany({
        where: { clientPackageId: user.clientPackage.id }
      });
      await prisma.titlePermitTracker.deleteMany({
        where: { clientPackageId: user.clientPackage.id }
      });
    }
    await prisma.clientPackage.deleteMany({
      where: { userId: user.id }
    });

    await prisma.buyerKyc.deleteMany({
      where: { userId: user.id }
    });

    // 3. Delete user
    await prisma.user.deleteMany({
      where: { id: user.id }
    });

    // 4. Audit Log
    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: clientId,
        action: 'CLIENT_DELETED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Deleted buyer account ${user.name} (${user.email}). ${assignedSlotId ? `Released Lot ${assignedSlotId} back to AVAILABLE.` : ''}`,
      }
    });

    broadcastChange('clients');
    broadcastChange('slots');
    broadcastChange('auditLogs');
    res.json({ success: true, message: `Buyer account ${user.name} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting client account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Also support POST /api/clients/delete for frontend compatibility
app.post('/api/clients/delete', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        clientPackage: true,
        buyerKyc: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Client account ${clientId} not found.` });
    }

    const assignedSlotId = user.clientPackage?.slotId;

    if (assignedSlotId) {
      await prisma.slot.updateMany({
        where: { id: assignedSlotId },
        data: { status: SlotStatus.AVAILABLE }
      });
    }

    if (user.clientPackage) {
      await prisma.installmentLedger.deleteMany({
        where: { clientPackageId: user.clientPackage.id }
      });
      await prisma.titlePermitTracker.deleteMany({
        where: { clientPackageId: user.clientPackage.id }
      });
    }
    await prisma.clientPackage.deleteMany({
      where: { userId: user.id }
    });

    await prisma.buyerKyc.deleteMany({
      where: { userId: user.id }
    });

    await prisma.user.deleteMany({
      where: { id: user.id }
    });

    await prisma.processAuditLog.create({
      data: {
        entityType: 'CLIENT',
        entityId: clientId,
        action: 'CLIENT_DELETED',
        actorName: 'Operations Lead',
        actorRole: 'ADMIN',
        details: `Deleted buyer account ${user.name} (${user.email}). ${assignedSlotId ? `Released Lot ${assignedSlotId} back to AVAILABLE.` : ''}`,
      }
    });

    res.json({ success: true, message: `Buyer account ${user.name} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting client account:', error);
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

    broadcastChange('clients');
    broadcastChange('slots');
    broadcastChange('auditLogs');
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

    broadcastChange('clients');
    broadcastChange('auditLogs');
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

    broadcastChange('clients');
    broadcastChange('slots');
    broadcastChange('auditLogs');
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

    broadcastChange('punchLists');
    broadcastChange('auditLogs');
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

    broadcastChange('punchLists');
    broadcastChange('auditLogs');
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

    broadcastChange('civilMilestones');
    broadcastChange('auditLogs');
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

    broadcastChange('qaLogs');
    broadcastChange('auditLogs');
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
    broadcastChange('contractors');
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

    broadcastChange('manpowerAudits');
    broadcastChange('contractors');
    broadcastChange('auditLogs');
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

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend Server API is running on http://0.0.0.0:${PORT}`);
});
