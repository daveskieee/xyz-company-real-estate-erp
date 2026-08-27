/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Slot, LandParcel, CompanyBudget, CivilWorksMilestone, Contractor, PayrollRecord } from '../types';

export interface AILotPricingParams {
  acquisitionCost: number;
  civilWorksCost?: number;
  contractorLaborCost?: number;
  permittingOverheadCost?: number;
  contingencyPercent?: number; // e.g. 8 for 8%
  targetProfitMargin?: number; // e.g. 35 for 35%
  slots: Slot[];
  parcel?: LandParcel | null;
}

export interface AILotValuation {
  slotId: string;
  slotNumber: number;
  areaSqm: number;
  breakEvenCost: number;
  breakEvenPricePerSqm: number;
  suggestedBasePrice: number;
  suggestedPricePerSqm: number;
  profitMarginPercent: number;
  grossProfit: number;
  monthlyInstallment36m: number;
  monthlyInstallment60m: number;
  cashDiscountPrice: number;
  premiums: {
    cornerLot: boolean;
    frontageAccess: boolean;
    scenicOrientation: boolean;
    scaleAdjustmentPercent: number;
  };
  multiplierTotal: number;
  costBreakdown: {
    acquisitionShare: number;
    civilWorksShare: number;
    laborShare: number;
    overheadShare: number;
    contingencyShare: number;
  };
  aiRationale: string;
  confidenceScore: number;
}

export interface AIPortfolioFeasibility {
  totalAcquisitionCost: number;
  totalCivilWorksCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalContingencyCost: number;
  totalProjectOutlay: number;
  totalSaleableAreaSqm: number;
  baselineCostPerSqm: number;
  averageSuggestedPricePerSqm: number;
  totalProjectedGrossRevenue: number;
  totalProjectedNetProfit: number;
  projectedROI: number;
  targetProfitMargin: number;
  lotsEvaluated: number;
  lotValuations: AILotValuation[];
  aiExecutiveSummary: string;
}

/**
 * Calculates expenses aggregation from ERP system states
 */
export function aggregateProjectExpenses(params: {
  parcel?: LandParcel | null;
  budget?: CompanyBudget | null;
  milestones?: CivilWorksMilestone[];
  contractors?: Contractor[];
  payroll?: PayrollRecord[];
}) {
  const { parcel, budget, milestones = [], contractors = [], payroll = [] } = params;

  // 1. Acquisition Cost
  const acquisitionCost = parcel?.acquisitionCost || budget?.landAcquisitionCost || 450000;

  // 2. Civil Works Infrastructure
  const civilWorksFromBudget = budget?.roadInfrastructureFee || budget?.subdevelopmentCostPaid || 0;
  const civilWorksFromMilestones = milestones.length > 0
    ? milestones.length * 35000 // Average budgeted milestone allocation
    : 175000;
  const civilWorksCost = Math.max(civilWorksFromBudget, civilWorksFromMilestones);

  // 3. Contractor & Labor Disbursements
  const contractorContracts = contractors.reduce((sum, c) => sum + (c.contractAmount || 0), 0);
  const payrollTotal = payroll.reduce((sum, p) => sum + (p.amount || 0), 0);
  const contractorLaborCost = contractorContracts > 0 ? contractorContracts : (payrollTotal > 0 ? payrollTotal : 120000);

  // 4. Permitting, Surveying & DHSUD / Titling Overhead
  const permittingOverheadCost = 65000;

  return {
    acquisitionCost,
    civilWorksCost,
    contractorLaborCost,
    permittingOverheadCost,
  };
}

/**
 * AI Real Estate Lot Pricing & Actuarial Valuation Engine
 */
export function calculateAILotPricing(params: AILotPricingParams): AIPortfolioFeasibility {
  const {
    acquisitionCost,
    civilWorksCost = 175000,
    contractorLaborCost = 120000,
    permittingOverheadCost = 65000,
    contingencyPercent = 8,
    targetProfitMargin = 35,
    slots = [],
    parcel = null,
  } = params;

  // Subtotal of direct development and acquisition outlay
  const directCostsSubtotal = acquisitionCost + civilWorksCost + contractorLaborCost + permittingOverheadCost;
  const contingencyAmount = Math.round(directCostsSubtotal * (contingencyPercent / 100));
  const totalProjectOutlay = directCostsSubtotal + contingencyAmount;

  // Compute total saleable area (sqm)
  const totalSaleableAreaSqm = slots.length > 0
    ? slots.reduce((sum, s) => sum + (s.areaSqm || 500), 0)
    : (parcel?.totalAreaSqm ? parcel.totalAreaSqm * 0.70 : 10000); // 70% saleable efficiency standard if no slots

  const baselineCostPerSqm = totalSaleableAreaSqm > 0
    ? totalProjectOutlay / totalSaleableAreaSqm
    : 100;

  // Evaluate each individual lot
  const lotValuations: AILotValuation[] = slots.map((slot) => {
    const area = slot.areaSqm || 500;
    const lotRatio = totalSaleableAreaSqm > 0 ? area / totalSaleableAreaSqm : (1 / (slots.length || 1));

    // Proportionate share of each cost component
    const lotAcquisitionShare = Math.round(acquisitionCost * lotRatio);
    const lotCivilShare = Math.round(civilWorksCost * lotRatio);
    const lotLaborShare = Math.round(contractorLaborCost * lotRatio);
    const lotOverheadShare = Math.round(permittingOverheadCost * lotRatio);
    const lotContingencyShare = Math.round(contingencyAmount * lotRatio);
    const breakEvenCost = lotAcquisitionShare + lotCivilShare + lotLaborShare + lotOverheadShare + lotContingencyShare;
    const breakEvenPricePerSqm = Math.round((breakEvenCost / area) * 100) / 100;

    // AI Multipliers & Topological Value Drivers
    // 1. Corner Lot Check: (Col 1 or 5, Row 1 or last, or edge of block)
    const isCornerLot = (slot.col === 1 || slot.col === 5) && (slot.row === 1 || slot.row === Math.ceil(slots.length / 5));
    // 2. Main Frontage Access Check (Central corridor)
    const isFrontageAccess = slot.col === 2 || slot.col === 3 || slot.row === 1;
    // 3. Scenic / Elevation Check
    const isScenic = slot.row === 1 || (slot.slotNumber % 4 === 0);

    // 4. Scale / Density adjustment:
    // Smaller compact lots (< 300 sqm) yield higher per-sqm price (+4%)
    // Very large lots (> 600 sqm) get volume discount (-5%)
    let scaleAdjustmentPercent = 0;
    if (area < 300) {
      scaleAdjustmentPercent = 4;
    } else if (area > 600) {
      scaleAdjustmentPercent = -5;
    }

    let multiplier = 1.0;
    const reasons: string[] = [];

    if (isCornerLot) {
      multiplier += 0.12; // +12% corner premium
      reasons.push('Corner Plot Premium (+12%)');
    }
    if (isFrontageAccess) {
      multiplier += 0.08; // +8% main corridor frontage
      reasons.push('Prime Spine Road Access (+8%)');
    }
    if (isScenic && !isCornerLot) {
      multiplier += 0.06; // +6% scenic vista orientation
      reasons.push('Elevated Ridge Vista (+6%)');
    }
    if (scaleAdjustmentPercent !== 0) {
      multiplier += (scaleAdjustmentPercent / 100);
      reasons.push(scaleAdjustmentPercent > 0 ? 'High-Yield Compact Lot (+4%)' : 'Estate Scale Volume Discount (-5%)');
    }

    if (reasons.length === 0) {
      reasons.push('Standard Interior Residential Plot');
    }

    // Suggested Final Target Selling Price (TCP)
    const targetMarginFactor = 1 + (targetProfitMargin / 100);
    const suggestedBasePrice = Math.round((breakEvenCost * targetMarginFactor * multiplier) / 100) * 100;
    const suggestedPricePerSqm = Math.round((suggestedBasePrice / area) * 100) / 100;
    const grossProfit = suggestedBasePrice - breakEvenCost;
    const effectiveProfitMargin = Math.round((grossProfit / suggestedBasePrice) * 1000) / 10;

    // Financing terms calculations
    const cashDiscountPrice = Math.round(suggestedBasePrice * 0.92); // 8% discount for spot cash
    const monthlyInstallment36m = Math.round(suggestedBasePrice / 36);
    const monthlyInstallment60m = Math.round((suggestedBasePrice * 1.08) / 60); // 8% financing spread for 5 years

    // Natural language justification
    const aiRationale = `Break-even cost is ₱${breakEvenCost.toLocaleString()} (₱${breakEvenPricePerSqm}/sqm) based on ₱${acquisitionCost.toLocaleString()} acquisition & ₱${(civilWorksCost + contractorLaborCost).toLocaleString()} infrastructure. Applying ${targetProfitMargin}% target margin and ${reasons.join(', ')} yields recommended price ₱${suggestedBasePrice.toLocaleString()} (₱${suggestedPricePerSqm.toLocaleString()}/sqm).`;

    const confidenceScore = Math.min(98, 92 + (isCornerLot ? 3 : 1) + (area > 0 ? 2 : 0));

    return {
      slotId: slot.id,
      slotNumber: slot.slotNumber,
      areaSqm: area,
      breakEvenCost,
      breakEvenPricePerSqm,
      suggestedBasePrice,
      suggestedPricePerSqm,
      profitMarginPercent: effectiveProfitMargin,
      grossProfit,
      monthlyInstallment36m,
      monthlyInstallment60m,
      cashDiscountPrice,
      premiums: {
        cornerLot: isCornerLot,
        frontageAccess: isFrontageAccess,
        scenicOrientation: isScenic,
        scaleAdjustmentPercent,
      },
      multiplierTotal: Math.round(multiplier * 100) / 100,
      costBreakdown: {
        acquisitionShare: lotAcquisitionShare,
        civilWorksShare: lotCivilShare,
        laborShare: lotLaborShare,
        overheadShare: lotOverheadShare,
        contingencyShare: lotContingencyShare,
      },
      aiRationale,
      confidenceScore,
    };
  });

  // Portfolio level aggregations
  const totalProjectedGrossRevenue = lotValuations.reduce((sum, v) => sum + v.suggestedBasePrice, 0);
  const totalProjectedNetProfit = totalProjectedGrossRevenue - totalProjectOutlay;
  const projectedROI = totalProjectOutlay > 0
    ? Math.round((totalProjectedNetProfit / totalProjectOutlay) * 1000) / 10
    : 0;

  const averageSuggestedPricePerSqm = totalSaleableAreaSqm > 0
    ? Math.round((totalProjectedGrossRevenue / totalSaleableAreaSqm) * 100) / 100
    : 0;

  const aiExecutiveSummary = `AI Financial Feasibility Model evaluated ${lotValuations.length} lots (${totalSaleableAreaSqm.toLocaleString()} sqm total area). Total project capital outlay is ₱${totalProjectOutlay.toLocaleString()} (Acquisition: ₱${acquisitionCost.toLocaleString()}, Civil & Labor: ₱${(civilWorksCost + contractorLaborCost).toLocaleString()}, Contingency: ₱${contingencyAmount.toLocaleString()}). Break-even baseline is ₱${baselineCostPerSqm.toFixed(2)}/sqm. With a ${targetProfitMargin}% target margin, projected gross sales is ₱${totalProjectedGrossRevenue.toLocaleString()} yielding ₱${totalProjectedNetProfit.toLocaleString()} net profit (${projectedROI}% ROI).`;

  return {
    totalAcquisitionCost: acquisitionCost,
    totalCivilWorksCost: civilWorksCost,
    totalLaborCost: contractorLaborCost,
    totalOverheadCost: permittingOverheadCost,
    totalContingencyCost: contingencyAmount,
    totalProjectOutlay,
    totalSaleableAreaSqm,
    baselineCostPerSqm: Math.round(baselineCostPerSqm * 100) / 100,
    averageSuggestedPricePerSqm,
    totalProjectedGrossRevenue,
    totalProjectedNetProfit,
    projectedROI,
    targetProfitMargin,
    lotsEvaluated: lotValuations.length,
    lotValuations,
    aiExecutiveSummary,
  };
}
