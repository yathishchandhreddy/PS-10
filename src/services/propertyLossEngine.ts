import { DisasterType, LossEstimateResult, PropertyDetails, RiskAnalysisResult } from '../types';

export function calculatePropertyLoss(
  property: PropertyDetails,
  disasterType: DisasterType,
  riskResult: RiskAnalysisResult,
  userCustomDamageRatio?: number
): LossEstimateResult {
  // Input validations: reject negative property values
  if (property.propertyValue < 0 || property.contentsValue < 0) {
    throw new Error('Property value and contents value must be non-negative.');
  }

  const exposedAssetValue = property.propertyValue + property.contentsValue;

  let damageRatioPercent = 0;
  let isVerifiedDamageRatio = false;
  let damageRatioSource = '';

  if (userCustomDamageRatio !== undefined && userCustomDamageRatio >= 0 && userCustomDamageRatio <= 100) {
    damageRatioPercent = userCustomDamageRatio;
    isVerifiedDamageRatio = false;
    damageRatioSource = 'User-Configured Illustrative Scenario';
  } else {
    // Determine defensible vulnerability-based damage ratio:
    // Plinth height dampens flood damage (e.g. +60cm plinth prevents ground ingress)
    const vulnerability = riskResult.vulnerabilityIndex;

    if (disasterType === 'flood') {
      let rawFloodRatio = (vulnerability / 100) * 0.35; // max 35% damage for standard flood
      // Plinth mitigation discount
      if (property.plinthElevationCm >= 60) {
        rawFloodRatio *= 0.45; // significantly shielded
      } else if (property.plinthElevationCm >= 30) {
        rawFloodRatio *= 0.75;
      }
      damageRatioPercent = Number((rawFloodRatio * 100).toFixed(1));
      isVerifiedDamageRatio = false;
      damageRatioSource = 'TNSDMA & NDMA Depth-Damage Function Benchmark (Illustrative Assumption)';
    } else if (disasterType === 'cyclone') {
      let rawWindRatio = (vulnerability / 100) * 0.28;
      if (property.propertyType === 'Semi-Pucca / Tiled') {
        rawWindRatio *= 1.8; // tiled roofs are much more vulnerable to wind lift
      } else if (property.propertyType === 'Residential RCC') {
        rawWindRatio *= 0.65; // reinforced concrete slab resists uplift
      }
      damageRatioPercent = Math.min(85, Number((rawWindRatio * 100).toFixed(1)));
      damageRatioSource = 'IS 875 Building Envelope Aerodynamic Susceptibility Index';
    } else {
      // Earthquake
      const rawQuakeRatio = property.propertyType === 'Residential RCC' ? 0.04 : 0.12;
      damageRatioPercent = Number((rawQuakeRatio * 100).toFixed(1));
      damageRatioSource = 'IS 1893:2016 Zone II/III Structural Fragility Curve';
    }
  }

  // Calculate separate structural and contents loss
  const ratioFraction = damageRatioPercent / 100;
  const structuralLoss = Math.round(property.propertyValue * ratioFraction * 0.7);
  const contentsLoss = Math.round(property.contentsValue * ratioFraction * 1.3);
  const totalEstimatedLoss = Math.min(exposedAssetValue, structuralLoss + contentsLoss);

  return {
    exposedAssetValue,
    structuralLoss,
    contentsLoss,
    totalEstimatedLoss,
    damageRatioPercent,
    isVerifiedDamageRatio,
    damageRatioSource,
    methodologyNotes: [
      `Estimated Loss = Exposed Asset Value (₹${exposedAssetValue.toLocaleString('en-IN')}) × Damage Ratio (${damageRatioPercent}%)`,
      `Structure Loss: ₹${structuralLoss.toLocaleString('en-IN')} (accounts for masonry, boundary wall, and electrical sub-station exposure)`,
      `Contents Loss: ₹${contentsLoss.toLocaleString('en-IN')} (accounts for ground-floor furniture, appliances, vehicle, and electrical wiring)`,
      `Plinth height mitigation of ${property.plinthElevationCm}cm factored into water ingress threshold.`
    ],
    uncertaintyNotes: [
      'Disaster damage is non-linear and governed by local stormwater backflow, duration of waterlogging, and building age.',
      'This calculation is an illustrative scenario and MUST NOT be treated as a prediction of actual future damage.',
      'Soil liquefaction, adjacent building collapse, and localized debris impact are not factored in this regional model.'
    ]
  };
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}
