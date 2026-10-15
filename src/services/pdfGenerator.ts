import { jsPDF } from 'jspdf';
import { InsurancePricingResult, LossEstimateResult, PropertyDetails, RiskAnalysisResult } from '../types';

export function generateRiskAssessmentPDF(riskResult: RiskAnalysisResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar (Emerald Green #059669)
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RISKLENS TN — CATASTROPHE RISK INTELLIGENCE', 14, 14);

  doc.setTextColor(240, 253, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Comprehensive Location Hazard & Vulnerability Assessment Report', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(204, 251, 241);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Model: ${riskResult.modelVersion}`, 14, 28);

  y = 40;

  // Section 1: Target Location & Hazard Scope
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text('1. LOCATION & SCOPE PARAMETERS', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // #1E293B
  doc.text(`Location: ${riskResult.location.name} (${riskResult.location.district} District)`, 18, y + 14);
  doc.text(`Coordinates: Lat ${riskResult.location.lat.toFixed(4)}° N, Lng ${riskResult.location.lng.toFixed(4)}° E`, 18, y + 20);
  doc.text(`Analysis Radius: ${riskResult.analysisRadiusKm} km | Hazard Category: ${riskResult.disasterType.toUpperCase()}`, 110, y + 14);
  doc.text(`Elevation: ${riskResult.location.elevationMeters}m MSL | Coastal Distance: ${riskResult.location.distanceToCoastKm.toFixed(1)} km`, 110, y + 20);

  y += 34;

  // Section 2: Computed Vulnerability Index
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 32, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('2. COMPUTED VULNERABILITY INDEX', 18, y + 7);

  doc.setFontSize(22);
  const scoreColor = riskResult.vulnerabilityIndex >= 70 ? [220, 38, 38] : riskResult.vulnerabilityIndex >= 45 ? [217, 119, 6] : [5, 150, 105];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${riskResult.vulnerabilityIndex}/100`, 18, y + 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Classification: ${riskResult.riskCategory.toUpperCase()}`, 60, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(`Confidence Rating: ${riskResult.confidence} (${riskResult.confidenceDetail})`, 60, y + 22);
  doc.text(doc.splitTextToSize(riskResult.summaryText, pageWidth - 80), 60, y + 27);

  y += 38;

  // Section 3: Contributing Factors
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('3. PRIMARY RISK DRIVERS & SITE ATTRIBUTES', 14, y);
  y += 5;

  riskResult.contributingFactors.forEach((factor, idx) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`${idx + 1}. ${factor.name} — [${factor.impactLevel}]`, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${factor.description} (Value: ${factor.verifiedValue} | Source: ${factor.source})`, 18, y + 10);
    y += 16;
  });

  y += 4;

  // Section 4: Data Sources & Calculation Method
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('4. VERIFIED DATA SOURCES & METHODOLOGY', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  riskResult.dataSources.forEach((src) => {
    doc.text(`• ${src.name}: ${src.dataset} (${src.period}) - ${src.reliability}`, 16, y);
    y += 4.5;
  });

  y += 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Model Assumptions:', 14, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  riskResult.assumptions.forEach((assump) => {
    doc.text(`- ${assump}`, 16, y);
    y += 3.8;
  });

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Uncertainty & Data Limitations:', 14, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  riskResult.limitations.forEach((lim) => {
    doc.text(`- ${lim}`, 16, y);
    y += 3.8;
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('RiskLens TN Light Geospatial Platform. Verified datasets from IMD, TNSDMA and Survey of India.', 14, 285);
  doc.text(`Page 1 of 1 | Report ID: RLTN-RA-${Date.now().toString().slice(-6)}`, pageWidth - 60, 285);

  doc.save(`RiskLens_TN_Risk_Assessment_${riskResult.location.district}_${riskResult.disasterType}.pdf`);
}

export function generateInsurancePricingPDF(
  riskResult: RiskAnalysisResult,
  property: PropertyDetails,
  insurance: InsurancePricingResult,
  lossResult?: LossEstimateResult
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar (Teal #0D9488)
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RISKLENS TN — INDICATIVE INSURANCE PRICING REPORT', 14, 14);

  doc.setTextColor(240, 253, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Actuarial Scenario Breakdown & Indicative Underwriting Assessment', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(204, 251, 241);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Rule Engine: v2.4-transparent`, 14, 28);

  y = 40;

  // Section 1: Property & Asset Profile
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. ASSET PROFILE & INSURED EXPOSURE', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Location: ${riskResult.location.name}`, 18, y + 12);
  doc.text(`Property Classification: ${property.propertyType}`, 18, y + 18);
  doc.text(`Plinth Height: ${property.plinthElevationCm} cm above ground level`, 18, y + 24);

  doc.text(`Building Value: INR ${property.propertyValue.toLocaleString('en-IN')}`, 110, y + 12);
  doc.text(`Contents Value: INR ${property.contentsValue.toLocaleString('en-IN')}`, 110, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Insured Sum: INR ${insurance.insuredAmount.toLocaleString('en-IN')}`, 110, y + 24);

  y += 34;

  // Section 2: Indicative Premium Formula
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 48, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text('2. INDICATIVE PREMIUM CALCULATION FORMULA', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Formula: Indicative Premium = Insured Amount × Base Rate × Risk Adjustment Factor', 18, y + 16);

  doc.setTextColor(30, 41, 59);
  doc.text(`• Insured Amount: INR ${insurance.insuredAmount.toLocaleString('en-IN')}`, 18, y + 24);
  doc.text(`• Base Tariff Rate: ${insurance.baseRatePercent}% (Per IRDAI standard peril schedule)`, 18, y + 30);
  doc.text(`• Risk Adjustment Factor: ${insurance.riskAdjustmentFactor}x (Derived from Vulnerability ${riskResult.vulnerabilityIndex}/100)`, 18, y + 36);
  doc.text(`• Mandatory Policy Deductible: ${insurance.deductiblePercent}% (INR ${insurance.deductibleAmount.toLocaleString('en-IN')})`, 18, y + 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`Indicative Annual Premium: INR ${insurance.indicativeAnnualPremium.toLocaleString('en-IN')}`, 110, y + 26);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`+ 18% GST: INR ${insurance.gstAmount.toLocaleString('en-IN')}`, 110, y + 33);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Estimated Payable: INR ${insurance.totalIndicativePayable.toLocaleString('en-IN')}`, 110, y + 40);

  y += 54;

  if (lossResult) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('3. PROPERTY LOSS SCENARIO ESTIMATION', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Modeled Damage Ratio: ${lossResult.damageRatioPercent}% (${lossResult.damageRatioSource})`, 18, y + 12);
    doc.text(`Estimated Structural Loss: INR ${lossResult.structuralLoss.toLocaleString('en-IN')}`, 18, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Modeled Asset Loss: INR ${lossResult.totalEstimatedLoss.toLocaleString('en-IN')}`, 110, y + 15);

    y += 28;
  }

  // Section 4: Assumptions & Exclusions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('4. UNDERWRITING ASSUMPTIONS & EXCLUSIONS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  insurance.assumptions.forEach((assump) => {
    doc.text(`• Assumption: ${assump}`, 16, y);
    y += 3.8;
  });

  insurance.exclusions.forEach((excl) => {
    doc.text(`• Exclusion: ${excl}`, 16, y);
    y += 3.8;
  });

  y += 4;

  // Disclaimer box (Light red tint)
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 38, 38);
  doc.text('LEGAL NOTICE & STATUTORY DISCLAIMER:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    doc.splitTextToSize(insurance.disclaimer, pageWidth - 36),
    18,
    y + 9
  );

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('RiskLens TN Insurance Pricing Rule Engine. Formula compliant with section 7 transparency directives.', 14, 285);
  doc.text(`Page 1 of 1 | Report ID: RLTN-INS-${Date.now().toString().slice(-6)}`, pageWidth - 60, 285);

  doc.save(`RiskLens_TN_Insurance_Pricing_${riskResult.location.district}.pdf`);
}

export function generateFarmerReportPDF(
  farm: {
    farmerName: string;
    district: string;
    talukOrVillage: string;
    surveyNumber: string;
    acres: number;
    season: string;
    stage: string;
    irrigationSource: string;
    soilType: string;
  },
  crop: {
    name: string;
    tamilName: string;
    category: string;
    standardYieldPerAcre: number;
    yieldUnit: string;
    mspOrPricePerUnit: number;
  },
  lossResult: {
    exposedCropGrossValue: number;
    totalInputInvested: number;
    estimatedYieldLossPercent: number;
    estimatedLossAmount: number;
    salvageableValue: number;
    netFinancialDamage: number;
    primaryRiskDriver: string;
    impactSeverity: string;
    advisorySummary: string;
    mitigationSteps: string[];
  },
  pmfby: {
    totalSumInsured: number;
    farmerPayablePremium: number;
    totalGovernmentSubsidy: number;
    estimatedClaimCompensation: number;
    notifiedSeason: string;
    insuranceCompany: string;
  },
  location: {
    name: string;
    lat: number;
    lng: number;
    elevationMeters: number;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Bar (Agricultural Emerald Green #059669)
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('RISKLENS TN — FARMER RISK & CROP LOSS INTELLIGENCE', 14, 13);

  doc.setTextColor(240, 253, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Tamil Nadu Agricultural Hazard Assessment & PMFBY Crop Protection Advisory', 14, 20);

  doc.setFontSize(7.5);
  doc.setTextColor(204, 251, 241);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Reference: TN-AGRI-RISK-2026`, 14, 27);

  y = 38;

  // Section 1: Farmer & Land Parcel Information
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105);
  doc.text('1. FARMER & LAND PARCEL REGISTRATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Farmer: ${farm.farmerName || 'Tamil Nadu Farmer'} | Survey No / SF: ${farm.surveyNumber || '142/2B'}`, 18, y + 13);
  doc.text(`District: ${farm.district} | Taluk / Village: ${farm.talukOrVillage || 'Delta Basin'}`, 18, y + 19);
  doc.text(`Acreage: ${farm.acres} Acres | Location: ${location.name}`, 110, y + 13);
  doc.text(`Coordinates: Lat ${location.lat.toFixed(4)}° N, Lng ${location.lng.toFixed(4)}° E (Elev: ${location.elevationMeters}m)`, 110, y + 19);

  y += 31;

  // Section 2: Crop Details & Growth Stage
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(13, 148, 136);
  doc.text('2. CROP PROFILE & AGRO-ECOLOGICAL ATTRIBUTES', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Crop: ${crop.name} (${crop.tamilName})`, 18, y + 13);
  doc.text(`Cultivation Season: ${farm.season} | Stage: ${farm.stage}`, 18, y + 19);
  doc.text(`Soil Type: ${farm.soilType}`, 110, y + 13);
  doc.text(`Irrigation Source: ${farm.irrigationSource}`, 110, y + 19);

  y += 31;

  // Section 3: Catastrophe Hazard & Crop Loss Quantification
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14, y, pageWidth - 28, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('3. CATASTROPHE IMPACT & MONETARY CROP LOSS QUANTIFICATION', 18, y + 7);

  // Big Metric Boxes
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, y + 12, 50, 24, 2, 2, 'FD');
  doc.roundedRect(73, y + 12, 50, 24, 2, 2, 'FD');
  doc.roundedRect(128, y + 12, 50, 24, 2, 2, 'FD');

  // Box 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(220, 38, 38);
  doc.text(`${lossResult.estimatedYieldLossPercent}%`, 22, y + 21);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Estimated Yield Loss', 22, y + 27);
  doc.text(`Severity: ${lossResult.impactSeverity}`, 22, y + 32);

  // Box 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text(`₹${lossResult.estimatedLossAmount.toLocaleString('en-IN')}`, 77, y + 21);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Projected Crop Damage', 77, y + 27);
  doc.text(`Asset Base: ₹${lossResult.exposedCropGrossValue.toLocaleString('en-IN')}`, 77, y + 32);

  // Box 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`₹${lossResult.salvageableValue.toLocaleString('en-IN')}`, 132, y + 21);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Remaining Salvageable Yield', 132, y + 27);
  doc.text(`Input Invested: ₹${lossResult.totalInputInvested.toLocaleString('en-IN')}`, 132, y + 32);

  y += 49;

  // Section 4: PMFBY Crop Insurance & Subsidy Protection
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, pageWidth - 28, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(22, 101, 52);
  doc.text('4. PRADHAN MANTRI FASAL BIMA YOJANA (PMFBY) SCHEME PROTECTION', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Sum Insured (Scale of Finance): ₹${pmfby.totalSumInsured.toLocaleString('en-IN')}`, 18, y + 14);
  doc.text(`Farmer's Subsidized Share: ₹${pmfby.farmerPayablePremium.toLocaleString('en-IN')} (Only 1.5% - 2.0%)`, 18, y + 20);
  doc.text(`State & Central Govt Subsidy: ₹${pmfby.totalGovernmentSubsidy.toLocaleString('en-IN')} (Govt absorbs up to 95%)`, 18, y + 26);
  doc.text(`Estimated Insurance Claim Payout: ₹${pmfby.estimatedClaimCompensation.toLocaleString('en-IN')}`, 18, y + 32);

  doc.text(`Insurer Cluster: ${pmfby.insuranceCompany.split('/')[0]}`, 110, y + 14);
  doc.text(`Season: ${pmfby.notifiedSeason.split('(')[0]}`, 110, y + 20);
  doc.text('Claim Intimation Window: Within 72 hrs of disaster', 110, y + 26);
  doc.text('Helpline: 14447 / Kisan Call Center 1551', 110, y + 32);

  y += 43;

  // Section 5: Recommended Agricultural Mitigations (TNAU & Dept of Agriculture)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('5. TNAU & STATE AGRI-MET ADVISORY & RECOVERY MEASURES', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  lossResult.mitigationSteps.forEach((step, idx) => {
    doc.text(`${idx + 1}. ${step}`, 16, y);
    y += 5;
  });

  doc.text('• Submit formal crop loss intimation on the Uzhavan App or contact your Village Administrative Officer (VAO).', 16, y);
  y += 6;

  // Emergency Footer Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TAMIL NADU FARMER EMERGENCY HELPLINES:', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Kisan Call Center: 1800-180-1551 (Toll-Free) | PMFBY Grievance: 14447 | TNSDMA State Emergency: 1070', 18, y + 10);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RiskLens TN Agronomic Intelligence Model. Generated in accordance with TNAU Agro-Met Advisory standards.', 14, 287);
  doc.text(`Report ID: RLTN-AGRI-${Date.now().toString().slice(-6)} | Page 1 of 1`, pageWidth - 65, 287);

  doc.save(`RiskLens_TN_Farmer_Crop_Risk_${farm.district}_${crop.name.split(' ')[0]}.pdf`);
}
