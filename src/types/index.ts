export type DisasterType = 'flood' | 'cyclone' | 'earthquake';

export interface LocationData {
  name: string;
  district: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  distanceToCoastKm: number;
  distanceToWaterbodyM: number;
  seismicZone: 'Zone II (Low)' | 'Zone III (Moderate)' | 'Zone IV';
  isUserLocation?: boolean;
}

export type DataConfidence = 'High (Verified Grid)' | 'Moderate (Interpolated)' | 'Illustrative Scenario' | 'Insufficient Data';

export interface ContributingFactor {
  id: string;
  name: string;
  icon: string;
  impactLevel: 'Critical Zone' | 'High Impact' | 'Moderate' | 'Low' | 'Historical';
  color: 'error' | 'primary' | 'secondary' | 'tertiary';
  description: string;
  verifiedValue: string;
  source: string;
}

export interface RiskAnalysisResult {
  location: LocationData;
  disasterType: DisasterType;
  analysisRadiusKm: number;
  vulnerabilityIndex: number; // 0 - 100
  riskCategory: 'Low Estimated Risk' | 'Moderate Estimated Risk' | 'Higher Estimated Risk' | 'Severe Catastrophe Watch';
  confidence: DataConfidence;
  confidenceDetail: string;
  summaryText: string;
  contributingFactors: ContributingFactor[];
  dataSources: {
    name: string;
    dataset: string;
    coverage: string;
    period: string;
    reliability: string;
  }[];
  assumptions: string[];
  limitations: string[];
  missingData: string[];
  modelVersion: string;
  calculatedAt: string;
  isIllustrative: boolean;
}

export interface PropertyDetails {
  propertyValue: number; // INR
  contentsValue: number; // INR
  propertyType: 'Residential RCC' | 'Commercial Office' | 'Industrial Shed' | 'Independent Villa' | 'Semi-Pucca / Tiled';
  builtYear: number;
  plinthElevationCm: number;
  floorsCount: number;
}

export interface LossEstimateResult {
  exposedAssetValue: number;
  structuralLoss: number;
  contentsLoss: number;
  totalEstimatedLoss: number;
  damageRatioPercent: number;
  isVerifiedDamageRatio: boolean;
  damageRatioSource: string;
  methodologyNotes: string[];
  uncertaintyNotes: string[];
}

export interface InsurancePricingResult {
  insuredAmount: number;
  baseRatePercent: number;
  riskAdjustmentFactor: number;
  indicativeAnnualPremium: number;
  gstAmount: number;
  totalIndicativePayable: number;
  deductiblePercent: number;
  deductibleAmount: number;
  disasterScenario: DisasterType;
  assumptions: string[];
  exclusions: string[];
  limitations: string[];
  disclaimer: string;
}

export interface SimulationStage {
  timeRange: string;
  title: string;
  shortLabel: string;
  depthIndicator: string;
  waterStatus: string;
  description: string;
  imageUrl: string;
  vectorArrowsActive?: boolean;
}

// ==========================================
// FARMER MODULE TYPES & DATA MODELS
// ==========================================

export type CropCategory = 'Cereals & Grains' | 'Commercial & Cash Crops' | 'Horticulture & Fruits' | 'Oilseeds & Pulses';

export type TNSeason = 'Kuruvai / Kharif (Jun-Sep)' | 'Samba / Thaladi / Rabi (Oct-Jan)' | 'Navarai / Summer (Feb-May)';

export type CropGrowthStage = 'Sowing / Seedling' | 'Vegetative / Tillering' | 'Flowering / Panicle' | 'Maturity / Harvest Ready';

export interface CropDefinition {
  id: string;
  name: string;
  tamilName: string;
  category: CropCategory;
  recommendedSeason: string;
  standardYieldPerAcre: number; // in quintals (or tonnes for sugarcane)
  yieldUnit: string;
  mspOrPricePerUnit: number; // in INR
  standardInputCostPerAcre: number; // INR
  pmfbySumInsuredPerAcre: number; // INR
  pmfbyPremiumRatePercent: number; // 1.5% Rabi, 2% Kharif, 5% Commercial
  floodTolerance: 'Very Low' | 'Low' | 'Moderate' | 'Resilient (Sub-1 varieties)';
  cycloneWindTolerance: 'Low' | 'Moderate' | 'High';
  droughtTolerance: 'Low' | 'Moderate' | 'High';
  imageUrl: string;
  description: string;
}

export interface FarmProfile {
  farmerName: string;
  district: string;
  talukOrVillage: string;
  surveyNumber: string;
  cropId: string;
  acres: number;
  season: TNSeason;
  stage: CropGrowthStage;
  irrigationSource: 'Cauvery / River Canal' | 'Borewell / Tube Well' | 'Open Well / Farm Pond' | 'Rainfed / Non-irrigated';
  soilType: 'Delta Alluvial Soil' | 'Deep Black Cotton Soil' | 'Red Loamy Soil' | 'Coastal Saline / Sandy';
  inputInvestmentPerAcre: number;
}

export interface CropLossResult {
  exposedCropGrossValue: number;
  totalInputInvested: number;
  estimatedYieldLossPercent: number;
  estimatedLossAmount: number;
  salvageableValue: number;
  netFinancialDamage: number;
  primaryRiskDriver: string;
  impactSeverity: 'Minor' | 'Moderate' | 'Severe' | 'Catastrophic';
  advisorySummary: string;
  mitigationSteps: string[];
}

export interface PmfbyEstimate {
  cropName: string;
  acres: number;
  totalSumInsured: number;
  farmerPremiumRatePercent: number;
  farmerPayablePremium: number;
  centralGovtSubsidy: number;
  stateGovtSubsidy: number;
  totalGovernmentSubsidy: number;
  actualActuarialPremium: number;
  claimIndemnityLevelPercent: number;
  estimatedClaimCompensation: number;
  notifiedSeason: string;
  insuranceCompany: string;
  enrollmentCutoffDate: string;
}
