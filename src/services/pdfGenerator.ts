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

  // Header Bar
  doc.setFillColor(14, 19, 33); // #0e1321
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(76, 215, 246); // #4cd7f6 Electric Cyan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RISKLENS TN — CATASTROPHE RISK INTELLIGENCE', 14, 14);

  doc.setTextColor(222, 226, 246);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Comprehensive Location Hazard & Vulnerability Assessment Report', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(188, 201, 205);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Model: ${riskResult.modelVersion}`, 14, 28);

  y = 40;

  // Section 1: Target Location & Hazard Scope
  doc.setFillColor(26, 31, 46); // Surface container
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(76, 215, 246);
  doc.text('1. LOCATION & SCOPE PARAMETERS', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Location: ${riskResult.location.name} (${riskResult.location.district} District)`, 18, y + 14);
  doc.text(`Coordinates: Lat ${riskResult.location.lat.toFixed(4)}° N, Lng ${riskResult.location.lng.toFixed(4)}° E`, 18, y + 20);
  doc.text(`Analysis Radius: ${riskResult.analysisRadiusKm} km | Hazard Category: ${riskResult.disasterType.toUpperCase()}`, 110, y + 14);
  doc.text(`Elevation: ${riskResult.location.elevationMeters}m MSL | Coastal Distance: ${riskResult.location.distanceToCoastKm.toFixed(1)} km`, 110, y + 20);

  y += 34;

  // Section 2: Computed Vulnerability Index
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 32, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(14, 19, 33);
  doc.text('2. COMPUTED VULNERABILITY INDEX', 18, y + 7);

  doc.setFontSize(22);
  doc.setTextColor(217, 38, 38);
  doc.text(`${riskResult.vulnerabilityIndex}/100`, 18, y + 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 19, 33);
  doc.text(`Classification: ${riskResult.riskCategory.toUpperCase()}`, 60, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 95);
  doc.text(`Confidence Rating: ${riskResult.confidence} (${riskResult.confidenceDetail})`, 60, y + 22);
  doc.text(doc.splitTextToSize(riskResult.summaryText, pageWidth - 80), 60, y + 27);

  y += 38;

  // Section 3: Contributing Factors
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(14, 19, 33);
  doc.text('3. PRIMARY RISK DRIVERS & SITE ATTRIBUTES', 14, y);
  y += 5;

  riskResult.contributingFactors.forEach((factor, idx) => {
    doc.setFillColor(240, 243, 246);
    doc.rect(14, y, pageWidth - 28, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(14, 19, 33);
    doc.text(`${idx + 1}. ${factor.name} — [${factor.impactLevel}]`, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 80, 95);
    doc.text(`${factor.description} (Value: ${factor.verifiedValue} | Source: ${factor.source})`, 18, y + 10);
    y += 16;
  });

  y += 4;

  // Section 4: Data Sources & Calculation Method
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(14, 19, 33);
  doc.text('4. VERIFIED DATA SOURCES & METHODOLOGY', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 60, 75);

  riskResult.dataSources.forEach((src) => {
    doc.text(`• ${src.name}: ${src.dataset} (${src.period}) - ${src.reliability}`, 16, y);
    y += 4.5;
  });

  y += 3;

  // Assumptions & Limitations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(14, 19, 33);
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
  doc.setTextColor(14, 19, 33);
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
  doc.setTextColor(120, 130, 140);
  doc.text('RiskLens TN is an analytical intelligence platform. Verified datasets from IMD, TNSDMA and Survey of India.', 14, 285);
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

  // Header Bar
  doc.setFillColor(14, 19, 33); // #0e1321
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(79, 219, 200); // #4fdbc8 Luminous Teal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RISKLENS TN — INDICATIVE INSURANCE PRICING REPORT', 14, 14);

  doc.setTextColor(222, 226, 246);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Actuarial Scenario Breakdown & Indicative Underwriting Assessment', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(188, 201, 205);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Rule Engine: v2.4-transparent`, 14, 28);

  y = 40;

  // Section 1: Property & Asset Profile
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(14, 19, 33);
  doc.text('1. ASSET PROFILE & INSURED EXPOSURE', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 50, 65);
  doc.text(`Location: ${riskResult.location.name}`, 18, y + 12);
  doc.text(`Property Classification: ${property.propertyType}`, 18, y + 18);
  doc.text(`Plinth Height: ${property.plinthElevationCm} cm above ground level`, 18, y + 24);

  doc.text(`Building Value: INR ${property.propertyValue.toLocaleString('en-IN')}`, 110, y + 12);
  doc.text(`Contents Value: INR ${property.contentsValue.toLocaleString('en-IN')}`, 110, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Insured Sum: INR ${insurance.insuredAmount.toLocaleString('en-IN')}`, 110, y + 24);

  y += 34;

  // Section 2: Indicative Premium Formula
  doc.setFillColor(14, 19, 33);
  doc.roundedRect(14, y, pageWidth - 28, 48, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(76, 215, 246);
  doc.text('2. INDICATIVE PREMIUM CALCULATION FORMULA', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(188, 201, 205);
  doc.text('Formula: Indicative Premium = Insured Amount × Base Rate × Risk Adjustment Factor', 18, y + 16);

  doc.setTextColor(255, 255, 255);
  doc.text(`• Insured Amount: INR ${insurance.insuredAmount.toLocaleString('en-IN')}`, 18, y + 24);
  doc.text(`• Base Tariff Rate: ${insurance.baseRatePercent}% (Per IRDAI standard peril schedule)`, 18, y + 30);
  doc.text(`• Risk Adjustment Factor: ${insurance.riskAdjustmentFactor}x (Derived from Vulnerability ${riskResult.vulnerabilityIndex}/100)`, 18, y + 36);
  doc.text(`• Mandatory Policy Deductible: ${insurance.deductiblePercent}% (INR ${insurance.deductibleAmount.toLocaleString('en-IN')})`, 18, y + 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(79, 219, 200);
  doc.text(`Indicative Annual Premium: INR ${insurance.indicativeAnnualPremium.toLocaleString('en-IN')}`, 110, y + 26);
  doc.setFontSize(9);
  doc.setTextColor(188, 201, 205);
  doc.text(`+ 18% GST: INR ${insurance.gstAmount.toLocaleString('en-IN')}`, 110, y + 33);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Estimated Payable: INR ${insurance.totalIndicativePayable.toLocaleString('en-IN')}`, 110, y + 40);

  y += 54;

  // Section 3: Potential Property Loss if available
  if (lossResult) {
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(14, 19, 33);
    doc.text('3. PROPERTY LOSS SCENARIO ESTIMATION', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 60, 75);
    doc.text(`Modeled Damage Ratio: ${lossResult.damageRatioPercent}% (${lossResult.damageRatioSource})`, 18, y + 12);
    doc.text(`Estimated Structural Loss: INR ${lossResult.structuralLoss.toLocaleString('en-IN')}`, 18, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Modeled Asset Loss: INR ${lossResult.totalEstimatedLoss.toLocaleString('en-IN')}`, 110, y + 15);

    y += 28;
  }

  // Section 4: Assumptions & Exclusions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(14, 19, 33);
  doc.text('4. UNDERWRITING ASSUMPTIONS & EXCLUSIONS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 60, 75);

  insurance.assumptions.forEach((assump) => {
    doc.text(`• Assumption: ${assump}`, 16, y);
    y += 3.8;
  });

  insurance.exclusions.forEach((excl) => {
    doc.text(`• Exclusion: ${excl}`, 16, y);
    y += 3.8;
  });

  y += 4;

  // Disclaimer box
  doc.setFillColor(254, 242, 242); // Red tint
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('LEGAL NOTICE & STATUTORY DISCLAIMER:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    doc.splitTextToSize(insurance.disclaimer, pageWidth - 36),
    18,
    y + 9
  );

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 140);
  doc.text('RiskLens TN Insurance Pricing Rule Engine. Formula compliant with section 7 transparency directives.', 14, 285);
  doc.text(`Page 1 of 1 | Report ID: RLTN-INS-${Date.now().toString().slice(-6)}`, pageWidth - 60, 285);

  doc.save(`RiskLens_TN_Insurance_Pricing_${riskResult.location.district}.pdf`);
}
