/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, CompanyBudget, DailyManpowerAudit, LaborAllocation, AIManpowerRecommendation } from '../types';

export const INITIAL_PARCELS: LandParcel[] = [
  {
    id: "PARCEL-CST",
    name: "Cavinti Highland Crest",
    location: "Brgy. Santiaguel, Cavinti, Laguna",
    totalAreaSqm: 10000,
    acquisitionCost: 450000,
    subdividedSlotsCount: 20,
    acquisitionDate: "2026-01-10"
  }
];

export const INITIAL_SLOTS: Slot[] = [
  // Row 1
  { id: "SLOT-01", parcelId: "PARCEL-CST", slotNumber: 1, areaSqm: 500, basePrice: 45000, status: 'Sold', row: 1, col: 1, assignedClientId: "CLI-001" },
  { id: "SLOT-02", parcelId: "PARCEL-CST", slotNumber: 2, areaSqm: 500, basePrice: 45000, status: 'Available', row: 1, col: 2, assignedClientId: null },
  { id: "SLOT-03", parcelId: "PARCEL-CST", slotNumber: 3, areaSqm: 500, basePrice: 45000, status: 'Sold', row: 1, col: 3, assignedClientId: "CLI-002" }, // Bound to Dave Matthew Reglos
  { id: "SLOT-04", parcelId: "PARCEL-CST", slotNumber: 4, areaSqm: 500, basePrice: 45000, status: 'Available', row: 1, col: 4, assignedClientId: null },
  { id: "SLOT-05", parcelId: "PARCEL-CST", slotNumber: 5, areaSqm: 500, basePrice: 45000, status: 'Sold', row: 1, col: 5, assignedClientId: "CLI-003" },

  // Row 2
  { id: "SLOT-06", parcelId: "PARCEL-CST", slotNumber: 6, areaSqm: 500, basePrice: 48000, status: 'Available', row: 2, col: 1, assignedClientId: null },
  { id: "SLOT-07", parcelId: "PARCEL-CST", slotNumber: 7, areaSqm: 500, basePrice: 48000, status: 'Available', row: 2, col: 2, assignedClientId: null },
  { id: "SLOT-08", parcelId: "PARCEL-CST", slotNumber: 8, areaSqm: 500, basePrice: 48000, status: 'Sold', row: 2, col: 3, assignedClientId: "CLI-004" },
  { id: "SLOT-09", parcelId: "PARCEL-CST", slotNumber: 9, areaSqm: 500, basePrice: 48000, status: 'Available', row: 2, col: 4, assignedClientId: null },
  { id: "SLOT-10", parcelId: "PARCEL-CST", slotNumber: 10, areaSqm: 500, basePrice: 48000, status: 'Available', row: 2, col: 5, assignedClientId: null },

  // Row 3
  { id: "SLOT-11", parcelId: "PARCEL-CST", slotNumber: 11, areaSqm: 500, basePrice: 50000, status: 'Available', row: 3, col: 1, assignedClientId: null },
  { id: "SLOT-12", parcelId: "PARCEL-CST", slotNumber: 12, areaSqm: 500, basePrice: 50000, status: 'Sold', row: 3, col: 2, assignedClientId: "CLI-005" },
  { id: "SLOT-13", parcelId: "PARCEL-CST", slotNumber: 13, areaSqm: 500, basePrice: 50000, status: 'Available', row: 3, col: 3, assignedClientId: null },
  { id: "SLOT-14", parcelId: "PARCEL-CST", slotNumber: 14, areaSqm: 500, basePrice: 50000, status: 'Available', row: 3, col: 4, assignedClientId: null },
  { id: "SLOT-15", parcelId: "PARCEL-CST", slotNumber: 15, areaSqm: 500, basePrice: 50000, status: 'Available', row: 3, col: 5, assignedClientId: null },

  // Row 4
  { id: "SLOT-16", parcelId: "PARCEL-CST", slotNumber: 16, areaSqm: 500, basePrice: 52000, status: 'Available', row: 4, col: 1, assignedClientId: null },
  { id: "SLOT-17", parcelId: "PARCEL-CST", slotNumber: 17, areaSqm: 500, basePrice: 52000, status: 'Available', row: 4, col: 2, assignedClientId: null },
  { id: "SLOT-18", parcelId: "PARCEL-CST", slotNumber: 18, areaSqm: 500, basePrice: 52000, status: 'Available', row: 4, col: 3, assignedClientId: null },
  { id: "SLOT-19", parcelId: "PARCEL-CST", slotNumber: 19, areaSqm: 500, basePrice: 52000, status: 'Sold', row: 4, col: 4, assignedClientId: "CLI-006" },
  { id: "SLOT-20", parcelId: "PARCEL-CST", slotNumber: 20, areaSqm: 500, basePrice: 52000, status: 'Available', row: 4, col: 5, assignedClientId: null }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "CLI-001",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@example.com",
    contact: "+63 917 123 4567",
    slotId: "SLOT-01",
    packageName: "Land Plot + DHSUD Grading Access",
    paymentPlan: "Installment",
    totalContractPrice: 50000,
    monthlyInstallment: 1500,
    balance: 32000,
    amountPaid: 18000,
    registrationDate: "2026-01-15",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: true,
      taxDeclarationTransferred: false,
      landTitleReleased: false
    },
    payments: [
      { id: "PM-101", dueDate: "2026-02-15", amount: 1500, status: "Paid", paidDate: "2026-02-14" },
      { id: "PM-102", dueDate: "2026-03-15", amount: 1500, status: "Paid", paidDate: "2026-03-15" },
      { id: "PM-103", dueDate: "2026-04-15", amount: 1500, status: "Paid", paidDate: "2026-04-10" },
      { id: "PM-104", dueDate: "2026-05-15", amount: 1500, status: "Paid", paidDate: "2026-05-13" },
      { id: "PM-105", dueDate: "2026-06-15", amount: 1500, status: "Pending" },
      { id: "PM-106", dueDate: "2026-07-15", amount: 1500, status: "Pending" },
      { id: "PM-107", dueDate: "2026-08-15", amount: 1500, status: "Pending" },
      { id: "PM-108", dueDate: "2026-09-15", amount: 1500, status: "Pending" }
    ]
  },
  {
    id: "CLI-002",
    name: "Dave Matthew Reglos",
    email: "davematthewreglos@gmail.com",
    contact: "+63 928 987 6543",
    slotId: "SLOT-03",
    packageName: "Land Plot + Pagsanjan Road Access System",
    paymentPlan: "Installment",
    totalContractPrice: 52000,
    monthlyInstallment: 2000,
    balance: 42000,
    amountPaid: 10000,
    registrationDate: "2026-02-01",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: true,
      taxDeclarationTransferred: true,
      landTitleReleased: false
    },
    payments: [
      { id: "PM-201", dueDate: "2026-03-01", amount: 2000, status: "Paid", paidDate: "2026-02-28" },
      { id: "PM-202", dueDate: "2026-04-01", amount: 2000, status: "Paid", paidDate: "2026-03-29" },
      { id: "PM-203", dueDate: "2026-05-01", amount: 2000, status: "Paid", paidDate: "2026-04-30" },
      { id: "PM-204", dueDate: "2026-06-01", amount: 2000, status: "Pending" },
      { id: "PM-205", dueDate: "2026-07-01", amount: 2000, status: "Pending" }
    ]
  },
  {
    id: "CLI-003",
    name: "Maria Regina Santos",
    email: "maria.santos@example.com",
    contact: "+63 915 222 3344",
    slotId: "SLOT-05",
    packageName: "Land Plot + Sta. Cruz Municipal Leveling Grade",
    paymentPlan: "Installment",
    totalContractPrice: 47000,
    monthlyInstallment: 1800,
    balance: 41600,
    amountPaid: 5400,
    registrationDate: "2026-03-05",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: false,
      taxDeclarationTransferred: false,
      landTitleReleased: false
    },
    payments: [
      { id: "PM-301", dueDate: "2026-04-05", amount: 1800, status: "Paid", paidDate: "2026-04-04" },
      { id: "PM-302", dueDate: "2026-05-05", amount: 1800, status: "Paid", paidDate: "2026-05-05" },
      { id: "PM-303", dueDate: "2026-06-05", amount: 1800, status: "Pending" },
      { id: "PM-304", dueDate: "2026-07-05", amount: 1800, status: "Pending" }
    ]
  },
  {
    id: "CLI-004",
    name: "Emilio Alcantara",
    email: "emilio.alcantara@example.com",
    contact: "+1 415 555 2671",
    slotId: "SLOT-08",
    packageName: "Premium Land slot + Cavinti Drainage Culvert",
    paymentPlan: "Cash",
    totalContractPrice: 48000,
    monthlyInstallment: 0,
    balance: 0,
    amountPaid: 48000,
    registrationDate: "2026-01-20",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: true,
      taxDeclarationTransferred: true,
      landTitleReleased: true
    },
    payments: [
      { id: "PM-401", dueDate: "2026-01-20", amount: 48000, status: "Paid", paidDate: "2026-01-20" }
    ]
  },
  {
    id: "CLI-005",
    name: "Clarissa Reyes",
    email: "clarissa.reyes@example.com",
    contact: "+63 905 444 8888",
    slotId: "SLOT-12",
    packageName: "Land Plot + Road Aggregates Subbase",
    paymentPlan: "Installment",
    totalContractPrice: 51000,
    monthlyInstallment: 2500,
    balance: 41000,
    amountPaid: 10000,
    registrationDate: "2026-02-28",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: true,
      taxDeclarationTransferred: false,
      landTitleReleased: false
    },
    payments: [
      { id: "PM-501", dueDate: "2026-03-28", amount: 2500, status: "Paid", paidDate: "2026-03-27" },
      { id: "PM-502", dueDate: "2026-04-28", amount: 2500, status: "Paid", paidDate: "2026-04-26" },
      { id: "PM-503", dueDate: "2026-05-28", amount: 2500, status: "Paid", paidDate: "2026-05-24" },
      { id: "PM-504", dueDate: "2026-06-28", amount: 2500, status: "Pending" }
    ]
  },
  {
    id: "CLI-006",
    name: "Francis Laurel",
    email: "francis.laurel@example.com",
    contact: "+63 947 122 9988",
    slotId: "SLOT-19",
    packageName: "Land Plot + Full Road Access & Concrete Culverts",
    paymentPlan: "Installment",
    totalContractPrice: 53000,
    monthlyInstallment: 3000,
    balance: 44000,
    amountPaid: 9000,
    registrationDate: "2026-03-30",
    titleMilestones: {
      deedOfSaleSigned: true,
      legalPermitsApproved: false,
      taxDeclarationTransferred: false,
      landTitleReleased: false
    },
    payments: [
      { id: "PM-601", dueDate: "2026-04-30", amount: 3000, status: "Paid", paidDate: "2026-04-29" },
      { id: "PM-602", dueDate: "2026-05-30", amount: 3000, status: "Paid", paidDate: "2026-05-24" },
      { id: "PM-603", dueDate: "2026-06-30", amount: 3000, status: "Pending" }
    ]
  }
];

export const INITIAL_CONTRATORS: Contractor[] = [
  {
    id: "CONT-001",
    name: "Laguna Geodetic Earthmovers",
    company: "Laguna Geodetic & Earthmovers Inc.",
    specialty: "Land Leveling",
    contractAmount: 120000,
    paidAmount: 85000,
    activeManpower: 16,
    milestoneProgress: 85,
    rating: 4.8
  },
  {
    id: "CONT-002",
    name: "Calabarzon Road Masters",
    company: "Calabarzon Pavement & Highway Builders",
    specialty: "Road Construction",
    contractAmount: 180000,
    paidAmount: 95000,
    activeManpower: 28,
    milestoneProgress: 55,
    rating: 4.5
  },
  {
    id: "CONT-003",
    name: "Agua-Laguna Drainage Corp",
    company: "Agua-Laguna Drainage & Structural Engineering",
    specialty: "Civil Engineering",
    contractAmount: 75000,
    paidAmount: 30000,
    activeManpower: 14,
    milestoneProgress: 40,
    rating: 4.3
  }
];

export const INITIAL_QA_LOGS: QALog[] = [
  {
    id: "QA-1001",
    date: "2026-05-10",
    inspectorName: "Engr. Ricardo Gomez (Site Lead Monitor)",
    slotId: "SLOT-01",
    complianceStatus: "Compliant",
    progressPercentage: 80,
    structuralCheck: "Pass",
    safetyCheck: "Pass",
    remarks: "Subgraded road compaction validated for Cavinti parcel. Municipal drainage slope compliance has been successfully verified without ponding hazards.",
    siteActivity: "Road Subgrade"
  },
  {
    id: "QA-1002",
    date: "2026-05-18",
    inspectorName: "Engr. Ricardo Gomez (Site Lead Monitor)",
    slotId: "SLOT-03",
    complianceStatus: "Compliant",
    progressPercentage: 55,
    structuralCheck: "Pass",
    safetyCheck: "Pass",
    remarks: "Site grading completed. Grade compliance verified. Gravel and aggregates foundation poured ready for cement pour.",
    siteActivity: "Leveling"
  },
  {
    id: "QA-1003",
    date: "2026-05-22",
    inspectorName: "Engr. Ricardo Gomez (Site Lead Monitor)",
    slotId: "SLOT-05",
    complianceStatus: "Corrective Action Required",
    progressPercentage: 35,
    structuralCheck: "Fail",
    safetyCheck: "Pass",
    remarks: "Minor soil slide on western corner after heavy Laguna rains. Instructed contractor to set up reinforced sand-bag walls and retaining layout.",
    siteActivity: "Excavation"
  }
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: "PAY-101",
    date: "2026-04-30",
    payeeName: "Engr. Ricardo Gomez",
    role: "Site Monitor",
    disbursementType: "Salary",
    amount: 3200,
    status: "Disbursed",
    paymentMethod: "GCash Enterprise Payroll"
  },
  {
    id: "PAY-102",
    date: "2026-04-30",
    payeeName: "Atty. Katrina Alvero",
    role: "Internal Staff",
    disbursementType: "Salary",
    amount: 4500,
    status: "Disbursed",
    paymentMethod: "BDO Unibank Bank Transfer"
  },
  {
    id: "PAY-103",
    date: "2026-05-15",
    payeeName: "Laguna Geodetic Earthmovers",
    role: "Contractor",
    disbursementType: "Contract Milestone",
    amount: 25000,
    status: "Disbursed",
    paymentMethod: "RCBC Corporate check"
  },
  {
    id: "PAY-104",
    date: "2026-05-20",
    payeeName: "Calabarzon Road Masters",
    role: "Contractor",
    disbursementType: "Contract Milestone",
    amount: 30000,
    status: "Disbursed",
    paymentMethod: "BPI Escrow Direct"
  }
];

export const INITIAL_BUDGET: CompanyBudget = {
  initialCapital: 800000,
  landAcquisitionCost: 450000,
  subdevelopmentCostPaid: 210000,
  collectedInstallments: 140400,
  currentCashReserve: 280400,
  roadInfrastructureFee: 75000,
  nextHectareCost: 500000
};

export interface CreditRecord {
  name: string;
  sourceId: string;
  overallRating: 'Prime (A+)' | 'Excellent (A)' | 'Good (B)' | 'Fair (C)' | 'High Risk (F)';
  debtToIncomeRatio: string;
  creditScore: number;
  bankruptcyFlag: boolean;
  employmentStability: 'Highly Stable' | 'Stable' | 'Varies' | 'Unstable';
  eligibilityScore: number;
  indicatorSummary: 'Fully Eligible' | 'Eligible with Guardrails' | 'Caution Needed' | 'Ineligible';
  historicalDefaults: number;
}

export const MOCK_KYC_RISK_DB: CreditRecord[] = [
  {
    name: "Juan Dela Cruz",
    sourceId: "PH-DL-NCR-38192-K",
    overallRating: "Excellent (A)",
    debtToIncomeRatio: "18%",
    creditScore: 785,
    bankruptcyFlag: false,
    employmentStability: "Highly Stable",
    eligibilityScore: 92,
    indicatorSummary: "Fully Eligible",
    historicalDefaults: 0
  },
  {
    name: "Dave Matthew Reglos",
    sourceId: "PH-PASS-87429-M",
    overallRating: "Prime (A+)",
    debtToIncomeRatio: "12%",
    creditScore: 840,
    bankruptcyFlag: false,
    employmentStability: "Highly Stable",
    eligibilityScore: 98,
    indicatorSummary: "Fully Eligible",
    historicalDefaults: 0
  },
  {
    name: "Maria Regina Santos",
    sourceId: "PH-SSS-0219389201-P",
    overallRating: "Good (B)",
    debtToIncomeRatio: "32%",
    creditScore: 710,
    bankruptcyFlag: false,
    employmentStability: "Stable",
    eligibilityScore: 80,
    indicatorSummary: "Eligible with Guardrails",
    historicalDefaults: 0
  },
  {
    name: "Erickson Almendras",
    sourceId: "PH-UMID-842910-U",
    overallRating: "Fair (C)",
    debtToIncomeRatio: "45%",
    creditScore: 635,
    bankruptcyFlag: false,
    employmentStability: "Varies",
    eligibilityScore: 62,
    indicatorSummary: "Caution Needed",
    historicalDefaults: 1
  },
  {
    name: "Rowena Alcantara",
    sourceId: "PH-CRD-19402-A",
    overallRating: "High Risk (F)",
    debtToIncomeRatio: "75%",
    creditScore: 480,
    bankruptcyFlag: true,
    employmentStability: "Unstable",
    eligibilityScore: 25,
    indicatorSummary: "Ineligible",
    historicalDefaults: 4
  }
];

export const INITIAL_MANPOWER_AUDITS: DailyManpowerAudit[] = [
  {
    id: "AUD-2026-001",
    date: "2026-08-19",
    contractorId: "CONT-001",
    contractorName: "Laguna Geodetic Earthmovers",
    specialty: "Land Leveling & Grading",
    shift: "Morning",
    claimedHeadcount: 16,
    verifiedHeadcount: 16,
    discrepancy: 0,
    assignedSectorOrLot: "Sector A (Lots 01 - 06 Grading)",
    supervisorName: "Engr. Ricardo Gomez",
    gpsCoordinates: "14.2612° N, 121.5124° E (Cavinti North Sector)",
    verificationStatus: "VERIFIED_MATCH",
    photoEvidenceVerified: true,
    remarks: "Full 16-man crew present at 07:30 AM toolbox briefing. Heavy grader and roller operators active.",
    productivityIndex: 96
  },
  {
    id: "AUD-2026-002",
    date: "2026-08-19",
    contractorId: "CONT-002",
    contractorName: "Calabarzon Road Masters",
    specialty: "Road Construction",
    shift: "Morning",
    claimedHeadcount: 28,
    verifiedHeadcount: 24,
    discrepancy: 4,
    assignedSectorOrLot: "Main Access Spine (Road Paving)",
    supervisorName: "Engr. Ricardo Gomez",
    gpsCoordinates: "14.2598° N, 121.5101° E (Spine Road Gate 2)",
    verificationStatus: "DISCREPANCY_FLAGGED",
    photoEvidenceVerified: true,
    remarks: "4 subgrade labor hands missing from 28-man manifest without prior notice. Contractor billing flagged for adjustment.",
    productivityIndex: 82
  },
  {
    id: "AUD-2026-003",
    date: "2026-08-19",
    contractorId: "CONT-003",
    contractorName: "Agua-Laguna Drainage Corp",
    specialty: "Civil Drainage & Utilities",
    shift: "Morning",
    claimedHeadcount: 14,
    verifiedHeadcount: 14,
    discrepancy: 0,
    assignedSectorOrLot: "Sector B & C (Culvert Culmination)",
    supervisorName: "Engr. Ricardo Gomez",
    gpsCoordinates: "14.2630° N, 121.5140° E (Drainage Outfall)",
    verificationStatus: "VERIFIED_MATCH",
    photoEvidenceVerified: true,
    remarks: "All 14 trenching and pipe-fitting crew present on site. Safety harnesses and PPE inspected.",
    productivityIndex: 94
  },
  {
    id: "AUD-2026-004",
    date: "2026-08-18",
    contractorId: "CONT-001",
    contractorName: "Laguna Geodetic Earthmovers",
    specialty: "Land Leveling & Grading",
    shift: "Full Day",
    claimedHeadcount: 16,
    verifiedHeadcount: 16,
    discrepancy: 0,
    assignedSectorOrLot: "Sector A (Lots 07 - 12)",
    supervisorName: "Engr. Ricardo Gomez",
    gpsCoordinates: "14.2612° N, 121.5124° E (Cavinti North Sector)",
    verificationStatus: "VERIFIED_MATCH",
    photoEvidenceVerified: true,
    remarks: "Slope grading completed on schedule. No idle equipment observed.",
    productivityIndex: 98
  }
];

export const INITIAL_LABOR_ALLOCATIONS: LaborAllocation[] = [
  {
    id: "ALLOC-01",
    contractorId: "CONT-001",
    contractorName: "Laguna Geodetic Earthmovers",
    sectorName: "Sector A (North Crest Hillside)",
    targetLots: "Lots 01 - 06",
    assignedHeadcount: 16,
    workScope: "Subgrade Compaction & Boundary Marker Staking",
    status: "ACTIVE",
    notes: "Phase 1 grading is 85% completed. Grader and roller active.",
    updatedAt: "2026-08-19"
  },
  {
    id: "ALLOC-02",
    contractorId: "CONT-002",
    contractorName: "Calabarzon Road Masters",
    sectorName: "Central Access Corridor",
    targetLots: "Lots 07 - 14",
    assignedHeadcount: 24,
    workScope: "6m Concrete Road Pavement & Curbs",
    status: "ACTIVE",
    notes: "Main spine subbase laid. Paving crew active on north section.",
    updatedAt: "2026-08-19"
  },
  {
    id: "ALLOC-03",
    contractorId: "CONT-003",
    contractorName: "Agua-Laguna Drainage Corp",
    sectorName: "Sector B & C (South Perimeter Basin)",
    targetLots: "Lots 15 - 20",
    assignedHeadcount: 14,
    workScope: "Reinforced Concrete Pipe Culvert & Retention Basin",
    status: "ACTIVE",
    notes: "Trenching completed for outfall. Laying 36-inch RCP culverts.",
    updatedAt: "2026-08-19"
  }
];

export const INITIAL_AI_RECOMMENDATIONS: AIManpowerRecommendation[] = [
  {
    id: "AI-REC-001",
    title: "Reallocate 6 Grading Crew to Central Spine Paving",
    rationale: "Sector A (Lots 01-06) grading has achieved 85% progress with low pending rework. Shifting 6 laborers to Central Spine Corridor will accelerate the 6m concrete roadway paving before the Q3 monsoon window.",
    targetSector: "Central Access Corridor",
    targetLots: "Lots 07 - 14",
    contractorId: "CONT-001",
    contractorName: "Laguna Geodetic Earthmovers",
    recommendedHeadcount: 10,
    currentHeadcount: 16,
    suggestedScope: "Subgrade Compaction & Roadway Gravel Spreading Support",
    priority: "HIGH",
    impact: "Accelerates road completion by 12 days; prevents rain-induced grading washouts.",
    applied: false
  },
  {
    id: "AI-REC-002",
    title: "Dispatch 4 Drainage Specialists for Lot 02 Culvert Defect",
    rationale: "Punch-list item DEF-2001 (Drainage culvert alignment variance) on Lot 02 is currently OPEN. Temporary deployment of 4 crew members will resolve the defect and clear lot turnover blockers.",
    targetSector: "Sector A (North Crest Hillside)",
    targetLots: "Lot 02 & Lot 03",
    contractorId: "CONT-003",
    contractorName: "Agua-Laguna Drainage Corp",
    recommendedHeadcount: 4,
    currentHeadcount: 0,
    suggestedScope: "Culvert Alignment Rectification & Headwall Sealing",
    priority: "MEDIUM",
    impact: "Closes open QA defect; unblocks buyer inspection sign-off.",
    applied: false
  },
  {
    id: "AI-REC-003",
    title: "Optimize Night/Early Shift for Concrete Curb Curing",
    rationale: "Ambient site temperature at Cavinti reaches 34°C by midday. Transitioning 12 road paving workers to early morning (06:00 - 11:00 AM) curing window will increase concrete compressive strength compliance to 99%.",
    targetSector: "Central Access Corridor",
    targetLots: "Lots 07 - 14",
    contractorId: "CONT-002",
    contractorName: "Calabarzon Road Masters",
    recommendedHeadcount: 24,
    currentHeadcount: 24,
    suggestedScope: "Early-Shift Curb Extrusion & Slump Quality Control",
    priority: "OPTIMIZATION",
    impact: "Improves structural pass rate; minimizes thermal cracking risks.",
    applied: false
  }
];


