import React, { useState, useMemo } from 'react';
import { LocationData } from '../types';
import {
  TN_CROPS_CATALOG,
  TN_AGRI_ZONES,
  calculateCropLoss,
  computePmfbyInsurance
} from '../services/farmerEngine';
import { generateFarmerReportPDF } from '../services/pdfGenerator';
import { FarmProfile, TNSeason, CropGrowthStage } from '../types';

interface FarmerModuleProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onOpenMap: () => void;
  onSwitchRole: () => void;
  farmerName?: string;
}

export const FarmerModule: React.FC<FarmerModuleProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenMap,
  onSwitchRole,
  farmerName = 'Cauvery Delta Farmer'
}) => {
  // Active Tab: 'home' | 'risk' | 'loss' | 'insurance' | 'report'
  const [activeTab, setActiveTab] = useState<'home' | 'risk' | 'loss' | 'insurance' | 'report'>('home');

  // Farm Profile State
  const [farm, setFarm] = useState<FarmProfile>({
    farmerName: farmerName,
    district: currentLocation.district === 'Tamil Nadu' ? 'Thanjavur' : currentLocation.district,
    talukOrVillage: 'Papanasam Taluk / Thiruvaiyaru Basin',
    surveyNumber: '142/2B',
    cropId: 'paddy_samba',
    acres: 3,
    season: 'Samba / Thaladi / Rabi (Oct-Jan)',
    stage: 'Flowering / Panicle',
    irrigationSource: 'Cauvery / River Canal',
    soilType: 'Delta Alluvial Soil',
    inputInvestmentPerAcre: 22000
  });

  // Simulated Hazard Type for Agriculture
  const [hazardType, setHazardType] = useState<'flood' | 'cyclone' | 'drought' | 'unseasonal_rain'>('flood');
  const [hazardSeverity, setHazardSeverity] = useState<number>(1.0); // 0.6 = moderate, 1.0 = severe, 1.4 = catastrophic

  // Selected Crop Definition
  const selectedCrop = useMemo(() => {
    return TN_CROPS_CATALOG.find((c) => c.id === farm.cropId) || TN_CROPS_CATALOG[0];
  }, [farm.cropId]);

  // Crop Loss Calculations
  const lossResult = useMemo(() => {
    return calculateCropLoss(farm, currentLocation, hazardType, hazardSeverity);
  }, [farm, currentLocation, hazardType, hazardSeverity]);

  // PMFBY Insurance Calculations
  const pmfbyResult = useMemo(() => {
    return computePmfbyInsurance(farm, lossResult);
  }, [farm, lossResult]);

  // Quick Preset Location Switcher
  const handleSelectAgriZone = (zone: typeof TN_AGRI_ZONES[0]) => {
    onSelectLocation({
      name: `${zone.districts[0]} Agricultural Basin`,
      district: zone.districts[0],
      lat: zone.lat,
      lng: zone.lng,
      elevationMeters: zone.districts[0] === 'Nagapattinam' ? 4 : 22,
      distanceToCoastKm: zone.districts[0] === 'Nagapattinam' ? 2 : 75,
      distanceToWaterbodyM: 350,
      seismicZone: 'Zone II (Low)'
    });
    setFarm((prev) => ({
      ...prev,
      district: zone.districts[0],
      talukOrVillage: `${zone.districts[0]} Delta Block`
    }));
  };

  // PDF Export Trigger
  const handleExportPDF = () => {
    generateFarmerReportPDF(
      farm,
      selectedCrop,
      lossResult,
      pmfbyResult,
      currentLocation
    );
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-fadeIn pb-12">
      {/* Top Agricultural Banner / Navigation */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-300">agriculture</span>
                <span>FARMER INTELLIGENCE MODULE • உழவர் நலம்</span>
              </span>
              <span className="text-xs text-emerald-200/80 font-mono">
                {farm.district} • {farm.acres} Acres
              </span>
            </div>

            <h1 className="font-space font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              Protect Your Crops. <br className="hidden sm:inline" />
              <span className="text-emerald-300">Understand Your Risk.</span>
            </h1>

            <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Explore disaster exposure, estimate potential crop losses, and discover ways to protect your farm with government-subsidized PMFBY crop insurance.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenMap}
              className="px-4 py-2.5 rounded-2xl bg-white text-emerald-900 font-space font-bold text-xs flex items-center gap-2 hover:bg-emerald-50 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-700">map</span>
              <span>Inspect Farm on GIS Map</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/40 text-white font-space font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-200">download</span>
              <span>Download Farm Risk Report (PDF)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="relative z-10 mt-6 pt-6 border-t border-emerald-700/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'home', label: 'Farmer Home', icon: 'home', desc: 'Overview & 4 Cards' },
            { id: 'risk', label: 'Check Farm Risk', icon: 'shield_with_heart', desc: 'Disaster Exposure' },
            { id: 'loss', label: 'Calculate Crop Loss', icon: 'calculate', desc: 'Yield & Monetary Loss' },
            { id: 'insurance', label: 'Explore Crop Insurance', icon: 'verified_user', desc: 'PMFBY Subsidies' },
            { id: 'report', label: 'View Farm Risk Report', icon: 'description', desc: 'Print & PDF' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-space font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'bg-emerald-900/50 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-700/40'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. FARMER HOMEPAGE (With the Four Large Action Cards) */}
      {/* ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Farm Setup Strip */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">potted_plant</span>
                </span>
                <div>
                  <h3 className="font-space font-bold text-sm sm:text-base text-[#1E293B]">
                    Current Cultivation & Farm Parcel
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Configure your cultivated crop, acreage, and growth stage for real-time loss simulation.
                  </p>
                </div>
              </div>

              {/* Agricultural Zones Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-[#64748B]">Agro Zones:</span>
                {TN_AGRI_ZONES.map((zone) => (
                  <button
                    key={zone.name}
                    type="button"
                    onClick={() => handleSelectAgriZone(zone)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      farm.district === zone.districts[0]
                        ? 'bg-[#059669] text-white font-bold'
                        : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {zone.districts[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Profile Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Crop Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase mb-1">
                  Cultivated Crop
                </label>
                <select
                  value={farm.cropId}
                  onChange={(e) => {
                    const c = TN_CROPS_CATALOG.find((item) => item.id === e.target.value);
                    setFarm((prev) => ({
                      ...prev,
                      cropId: e.target.value,
                      inputInvestmentPerAcre: c ? c.standardInputCostPerAcre : prev.inputInvestmentPerAcre
                    }));
                  }}
                  className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#1E293B] focus:border-[#059669] outline-none"
                >
                  {TN_CROPS_CATALOG.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} ({crop.tamilName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Acreage */}
              <div>
                <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase mb-1">
                  Farm Area (Acres)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={100}
                    step={0.5}
                    value={farm.acres}
                    onChange={(e) => setFarm((prev) => ({ ...prev, acres: Math.max(0.5, parseFloat(e.target.value) || 1) }))}
                    className="w-24 px-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#1E293B] focus:border-[#059669] outline-none font-mono"
                  />
                  <div className="flex gap-1">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFarm((prev) => ({ ...prev, acres: num }))}
                        className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                          farm.acres === num ? 'bg-[#059669] text-white font-bold' : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {num}A
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cultivation Season */}
              <div>
                <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase mb-1">
                  Season
                </label>
                <select
                  value={farm.season}
                  onChange={(e) => setFarm((prev) => ({ ...prev, season: e.target.value as TNSeason }))}
                  className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#1E293B] focus:border-[#059669] outline-none"
                >
                  <option value="Samba / Thaladi / Rabi (Oct-Jan)">Samba / Thaladi (Oct-Jan)</option>
                  <option value="Kuruvai / Kharif (Jun-Sep)">Kuruvai / Kharif (Jun-Sep)</option>
                  <option value="Navarai / Summer (Feb-May)">Navarai / Summer (Feb-May)</option>
                </select>
              </div>

              {/* Growth Stage */}
              <div>
                <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase mb-1">
                  Growth Stage
                </label>
                <select
                  value={farm.stage}
                  onChange={(e) => setFarm((prev) => ({ ...prev, stage: e.target.value as CropGrowthStage }))}
                  className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#1E293B] focus:border-[#059669] outline-none"
                >
                  <option value="Sowing / Seedling">Sowing / Seedling</option>
                  <option value="Vegetative / Tillering">Vegetative / Tillering</option>
                  <option value="Flowering / Panicle">Flowering / Panicle Initiation</option>
                  <option value="Maturity / Harvest Ready">Maturity / Harvest Ready</option>
                </select>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE FOUR LARGE ACTION CARDS REQUESTED BY USER */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD A: Check Farm Risk */}
            <div
              onClick={() => setActiveTab('risk')}
              className="bg-white border-2 border-[#E2E8F0] hover:border-[#059669] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] group-hover:scale-105 transition-transform shadow-xs">
                    <span className="material-symbols-outlined text-[30px]">shield_with_heart</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] font-mono font-bold text-xs border border-[#A7F3D0]">
                    Action A
                  </span>
                </div>

                <h3 className="font-space font-extrabold text-xl text-[#1E293B] group-hover:text-[#059669] transition-colors mb-2">
                  A. Check Farm Risk
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Inspect multi-hazard exposure for your specific farm parcel in {farm.district}. View flood inundation depths, cyclone wind impact, drought indices, and agricultural advisories.
                </p>

                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Primary Exposure:</span>
                  <span className="font-bold text-[#DC2626] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">flood</span>
                    Cauvery Flood &amp; Monsoon Waterlogging
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-space font-bold text-[#059669]">
                <span>Analyze Disaster Risk &rarr;</span>
                <span className="text-[11px] font-mono text-[#64748B]">TNSDMA &amp; IMD Data</span>
              </div>
            </div>

            {/* CARD B: Calculate Crop Loss */}
            <div
              onClick={() => setActiveTab('loss')}
              className="bg-white border-2 border-[#E2E8F0] hover:border-[#D97706] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] group-hover:scale-105 transition-transform shadow-xs">
                    <span className="material-symbols-outlined text-[30px]">calculate</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] font-mono font-bold text-xs border border-[#FDE68A]">
                    Action B
                  </span>
                </div>

                <h3 className="font-space font-extrabold text-xl text-[#1E293B] group-hover:text-[#D97706] transition-colors mb-2">
                  B. Calculate Crop Loss
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Simulate potential crop damage and financial loss for {farm.acres} acres of {selectedCrop.name} at {farm.stage} stage. Calculate input losses and remaining harvest value.
                </p>

                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Estimated Damage:</span>
                  <span className="font-bold text-[#DC2626]">
                    {lossResult.estimatedYieldLossPercent}% Yield Loss (₹{lossResult.estimatedLossAmount.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-space font-bold text-[#D97706]">
                <span>Run Crop Loss Calculator &rarr;</span>
                <span className="text-[11px] font-mono text-[#64748B]">TNAU Crop Loss Models</span>
              </div>
            </div>

            {/* CARD C: Explore Crop Insurance */}
            <div
              onClick={() => setActiveTab('insurance')}
              className="bg-white border-2 border-[#E2E8F0] hover:border-[#0D9488] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] group-hover:scale-105 transition-transform shadow-xs">
                    <span className="material-symbols-outlined text-[30px]">verified_user</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] font-mono font-bold text-xs border border-[#99F6E4]">
                    Action C
                  </span>
                </div>

                <h3 className="font-space font-extrabold text-xl text-[#1E293B] group-hover:text-[#0D9488] transition-colors mb-2">
                  C. Explore Crop Insurance
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Explore Pradhan Mantri Fasal Bima Yojana (PMFBY). Pay only 1.5% to 2.0% subsidized premium while Tamil Nadu &amp; Central Government subsidize up to 95% of the policy.
                </p>

                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Farmer Share:</span>
                  <span className="font-bold text-[#059669]">
                    Only ₹{pmfbyResult.farmerPayablePremium.toLocaleString('en-IN')} for ₹{pmfbyResult.totalSumInsured.toLocaleString('en-IN')} coverage
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-space font-bold text-[#0D9488]">
                <span>Calculate PMFBY Premium &rarr;</span>
                <span className="text-[11px] font-mono text-[#64748B]">Govt Subsidized Rate</span>
              </div>
            </div>

            {/* CARD D: View Farm Risk Report */}
            <div
              onClick={() => setActiveTab('report')}
              className="bg-white border-2 border-[#E2E8F0] hover:border-[#0EA5E9] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0EA5E9] group-hover:scale-105 transition-transform shadow-xs">
                    <span className="material-symbols-outlined text-[30px]">description</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F0F9FF] text-[#0EA5E9] font-mono font-bold text-xs border border-[#BAE6FD]">
                    Action D
                  </span>
                </div>

                <h3 className="font-space font-extrabold text-xl text-[#1E293B] group-hover:text-[#0EA5E9] transition-colors mb-2">
                  D. View Farm Risk Report
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Access a printable and downloadable comprehensive Farm Risk &amp; Crop Loss Assessment report. Use it for bank crop loan verification, PMFBY claims, and VAO surveys.
                </p>

                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Format:</span>
                  <span className="font-bold text-[#0EA5E9] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                    Official Printable PDF Certificate
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-space font-bold text-[#0EA5E9]">
                <span>Open Official Report Preview &rarr;</span>
                <span className="text-[11px] font-mono text-[#64748B]">Instant PDF Download</span>
              </div>
            </div>
          </div>

          {/* Quick Emergency Assistance Box for Farmers */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">support_agent</span>
              </span>
              <div>
                <h4 className="font-space font-bold text-sm text-emerald-950">
                  Tamil Nadu Farmers' Emergency Helplines (உழவர் உதவி மையம்)
                </h4>
                <p className="text-xs text-emerald-800">
                  Kisan Call Center: <strong>1800-180-1551</strong> • PMFBY Grievance: <strong>14447</strong> • State Control Room: <strong>1070</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchRole}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:border-emerald-600 text-emerald-900 font-space font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              Switch Role
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB A: CHECK FARM RISK */}
      {/* ======================================================== */}
      {activeTab === 'risk' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
                Check Farm Disaster Exposure
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Spatial catastrophe analysis for {farm.acres} acres in {farm.district} ({currentLocation.name}).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-mono text-[#64748B] hover:text-[#059669] cursor-pointer"
            >
              &larr; Back to Cards
            </button>
          </div>

          {/* Hazard Selection Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'flood', label: 'Flood & Waterlogging', icon: 'flood', color: '#059669', desc: 'Canal overflow & monsoon deluge' },
              { id: 'cyclone', label: 'Cyclone & Wind Gusts', icon: 'cyclone', color: '#0EA5E9', desc: 'High wind lodging & snapping' },
              { id: 'drought', label: 'Drought & Water Deficit', icon: 'water_loss', color: '#D97706', desc: 'Borewell & monsoon failure' },
              { id: 'unseasonal_rain', label: 'Unseasonal Rains', icon: 'grain', color: '#8B5CF6', desc: 'Harvest stage spoilage' }
            ].map((hazard) => {
              const isSelected = hazardType === hazard.id;
              return (
                <button
                  key={hazard.id}
                  type="button"
                  onClick={() => setHazardType(hazard.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#059669] shadow-md ring-1 ring-[#059669]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[20px]" style={{ color: hazard.color }}>
                      {hazard.icon}
                    </span>
                    <span className="font-space font-bold text-xs text-[#1E293B]">
                      {hazard.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">{hazard.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Detailed Hazard Assessment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Risk Metrics */}
            <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="font-space font-bold text-base text-[#1E293B]">
                  Field Risk Indicators for {selectedCrop.name}
                </h3>
                <span className="text-xs font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                  Tolerance: {hazardType === 'flood' ? selectedCrop.floodTolerance : hazardType === 'cyclone' ? selectedCrop.cycloneWindTolerance : selectedCrop.droughtTolerance}
                </span>
              </div>

              {/* 4 Diagnostic Gauges */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-mono text-[#64748B] block mb-1">Elevation MSL</span>
                  <span className="font-space font-extrabold text-lg text-[#1E293B]">
                    {currentLocation.elevationMeters} meters
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">
                    {currentLocation.elevationMeters <= 5 ? 'Low-lying flood basin' : 'Moderate natural drainage'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-mono text-[#64748B] block mb-1">Waterbody Proximity</span>
                  <span className="font-space font-extrabold text-lg text-[#1E293B]">
                    {currentLocation.distanceToWaterbodyM} m
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Canal / River irrigation access
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-mono text-[#64748B] block mb-1">Soil Drainage Tier</span>
                  <span className="font-space font-extrabold text-lg text-[#1E293B]">
                    {farm.soilType.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    High clay retention (Waterlogging risk)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-mono text-[#64748B] block mb-1">Growth Stage Hazard</span>
                  <span className="font-space font-extrabold text-lg text-[#DC2626]">
                    {farm.stage.split('/')[0]}
                  </span>
                  <span className="text-[10px] text-[#DC2626] block mt-0.5">
                    High sensitivity to wind &amp; inundation
                  </span>
                </div>
              </div>

              {/* TNAU Mitigation Advisory */}
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-space font-bold text-[#166534]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>TNAU &amp; Department of Agriculture Advisory:</span>
                </div>
                <ul className="text-xs text-[#166534] space-y-1.5 list-disc list-inside">
                  {lossResult.mitigationSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Map & Parcel Pinning */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-space font-bold text-sm text-[#1E293B] mb-1">
                  Farm GIS Location
                </h4>
                <p className="text-xs text-[#64748B] mb-3">
                  Survey No: <strong>{farm.surveyNumber}</strong> • Lat {currentLocation.lat.toFixed(4)}°, Lng {currentLocation.lng.toFixed(4)}°
                </p>

                <div className="rounded-2xl overflow-hidden border border-[#CBD5E1] bg-slate-100 aspect-video relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"
                    alt="Farm aerial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex flex-col items-center justify-center text-white p-4 text-center">
                    <span className="material-symbols-outlined text-3xl text-emerald-400 mb-1">location_on</span>
                    <span className="text-xs font-bold font-space">{currentLocation.name}</span>
                    <span className="text-[10px] font-mono text-emerald-200">Cauvery Delta Cadastre</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenMap}
                className="w-full py-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Open in Interactive GIS Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB B: CALCULATE CROP LOSS */}
      {/* ======================================================== */}
      {activeTab === 'loss' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
                Interactive Crop Loss Calculator
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Model catastrophic yield reduction and financial damage based on disaster intensity and growth stage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-mono text-[#64748B] hover:text-[#059669] cursor-pointer"
            >
              &larr; Back to Cards
            </button>
          </div>

          {/* Severity Slider */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-space font-bold text-[#1E293B]">
                Disaster Event Severity Slider ({hazardType.toUpperCase()})
              </label>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                hazardSeverity >= 1.2 ? 'bg-red-100 text-red-700' : hazardSeverity >= 0.9 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {hazardSeverity >= 1.2 ? 'Extreme / 1-in-50 Year' : hazardSeverity >= 0.9 ? 'Severe / 1-in-10 Year' : 'Moderate Incident'}
              </span>
            </div>

            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.1}
              value={hazardSeverity}
              onChange={(e) => setHazardSeverity(parseFloat(e.target.value))}
              className="w-full accent-[#059669] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
              <span>Moderate Inundation (24h)</span>
              <span>Submerged 48h / Gale Winds 65 km/h</span>
              <span>Catastrophic Inundation (&gt;72h)</span>
            </div>
          </div>

          {/* Loss Calculation Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-mono text-[#64748B] uppercase block mb-1">Total Crop Asset Base</span>
              <div className="font-space font-extrabold text-2xl text-[#1E293B]">
                ₹{lossResult.exposedCropGrossValue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#64748B] block mt-1">
                {farm.acres} acres @ {selectedCrop.standardYieldPerAcre} {selectedCrop.yieldUnit}/acre
              </span>
            </div>

            <div className="bg-white border-2 border-red-200 bg-red-50/30 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-mono text-red-700 uppercase block mb-1">Projected Yield Loss</span>
              <div className="font-space font-extrabold text-3xl text-[#DC2626]">
                {lossResult.estimatedYieldLossPercent}%
              </div>
              <span className="text-[11px] text-red-600 block mt-1">
                Severity: {lossResult.impactSeverity}
              </span>
            </div>

            <div className="bg-white border-2 border-red-200 bg-red-50/30 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-mono text-red-700 uppercase block mb-1">Direct Crop Damage</span>
              <div className="font-space font-extrabold text-2xl text-[#DC2626]">
                ₹{lossResult.estimatedLossAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-red-600 block mt-1">
                Monetary harvest shortfall
              </span>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-mono text-[#059669] uppercase block mb-1">Salvageable Harvest</span>
              <div className="font-space font-extrabold text-2xl text-[#059669]">
                ₹{lossResult.salvageableValue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#64748B] block mt-1">
                With immediate de-watering
              </span>
            </div>
          </div>

          {/* Input Cost Breakdown Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-space font-bold text-base text-[#1E293B]">
              Cultivation Cost vs. Catastrophe Exposure
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] font-mono border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3">Cost Component</th>
                    <th className="p-3">Standard Cost / Acre</th>
                    <th className="p-3">Total for {farm.acres} Acres</th>
                    <th className="p-3">Loss Under Disaster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-sans">
                  <tr>
                    <td className="p-3 font-medium">Quality Seeds &amp; Nursery Raising</td>
                    <td className="p-3 font-mono">₹4,200</td>
                    <td className="p-3 font-mono">₹{(4200 * farm.acres).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-red-600">100% Sunk</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Tractor Puddling &amp; Land Preparation</td>
                    <td className="p-3 font-mono">₹6,800</td>
                    <td className="p-3 font-mono">₹{(6800 * farm.acres).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-red-600">100% Sunk</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Fertilizers, Micronutrients &amp; Bio-inputs</td>
                    <td className="p-3 font-mono">₹5,500</td>
                    <td className="p-3 font-mono">₹{(5500 * farm.acres).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-amber-600">Leached in runoff</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Transplanting &amp; Weeding Labor</td>
                    <td className="p-3 font-mono">₹5,500</td>
                    <td className="p-3 font-mono">₹{(5500 * farm.acres).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-red-600">Lost investment</td>
                  </tr>
                  <tr className="bg-[#F0FDF4] font-bold">
                    <td className="p-3 text-[#166534]">Total Input Capital Invested</td>
                    <td className="p-3 font-mono text-[#166534]">₹{selectedCrop.standardInputCostPerAcre.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-[#166534]">₹{lossResult.totalInputInvested.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-red-600">High Risk Exposure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('insurance')}
                className="px-5 py-2.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Protect This Loss with PMFBY Insurance</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB C: EXPLORE CROP INSURANCE (PMFBY) */}
      {/* ======================================================== */}
      {activeTab === 'insurance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
                Pradhan Mantri Fasal Bima Yojana (PMFBY)
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Government of Tamil Nadu Subsidized Crop Insurance Calculator for {selectedCrop.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-mono text-[#64748B] hover:text-[#059669] cursor-pointer"
            >
              &larr; Back to Cards
            </button>
          </div>

          {/* Big Subsidy Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#059669] text-white font-mono font-bold text-xs">
                  Government Subsidy Absorbs Up to 95%
                </span>
                <h3 className="font-space font-extrabold text-2xl text-[#1E293B] mt-2">
                  Total Protection: ₹{pmfbyResult.totalSumInsured.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Full coverage for your {farm.acres} acres against drought, flood, cyclones, and unseasonal rainfall.
                </p>
              </div>

              {/* Farmer Premium Big Callout */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm text-right">
                <span className="text-[11px] font-mono text-[#64748B] block">Farmer Pays Only (1.5% - 2%)</span>
                <span className="font-space font-black text-3xl text-[#059669]">
                  ₹{pmfbyResult.farmerPayablePremium.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 block font-semibold">
                  (Just ₹{Math.round(pmfbyResult.farmerPayablePremium / farm.acres).toLocaleString('en-IN')} per acre)
                </span>
              </div>
            </div>

            {/* Premium Subsidy Split Visual */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-[#059669]">Farmer Share: ₹{pmfbyResult.farmerPayablePremium.toLocaleString('en-IN')}</span>
                <span className="font-bold text-[#0D9488]">Govt Subsidy: ₹{pmfbyResult.totalGovernmentSubsidy.toLocaleString('en-IN')}</span>
              </div>

              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#059669] h-full"
                  style={{ width: `${(pmfbyResult.farmerPayablePremium / pmfbyResult.actualActuarialPremium) * 100}%` }}
                />
                <div
                  className="bg-[#0D9488] h-full"
                  style={{ width: `${(pmfbyResult.totalGovernmentSubsidy / pmfbyResult.actualActuarialPremium) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>Farmer ({selectedCrop.pmfbyPremiumRatePercent}%)</span>
                <span>TN State Govt (50%) + Central Govt (50%) covers the rest</span>
              </div>
            </div>

            {/* Scheme Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Sum Insured Per Acre</span>
                <span className="font-space font-bold text-sm text-[#1E293B]">
                  ₹{selectedCrop.pmfbySumInsuredPerAcre.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Insurer Cluster (TN)</span>
                <span className="font-space font-bold text-xs text-[#1E293B] truncate block">
                  AIC of India / IFFCO-TOKIO
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Enrollment Cutoff</span>
                <span className="font-space font-bold text-xs text-[#DC2626]">
                  {pmfbyResult.enrollmentCutoffDate.split('(')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* PMFBY Claim Guide & Checklist */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-space font-bold text-base text-[#1E293B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#059669]">checklist</span>
              <span>Documents Required for PMFBY Enrollment &amp; Claim Settlement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Adangal / Chitta (சிட்டா அடங்கல்)</strong>
                  <span className="text-[11px] text-[#64748B]">Land ownership record issued by Village Administrative Officer (VAO).</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Crop Sowing Certificate (விதைப்பு சான்று)</strong>
                  <span className="text-[11px] text-[#64748B]">Issued by VAO or Agricultural Officer confirming standing crop.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-xs text-[#1E293B] block">Bank Passbook Copy (வங்கி கணக்கு புத்தகம்)</strong>
                  <span className="text-[11px] text-[#64748B]">Aadhaar-linked bank account for Direct Benefit Transfer (DBT).</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-xs text-[#1E293B] block">72-Hour Disaster Intimation</strong>
                  <span className="text-[11px] text-[#64748B]">Inform toll-free 14447 or Agriculture Office within 72 hours of flood.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB D: VIEW FARM RISK REPORT */}
      {/* ======================================================== */}
      {activeTab === 'report' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
                Farm Risk Assessment &amp; Crop Intelligence Report
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Official certified summary for {farm.farmerName} • {farm.district} • {farm.acres} Acres.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-xs font-mono text-[#64748B] hover:text-[#059669] cursor-pointer"
              >
                &larr; Back to Cards
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-1.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs font-space font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Report Preview Sheet */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-3xl p-6 sm:p-8 shadow-md space-y-6 max-w-4xl mx-auto">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-600 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <span className="material-symbols-outlined text-2xl">eco</span>
                </div>
                <div>
                  <h3 className="font-space font-black text-lg text-[#1E293B] tracking-tight">
                    RISKLENS TN • FARM RISK ASSESSMENT CERTIFICATE
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Tamil Nadu Agricultural Catastrophe &amp; Crop Insurance Intelligence
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-[#64748B]">Report Ref:</span>
                <span className="font-bold text-[#059669] block">TN-AGRI-{Date.now().toString().slice(-6)}</span>
                <span className="text-[10px] text-[#94A3B8]">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Farm & Crop Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Farmer Name</span>
                <strong className="text-[#1E293B] font-space">{farm.farmerName}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Survey Number</span>
                <strong className="text-[#1E293B] font-mono">{farm.surveyNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">District / Taluk</span>
                <strong className="text-[#1E293B] font-space">{farm.district}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Farm Extent</span>
                <strong className="text-[#059669] font-space">{farm.acres} Acres</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Cultivated Crop</span>
                <strong className="text-[#1E293B]">{selectedCrop.name}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Season &amp; Stage</span>
                <strong className="text-[#1E293B]">{farm.season.split('(')[0]}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Soil &amp; Irrigation</span>
                <strong className="text-[#1E293B]">{farm.soilType.split(' ')[0]} / {farm.irrigationSource.split('/')[0]}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">Elevation</span>
                <strong className="text-[#1E293B] font-mono">{currentLocation.elevationMeters}m MSL</strong>
              </div>
            </div>

            {/* Catastrophe Simulation Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-space font-bold text-amber-900 uppercase">
                  Catastrophe Exposure ({hazardType.toUpperCase()})
                </span>
                <span className="text-xs font-mono font-bold text-red-600">
                  {lossResult.estimatedYieldLossPercent}% Yield Shortfall
                </span>
              </div>
              <p className="text-xs text-amber-950">
                {lossResult.advisorySummary}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono">
                <span>Crop Asset: <strong>₹{lossResult.exposedCropGrossValue.toLocaleString('en-IN')}</strong></span>
                <span className="text-red-700">Projected Damage: <strong>₹{lossResult.estimatedLossAmount.toLocaleString('en-IN')}</strong></span>
                <span className="text-emerald-700">Salvageable: <strong>₹{lossResult.salvageableValue.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            {/* PMFBY Protection Summary */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-space font-bold text-emerald-900 block">
                  PMFBY Crop Insurance Coverage
                </span>
                <span className="text-emerald-800">
                  Scale of Finance: <strong>₹{pmfbyResult.totalSumInsured.toLocaleString('en-IN')}</strong> • Farmer Share: <strong>₹{pmfbyResult.farmerPayablePremium.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 block">
                  Govt Subsidy: ₹{pmfbyResult.totalGovernmentSubsidy.toLocaleString('en-IN')} (95%)
                </span>
                <span className="text-[11px] text-emerald-600">
                  Estimated Claim Compensation: ₹{pmfbyResult.estimatedClaimCompensation.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Print and Download Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">
                Prepared via RiskLens TN Agronomic Intelligence Engine
              </span>
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-6 py-2.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print / Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
