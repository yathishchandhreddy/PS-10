import { CropDefinition, FarmProfile, CropLossResult, PmfbyEstimate, LocationData } from '../types';

export const TN_CROPS_CATALOG: CropDefinition[] = [
  {
    id: 'paddy_samba',
    name: 'Paddy / Rice (Samba / Thaladi)',
    tamilName: 'நெல் (சம்பா / தாளடி)',
    category: 'Cereals & Grains',
    recommendedSeason: 'Samba / Thaladi / Rabi (Oct-Jan)',
    standardYieldPerAcre: 24, // quintals
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 2320, // ₹ per quintal (Govt MSP 2024-25 Grade A)
    standardInputCostPerAcre: 22000,
    pmfbySumInsuredPerAcre: 41000,
    pmfbyPremiumRatePercent: 1.5, // 1.5% for Rabi
    floodTolerance: 'Moderate',
    cycloneWindTolerance: 'Low',
    droughtTolerance: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?q=80&w=800&auto=format&fit=crop',
    description: 'Main staple crop of the Cauvery Delta (Thanjavur, Tiruvarur, Nagapattinam). Vulnerable to Northeast monsoon floods and storm inundation during heading stage.'
  },
  {
    id: 'paddy_kuruvai',
    name: 'Paddy / Rice (Kuruvai)',
    tamilName: 'நெல் (குறுவை)',
    category: 'Cereals & Grains',
    recommendedSeason: 'Kuruvai / Kharif (Jun-Sep)',
    standardYieldPerAcre: 26,
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 2300,
    standardInputCostPerAcre: 20000,
    pmfbySumInsuredPerAcre: 38500,
    pmfbyPremiumRatePercent: 2.0, // 2% for Kharif
    floodTolerance: 'Moderate',
    cycloneWindTolerance: 'Moderate',
    droughtTolerance: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
    description: 'Short-duration summer crop heavily dependent on Mettur Dam water releases and canal irrigation.'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    tamilName: 'கரும்பு',
    category: 'Commercial & Cash Crops',
    recommendedSeason: 'Samba / Thaladi / Rabi (Oct-Jan)',
    standardYieldPerAcre: 42, // tonnes
    yieldUnit: 'Tonnes',
    mspOrPricePerUnit: 3150, // ₹ per tonne (Fair & Remunerative Price)
    standardInputCostPerAcre: 55000,
    pmfbySumInsuredPerAcre: 92000,
    pmfbyPremiumRatePercent: 5.0, // 5% for Commercial
    floodTolerance: 'Resilient (Sub-1 varieties)',
    cycloneWindTolerance: 'Moderate',
    droughtTolerance: 'Moderate',
    imageUrl: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?q=80&w=800&auto=format&fit=crop',
    description: 'High-biomass perennial crop cultivated widely in Villupuram, Cuddalore, Erode, and Thanjavur. Tolerates standing water up to 48 hours but susceptible to lodging in severe cyclones.'
  },
  {
    id: 'banana',
    name: 'Banana (Grand Naine / Poovan / Nendran)',
    tamilName: 'வாழை',
    category: 'Horticulture & Fruits',
    recommendedSeason: 'Kuruvai / Kharif (Jun-Sep)',
    standardYieldPerAcre: 180, // quintals (approx 18 tonnes)
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 1650,
    standardInputCostPerAcre: 68000,
    pmfbySumInsuredPerAcre: 110000,
    pmfbyPremiumRatePercent: 5.0,
    floodTolerance: 'Very Low',
    cycloneWindTolerance: 'Low',
    droughtTolerance: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=800&auto=format&fit=crop',
    description: 'Highly profitable but extremely fragile horticultural asset in Tiruchirappalli, Theni, and Tirunelveli. Susceptible to pseudostem snapping at wind speeds > 60 km/h.'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    tamilName: 'பருத்தி',
    category: 'Commercial & Cash Crops',
    recommendedSeason: 'Kuruvai / Kharif (Jun-Sep)',
    standardYieldPerAcre: 9, // quintals
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 7120, // ₹ per quintal MSP
    standardInputCostPerAcre: 24000,
    pmfbySumInsuredPerAcre: 44000,
    pmfbyPremiumRatePercent: 2.0,
    floodTolerance: 'Very Low',
    cycloneWindTolerance: 'Moderate',
    droughtTolerance: 'Moderate',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop',
    description: 'Cultivated in black cotton soils of Madurai, Virudhunagar, and Salem. Waterlogging for over 24 hours causes immediate boll rot and root asphyxiation.'
  },
  {
    id: 'groundnut',
    name: 'Groundnut / Peanut',
    tamilName: 'வேர்க்கடலை / நிலக்கடலை',
    category: 'Oilseeds & Pulses',
    recommendedSeason: 'Samba / Thaladi / Rabi (Oct-Jan)',
    standardYieldPerAcre: 11, // quintals
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 6780,
    standardInputCostPerAcre: 19500,
    pmfbySumInsuredPerAcre: 35000,
    pmfbyPremiumRatePercent: 1.5,
    floodTolerance: 'Very Low',
    cycloneWindTolerance: 'High',
    droughtTolerance: 'Moderate',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=800&auto=format&fit=crop',
    description: 'Key rainfed and irrigated crop in Tiruvannamalai, Villupuram, and Vellore. Pod development is halted by soil moisture saturation.'
  },
  {
    id: 'coconut',
    name: 'Coconut Plantation',
    tamilName: 'தென்னை',
    category: 'Horticulture & Fruits',
    recommendedSeason: 'Samba / Thaladi / Rabi (Oct-Jan)',
    standardYieldPerAcre: 60, // hundred nuts (~6,000 nuts/acre)
    yieldUnit: 'Hundred Nuts',
    mspOrPricePerUnit: 1450,
    standardInputCostPerAcre: 28000,
    pmfbySumInsuredPerAcre: 65000,
    pmfbyPremiumRatePercent: 5.0,
    floodTolerance: 'Moderate',
    cycloneWindTolerance: 'Moderate',
    droughtTolerance: 'Moderate',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    description: 'Long-term tree plantation concentrated in Pollachi, Coimbatore, Thanjavur, and Kanyakumari. High crown damage and snapping risk during cyclones (e.g., Cyclone Gaja).'
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    tamilName: 'மஞ்சள்',
    category: 'Commercial & Cash Crops',
    recommendedSeason: 'Kuruvai / Kharif (Jun-Sep)',
    standardYieldPerAcre: 25, // quintals
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 8200,
    standardInputCostPerAcre: 48000,
    pmfbySumInsuredPerAcre: 80000,
    pmfbyPremiumRatePercent: 5.0,
    floodTolerance: 'Low',
    cycloneWindTolerance: 'High',
    droughtTolerance: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop',
    description: 'Signature commercial rhizome crop of the Kongu belt (Erode, Namakkal). Vulnerable to rhizome rot under stagnated flood water.'
  },
  {
    id: 'millets',
    name: 'Millets (Ragi / Kambu / Sorghum)',
    tamilName: 'சிறுதானியங்கள் (கேழ்வரகு / கம்பு / சோளம்)',
    category: 'Cereals & Grains',
    recommendedSeason: 'Kuruvai / Kharif (Jun-Sep)',
    standardYieldPerAcre: 16,
    yieldUnit: 'Quintals',
    mspOrPricePerUnit: 3900,
    standardInputCostPerAcre: 11000,
    pmfbySumInsuredPerAcre: 24000,
    pmfbyPremiumRatePercent: 2.0,
    floodTolerance: 'Low',
    cycloneWindTolerance: 'Moderate',
    droughtTolerance: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop',
    description: 'Climate-resilient nutri-cereals grown in Dharmapuri, Krishnagiri, and Virudhunagar. High drought resistance, but heavy unseasonal rains at maturity trigger ear-head grain mold.'
  }
];

export const TN_AGRI_ZONES = [
  {
    name: 'Cauvery Delta Zone (Rice Bowl)',
    districts: ['Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai'],
    primaryCrops: 'Paddy (Samba & Kuruvai), Pulses, Sugarcane',
    keyRisks: 'Monsoon flash floods, tidal storm surges, river canal overflow, drainage congestion',
    lat: 10.7870,
    lng: 79.1378
  },
  {
    name: 'Western Agro-Climatic Zone',
    districts: ['Erode', 'Coimbatore', 'Tiruppur'],
    primaryCrops: 'Turmeric, Coconut, Sugarcane, Maize, Vegetables',
    keyRisks: 'Drought spells, groundwater drawdown, localized cyclonic squalls',
    lat: 11.3410,
    lng: 77.7172
  },
  {
    name: 'Southern Dryland & River Basin Zone',
    districts: ['Madurai', 'Tirunelveli', 'Theni', 'Ramanathapuram', 'Virudhunagar'],
    primaryCrops: 'Banana, Cotton, Paddy (Thamirabarani), Millets, Chilli',
    keyRisks: 'Delayed monsoon, flash floods along river valleys, coastal cyclone landfall',
    lat: 9.9252,
    lng: 78.1198
  },
  {
    name: 'North-Eastern Coastal & Interior Zone',
    districts: ['Cuddalore', 'Villupuram', 'Tiruvannamalai', 'Chengalpattu'],
    primaryCrops: 'Paddy, Sugarcane, Groundnut, Cashew',
    keyRisks: 'Severe coastal cyclonic storm landfalls, heavy coastal flood inundation',
    lat: 11.7480,
    lng: 79.7714
  }
];

export function calculateCropLoss(
  farm: FarmProfile,
  location: LocationData,
  disasterType: 'flood' | 'cyclone' | 'drought' | 'unseasonal_rain' = 'flood',
  severityMultiplier: number = 1.0 // 0.5 to 1.5
): CropLossResult {
  const crop = TN_CROPS_CATALOG.find((c) => c.id === farm.cropId) || TN_CROPS_CATALOG[0];

  const totalYield = crop.standardYieldPerAcre * farm.acres;
  const exposedGrossValue = totalYield * crop.mspOrPricePerUnit;
  const totalInputCost = (farm.inputInvestmentPerAcre || crop.standardInputCostPerAcre) * farm.acres;

  // Base loss ratio based on growth stage
  let stageVulnerability = 0.5;
  switch (farm.stage) {
    case 'Sowing / Seedling':
      stageVulnerability = 0.75; // Sowing loss = total replanting needed
      break;
    case 'Vegetative / Tillering':
      stageVulnerability = 0.45; // Crops can partially recover
      break;
    case 'Flowering / Panicle':
      stageVulnerability = 0.85; // Critical stage, waterlogging/wind causes sterile spikes
      break;
    case 'Maturity / Harvest Ready':
      stageVulnerability = 0.92; // Lodging and rotting causes total unharvestable loss
      break;
  }

  // Location spatial risk factor
  let terrainFactor = 1.0;
  if (location.elevationMeters <= 5) terrainFactor += 0.35; // coastal lowlands
  if (location.distanceToCoastKm <= 10) terrainFactor += 0.25; // cyclonic wind corridor

  // Peril specific sensitivity
  let perilFactor = 0.5;
  if (disasterType === 'flood') {
    if (crop.floodTolerance === 'Very Low' || crop.floodTolerance === 'Low') perilFactor = 0.85;
    else if (crop.floodTolerance === 'Moderate') perilFactor = 0.6;
    else perilFactor = 0.3; // Resilient varieties
  } else if (disasterType === 'cyclone') {
    if (crop.cycloneWindTolerance === 'Low') perilFactor = 0.95; // e.g. Banana snapped
    else if (crop.cycloneWindTolerance === 'Moderate') perilFactor = 0.55;
    else perilFactor = 0.25;
  } else if (disasterType === 'drought') {
    if (crop.droughtTolerance === 'Low') perilFactor = 0.8;
    else if (crop.droughtTolerance === 'Moderate') perilFactor = 0.45;
    else perilFactor = 0.2;
  } else {
    // Unseasonal rain
    perilFactor = farm.stage === 'Maturity / Harvest Ready' ? 0.85 : 0.4;
  }

  // Calculate yield loss %
  let estimatedLossPct = Math.round(stageVulnerability * perilFactor * terrainFactor * severityMultiplier * 100);
  estimatedLossPct = Math.min(95, Math.max(12, estimatedLossPct));

  // Compute monetary figures
  const estimatedLossAmount = Math.round((exposedGrossValue * estimatedLossPct) / 100);
  const salvageableValue = Math.max(0, exposedGrossValue - estimatedLossAmount);
  const inputDamage = Math.round((totalInputCost * estimatedLossPct) / 100);
  const netFinancialDamage = estimatedLossAmount + Math.round(inputDamage * 0.4);

  let impactSeverity: 'Minor' | 'Moderate' | 'Severe' | 'Catastrophic' = 'Moderate';
  if (estimatedLossPct > 75) impactSeverity = 'Catastrophic';
  else if (estimatedLossPct > 50) impactSeverity = 'Severe';
  else if (estimatedLossPct < 25) impactSeverity = 'Minor';

  // Advisories
  const steps: string[] = [];
  if (disasterType === 'flood') {
    steps.push('Clear field drainage outlets to drain water within 24-48 hours to avert root rot.');
    steps.push('Foliar spray of 1% Urea + 0.5% Zinc Sulphate post-drainage to induce tillering recovery.');
    steps.push('Inform the Village Administrative Officer (VAO) and Agricultural Officer within 72 hours for crop damage survey.');
  } else if (disasterType === 'cyclone') {
    steps.push('Provide propping support with bamboo or casuarina poles for banana and sugarcane crops.');
    steps.push('Harvest mature bunches or standing harvest immediately if cyclone alerts indicate winds > 55 km/h.');
    steps.push('Clear perimeter farm bunds to prevent secondary water stagnations from torrential rains.');
  } else {
    steps.push('Adopt alternate wetting and drying (AWD) irrigation to conserve root-zone water.');
    steps.push('Apply coir-pith mulch (5 tonnes/acre) to reduce soil moisture evaporation.');
  }

  return {
    exposedCropGrossValue: exposedGrossValue,
    totalInputInvested: totalInputCost,
    estimatedYieldLossPercent: estimatedLossPct,
    estimatedLossAmount,
    salvageableValue,
    netFinancialDamage,
    primaryRiskDriver: disasterType === 'flood' ? 'Waterlogging & River Canal Overflow' : disasterType === 'cyclone' ? 'High-Velocity Gale Wind & Lodging' : 'Rainfall Deficit & Soil Moisture Depletion',
    impactSeverity,
    advisorySummary: `For ${farm.acres} acres of ${crop.name} at ${farm.stage} stage, an estimated ${estimatedLossPct}% yield reduction is projected during extreme ${disasterType} events.`,
    mitigationSteps: steps
  };
}

export function computePmfbyInsurance(
  farm: FarmProfile,
  lossResult?: CropLossResult
): PmfbyEstimate {
  const crop = TN_CROPS_CATALOG.find((c) => c.id === farm.cropId) || TN_CROPS_CATALOG[0];

  const totalSumInsured = crop.pmfbySumInsuredPerAcre * farm.acres;
  const farmerRate = crop.pmfbyPremiumRatePercent; // e.g. 1.5% or 2% or 5%

  const farmerPayablePremium = Math.round((totalSumInsured * farmerRate) / 100);

  // Actuarial market rate without government subsidy is typically 12% to 18% in catastrophe-prone Tamil Nadu
  const actuarialRate = 14.5;
  const actualActuarialPremium = Math.round((totalSumInsured * actuarialRate) / 100);

  // The remaining 12.5% to 13% is split 50:50 by Central and TN State Govt
  const totalGovtSubsidy = actualActuarialPremium - farmerPayablePremium;
  const centralGovtSubsidy = Math.round(totalGovtSubsidy / 2);
  const stateGovtSubsidy = totalGovtSubsidy - centralGovtSubsidy;

  // Claim compensation estimate based on loss
  const lossPct = lossResult ? lossResult.estimatedYieldLossPercent : 55;
  // PMFBY threshold yield shortfall calculation
  const claimEstimate = Math.round((totalSumInsured * Math.max(0, lossPct - 15)) / 100);

  return {
    cropName: crop.name,
    acres: farm.acres,
    totalSumInsured,
    farmerPremiumRatePercent: farmerRate,
    farmerPayablePremium,
    centralGovtSubsidy,
    stateGovtSubsidy,
    totalGovernmentSubsidy: totalGovtSubsidy,
    actualActuarialPremium,
    claimIndemnityLevelPercent: 90, // Statutory 90% indemnity tier in TN
    estimatedClaimCompensation: claimEstimate,
    notifiedSeason: farm.season,
    insuranceCompany: 'Agriculture Insurance Company of India (AIC) / IFFCO-TOKIO (TN Cluster)',
    enrollmentCutoffDate: farm.season.includes('Samba') ? '15th November (Samba Notified Cutoff)' : '31st July (Kuruvai Notified Cutoff)'
  };
}
