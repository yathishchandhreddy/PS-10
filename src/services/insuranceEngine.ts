import { DisasterType, InsurancePricingResult, RiskAnalysisResult } from '../types';

export interface InsurancePricingInput {
  propertyValue: number;
  insuredAmount: number;
  propertyType: string;
  disasterScenario: DisasterType;
  riskResult: RiskAnalysisResult;
  deductiblePercent?: number; // e.g. 5%
}

export function computeIndicativeInsurance(input: InsurancePricingInput): InsurancePricingResult {
  const { insuredAmount, disasterScenario, riskResult, deductiblePercent = 5 } = input;

  // Base rate (illustrative benchmark rate per standard cat modeling guidelines):
  // Flood: 0.12% of sum insured
  // Cyclone: 0.14% of sum insured
  // Earthquake: 0.05% of sum insured (Zone II/III standard tariff benchmark)
  let baseRatePercent = 0.12;
  if (disasterScenario === 'cyclone') {
    baseRatePercent = 0.14;
  } else if (disasterScenario === 'earthquake') {
    baseRatePercent = 0.05;
  }

  // Risk adjustment factor derived transparently from vulnerability index (normalized between 0.7x and 2.2x):
  // e.g. score 78 => factor ~ 1.56x
  const vulnerability = Math.max(10, Math.min(100, riskResult.vulnerabilityIndex));
  const riskAdjustmentFactor = Number((0.6 + (vulnerability / 100) * 1.3).toFixed(2));

  // Transparent formula: Indicative Premium = Insured Amount × Base Rate × Risk Adjustment Factor
  const baseRateFraction = baseRatePercent / 100;
  const rawPremium = insuredAmount * baseRateFraction * riskAdjustmentFactor;

  // Standard GST applicable on insurance in India is 18%
  const gstAmount = Math.round(rawPremium * 0.18);
  const indicativeAnnualPremium = Math.round(rawPremium);
  const totalIndicativePayable = indicativeAnnualPremium + gstAmount;

  const deductibleAmount = Math.round((insuredAmount * deductiblePercent) / 100);

  return {
    insuredAmount,
    baseRatePercent,
    riskAdjustmentFactor,
    indicativeAnnualPremium,
    gstAmount,
    totalIndicativePayable,
    deductiblePercent,
    deductibleAmount,
    disasterScenario,
    assumptions: [
      `Base rate configured at ${baseRatePercent}% based on general IRDAI commercial/residential catastrophe tariff references.`,
      `Risk adjustment factor (${riskAdjustmentFactor}x) is mathematically derived from the calculated vulnerability index (${riskResult.vulnerabilityIndex}/100).`,
      'Subject to standard 18% Goods and Services Tax (GST) mandated for general insurance products.',
      `Standard policy deductible set at ${deductiblePercent}% of total claim amount (₹${deductibleAmount.toLocaleString('en-IN')}).`
    ],
    exclusions: [
      'Pre-existing structural dampness or unapproved building modifications.',
      'Basement contents unless explicitly declared under specialized endorsement.',
      'Sump pump failure due to external grid power blackouts.'
    ],
    limitations: [
      'This calculation is an illustrative actuarial simulation and NOT a commercial binder or binding policy offer.',
      'Individual insurance underwriters inspect structural age, plinth height, and prior loss claims history before quoting binding terms.',
      'Actual coverage terms depend on individual insurer policy wordings (e.g., Bharat Griha Raksha standard provisions).'
    ],
    disclaimer: 'DISCLAIMER: This calculation is strictly an illustrative actuarial estimate for risk awareness. It does not constitute an insurance quote, binder, or commitment by any registered insurance carrier. Real policies must be verified directly with licensed insurance providers.'
  };
}
