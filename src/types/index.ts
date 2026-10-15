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
