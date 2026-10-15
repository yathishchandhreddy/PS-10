import React, { useState } from 'react';
import { DisasterType, LossEstimateResult, PropertyDetails, RiskAnalysisResult } from '../types';
import { calculatePropertyLoss, formatINR } from '../services/propertyLossEngine';

interface PropertyLossCalculatorProps {
  property: PropertyDetails;
  onChangeProperty: (updated: PropertyDetails) => void;
  disasterType: DisasterType;
  riskResult: RiskAnalysisResult;
  onProceedToInsurance: () => void;
}

export const PropertyLossCalculator: React.FC<PropertyLossCalculatorProps> = ({
  property,
  onChangeProperty,
  disasterType,
  riskResult,
  onProceedToInsurance,
}) => {
  const [useCustomRatio, setUseCustomRatio] = useState(false);
  const [customRatio, setCustomRatio] = useState(15);

  let lossResult: LossEstimateResult;
  try {
    lossResult = calculatePropertyLoss(
      property,
      disasterType,
      riskResult,
      useCustomRatio ? customRatio : undefined
    );
  } catch (err) {
    console.error(err);
    lossResult = {
      exposedAssetValue: property.propertyValue + property.contentsValue,
      structuralLoss: 0,
      contentsLoss: 0,
      totalEstimatedLoss: 0,
      damageRatioPercent: 0,
      isVerifiedDamageRatio: false,
      damageRatioSource: 'Calculation Error',
      methodologyNotes: ['Invalid input provided.'],
      uncertaintyNotes: [],
    };
  }

  const propertyTypes: PropertyDetails['propertyType'][] = [
    'Residential RCC',
    'Independent Villa',
    'Commercial Office',
    'Industrial Shed',
    'Semi-Pucca / Tiled',
  ];

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Context */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
            Step 4 of 6
          </span>
          <span className="text-[#64748B] font-mono text-xs font-medium">
            Physical Exposure &amp; Loss Estimation
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
          Property Loss Calculator
        </h2>
        <p className="text-xs text-[#64748B]">
          Quantify potential structural and contents damage for {riskResult.location.name} under {disasterType.toUpperCase()} conditions.
        </p>
      </div>

      {/* Main Grid: Inputs Left, Output Telemetry Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Inputs */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="font-space font-bold text-sm text-[#1E293B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#059669] text-[18px]">real_estate_agent</span>
              <span>Asset Valuation &amp; Engineering</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              User-Provided Data
            </span>
          </div>

          {/* Property Structure Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#64748B] font-medium">Building / Structure Value</label>
              <span className="font-space font-bold text-sm text-[#059669]">
                {formatINR(property.propertyValue)}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="250000"
              value={property.propertyValue}
              onChange={(e) =>
                onChangeProperty({ ...property, propertyValue: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#059669]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>₹5 Lakhs</span>
              <span>₹1 Crore</span>
              <span>₹2 Crores</span>
            </div>
          </div>

          {/* Contents Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#64748B] font-medium">Movable Contents &amp; Appliances</label>
              <span className="font-space font-bold text-sm text-[#0D9488]">
                {formatINR(property.contentsValue)}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="5000000"
              step="50000"
              value={property.contentsValue}
              onChange={(e) =>
                onChangeProperty({ ...property, contentsValue: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>₹1 Lakh</span>
              <span>₹25 Lakhs</span>
              <span>₹50 Lakhs</span>
            </div>
          </div>

          {/* Building Structural Construction Type */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#64748B] block font-medium">
              Structural Construction Framework
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {propertyTypes.map((type) => {
                const isSelected = property.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeProperty({ ...property, propertyType: type })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ECFDF5] border-[#059669] text-[#059669] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="truncate">{type}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plinth Height Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#64748B] font-medium">
                Finished Floor / Plinth Elevation above Road
              </label>
              <span className="font-mono font-bold text-xs text-[#0EA5E9]">
                +{property.plinthElevationCm} cm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={property.plinthElevationCm}
              onChange={(e) =>
                onChangeProperty({ ...property, plinthElevationCm: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
            />
            <span className="text-[10px] text-[#94A3B8] block">
              Standard recommendations suggest &gt;60cm in flood-prone basins to avoid ground water ingress.
            </span>
          </div>

          {/* Custom Damage Ratio Toggle */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#1E293B] font-medium">
                Configure Custom Illustrative Scenario?
              </span>
              <button
                type="button"
                onClick={() => setUseCustomRatio(!useCustomRatio)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  useCustomRatio ? 'bg-[#059669]' : 'bg-[#CBD5E1]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    useCustomRatio ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {useCustomRatio && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#64748B]">Custom Damage Ratio:</span>
                  <span className="text-[#DC2626] font-bold">{customRatio}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  step="1"
                  value={customRatio}
                  onChange={(e) => setCustomRatio(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#DC2626]"
                />
                <span className="text-[10px] text-[#DC2626] block font-mono">
                  * Explicitly labeled as User Scenario Assumption
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Computed Loss Result */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-mono text-[11px] uppercase font-bold tracking-wider">
                  Estimated Potential Loss
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] font-mono text-[10px] font-semibold">
                  Modeled Impact
                </span>
              </div>

              {/* Total Loss Display */}
              <div>
                <div className="font-space font-extrabold text-3xl sm:text-4xl text-[#DC2626]">
                  {formatINR(lossResult.totalEstimatedLoss)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B]">
                  <span className="font-mono text-[#1E293B] font-semibold">
                    Damage Ratio: {lossResult.damageRatioPercent}%
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    of {formatINR(lossResult.exposedAssetValue)} Total
                  </span>
                </div>
              </div>

              {/* Sub-loss breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0]">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] font-mono text-[#64748B] block">Structural Loss</span>
                  <span className="font-space font-bold text-sm text-[#1E293B] mt-0.5 block">
                    {formatINR(lossResult.structuralLoss)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] font-mono text-[#64748B] block">Contents Loss</span>
                  <span className="font-space font-bold text-sm text-[#0D9488] mt-0.5 block">
                    {formatINR(lossResult.contentsLoss)}
                  </span>
                </div>
              </div>

              {/* Methodology Explanation Box */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                <div className="font-mono font-bold text-[#059669] text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">function</span>
                  <span>Formula: Estimated Loss = Asset Value × Damage Ratio</span>
                </div>
                <ul className="space-y-1 text-[11px] text-[#64748B] list-disc list-inside">
                  <li>Damage ratio source: {lossResult.damageRatioSource}</li>
                  <li>Factor in {property.plinthElevationCm}cm plinth barrier discount</li>
                </ul>
              </div>

              {/* Uncertainty Warning */}
              <div className="p-3 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] text-[11px] text-[#DC2626] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">report_problem</span>
                <div>
                  <strong>Non-Prediction Notice:</strong> This represents a scenario-based mathematical stress-test, NOT an empirical forecast of future property loss.
                </div>
              </div>
            </div>

            {/* Next CTA */}
            <div className="pt-5">
              <button
                type="button"
                onClick={onProceedToInsurance}
                className="w-full py-3.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue to Insurance Pricing (Step 5)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
