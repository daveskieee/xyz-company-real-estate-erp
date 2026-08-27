/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, CompanyBudget, DailyManpowerAudit, LaborAllocation, AIManpowerRecommendation } from '../types';

export const INITIAL_PARCELS: LandParcel[] = [];
export const INITIAL_SLOTS: Slot[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_CONTRATORS: Contractor[] = [];
export const INITIAL_QA_LOGS: QALog[] = [];
export const INITIAL_PAYROLL: PayrollRecord[] = [];

export const INITIAL_BUDGET: CompanyBudget = {
  initialCapital: 800000,
  landAcquisitionCost: 450000,
  subdevelopmentCostPaid: 0,
  collectedInstallments: 0,
  currentCashReserve: 350000,
  roadInfrastructureFee: 75000,
  nextHectareCost: 500000,
};

export const INITIAL_MANPOWER_AUDITS: DailyManpowerAudit[] = [];
export const INITIAL_LABOR_ALLOCATIONS: LaborAllocation[] = [];
export const INITIAL_AI_RECOMMENDATIONS: AIManpowerRecommendation[] = [];
