/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LandParcel {
  id: string;
  name: string; // e.g., "Cavinti Highland Crest"
  location: string;
  totalAreaSqm: number;
  acquisitionCost: number;
  subdividedSlotsCount: number;
  acquisitionDate: string;
}

export type SlotStatus = 
  | 'Available' 
  | 'Reserved' 
  | 'Under Contract' 
  | 'Developing' 
  | 'Titling Phase' 
  | 'Turnover Ready' 
  | 'Handed Over'
  | 'Sold';

export interface Slot {
  id: string; // e.g., "SLOT-01"
  parcelId: string;
  slotNumber: number;
  areaSqm: number;
  basePrice: number;
  status: SlotStatus;
  row: number; // For the interactive grid render
  col: number; // For the interactive grid render
  assignedClientId: string | null;
}

export interface TitleMilestones {
  currentPhase?: string;
  motherTitleVerified?: boolean;
  darClearanceApproved?: boolean;
  lguPermitIssued?: boolean;
  dhsudLicenseToSell?: boolean;
  legalPermitsApproved?: boolean;
  ctsSigned?: boolean;
  deedOfSaleSigned?: boolean;
  birEcarIssued?: boolean;
  taxDeclarationTransferred?: boolean;
  landTitleReleased?: boolean;
  registryOfDeedsTctReleased?: boolean;
  certificateOfAcceptanceSigned?: boolean;
  tctNumber?: string | null;
  taxDecNumber?: string | null;
}

export interface BuyerKyc {
  govtIdVerified: boolean;
  tinVerified: boolean;
  proofOfIncomeVerified: boolean;
  proofOfAddressVerified: boolean;
  maritalConsentVerified: boolean;
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED';
  verifiedAt?: string | null;
  notes?: string | null;
}

export interface PaymentItem {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paidDate?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  contact: string;
  accountStatus?: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  inviteToken?: string | null;
  inviteTokenExpiry?: string | null;
  slotId: string | null; // Selected lot
  packageName: string; // e.g., "Standard Package (Land + Subgraded Access)"
  paymentPlan: 'Installment' | 'Cash';
  totalContractPrice: number;
  monthlyInstallment: number;
  balance: number;
  amountPaid: number;
  titleMilestones: TitleMilestones;
  buyerKyc?: BuyerKyc;
  payments: PaymentItem[];
  registrationDate: string;
}

export interface QALog {
  id: string;
  date: string;
  inspectorName: string;
  slotId: string;
  complianceStatus: 'Compliant' | 'Corrective Action Required';
  progressPercentage: number;
  structuralCheck: 'Pass' | 'Fail';
  safetyCheck: 'Pass' | 'Fail';
  remarks: string;
  siteActivity: 'Excavation' | 'Leveling' | 'Road Subgrade' | 'Drainage Install' | 'Ready';
}

export interface PunchListDefect {
  id: string;
  slotId: string;
  inspectorId: string;
  inspectorName: string;
  contractorId?: string | null;
  contractorName?: string | null;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CONTRACTOR_RECTIFIED' | 'RE_INSPECTED' | 'CLOSED';
  category: 'ROADS' | 'DRAINAGE' | 'GRADING' | 'BOUNDARY' | 'UTILITIES';
  resolutionNotes?: string | null;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CivilWorksMilestone {
  id: string;
  parcelId: string;
  phaseName: string;
  targetPercentage: number;
  currentPercentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'INSPECTION_PENDING' | 'COMPLETED';
  inspectorSignOff: boolean;
  signOffDate?: string | null;
  remarks?: string | null;
}

export interface ProcessAuditLog {
  id: string;
  entityType: 'SLOT' | 'CLIENT' | 'TITLING' | 'DEFECT' | 'CIVIL_WORKS' | 'TURNOVER';
  entityId: string;
  action: string;
  actorName: string;
  actorRole: string;
  details: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  specialty: 'Land Leveling' | 'Road Construction' | 'Manpower Supply' | 'Civil Engineering' | 'Land Leveling & Grading' | 'Road Paving & Curbs' | 'Civil Drainage & Utilities';
  contractAmount: number;
  paidAmount: number;
  activeManpower: number;
  milestoneProgress: number; // e.g., 75%
  rating: number; // Rating out of 5
  contact?: string;
  activeProjectSite?: string;
}

export interface PayrollRecord {
  id: string;
  date: string;
  payeeName: string;
  role: 'Internal Staff' | 'Site Monitor' | 'Contractor';
  disbursementType: 'Salary' | 'Contract Milestone';
  amount: number;
  status: 'Disbursed' | 'Pending';
  paymentMethod: string;
}

export interface CompanyBudget {
  initialCapital: number;
  landAcquisitionCost: number;
  subdevelopmentCostPaid: number;
  collectedInstallments: number;
  currentCashReserve: number;
  roadInfrastructureFee: number;
  nextHectareCost: number;
}

export interface DailyManpowerAudit {
  id: string;
  date: string;
  contractorId: string;
  contractorName: string;
  specialty: string;
  shift: 'Morning' | 'Afternoon' | 'Full Day';
  claimedHeadcount: number;
  verifiedHeadcount: number;
  discrepancy: number; // claimedHeadcount - verifiedHeadcount
  assignedSectorOrLot: string;
  supervisorName: string;
  gpsCoordinates: string;
  verificationStatus: 'VERIFIED_MATCH' | 'DISCREPANCY_FLAGGED' | 'RESOLVED';
  photoEvidenceVerified: boolean;
  remarks: string;
  productivityIndex: number; // e.g. 92%
}

export interface LaborAllocation {
  id: string;
  contractorId: string;
  contractorName?: string;
  sectorName: string;
  targetLots: string; // e.g., "Lots 01 - 06"
  assignedHeadcount: number;
  workScope: string; // e.g., "Heavy Grading & Subbase Compaction"
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  notes?: string;
  updatedAt?: string;
}

export interface AIManpowerRecommendation {
  id: string;
  title: string;
  rationale: string;
  targetSector: string;
  targetLots: string;
  contractorId: string;
  contractorName: string;
  recommendedHeadcount: number;
  currentHeadcount: number;
  suggestedScope: string;
  priority: 'HIGH' | 'MEDIUM' | 'OPTIMIZATION';
  impact: string;
  applied?: boolean;
}

export interface UserSession {
  id?: string;
  email: string;
  name: string;
  role: 'Admin' | 'Inspector' | 'Client';
  clientId?: string; // If role is 'Client'
  accountStatus?: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  token?: string;
}

