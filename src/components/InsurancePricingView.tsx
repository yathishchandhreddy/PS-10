import React, { useState } from 'react';
import { DisasterType, LossEstimateResult, PropertyDetails, RiskAnalysisResult } from '../types';
import { computeIndicativeInsurance } from '../services/insuranceEngine';
import { formatINR } from '../services/propertyLossEngine';

interface InsurancePricingViewProps {
  property: PropertyDetails;
  disasterType: DisasterType;
  riskResult: RiskAnalysisResult;
  lossResult?: LossEstimateResult;
  onExploreRecommendations: () => void;
  onDownloadReport: () => void;
}

export const InsurancePricingView: React.FC<InsurancePricingViewProps> = ({
  property,
  disasterType,
  riskResult,
  lossResult,
  onExploreRecommendations,
  onDownloadReport,
}) => {
  const [deductiblePercent, setDeductiblePercent] = useState(5);
  const totalSumInsured = property.propertyValue + property.contentsValue;

  const insuranceResult = computeIndicativeInsurance({
    propertyValue: property.propertyValue,
    insuredAmount: totalSumInsured,
    propertyType: property.propertyType,
    disasterScenario: disasterType,
    riskResult,
    deductiblePercent,
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Context */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#4cd7f6]/20">
            Step 5 of 6
          </span>
          <span className="text-[#bcc9cd] font-mono text-xs">
            Indicative Insurance Pricing Engine
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl text-white">
          Catastrophe Insurance Pricing
        </h2>
        <p className="text-xs text-[#bcc9cd]">
          Transparent actuarial formula benchmarked against IRDAI peril schedules.
        </p>
      </div>

      {/* Main Pricing Hero Card */}
      <div className="bg-[#161b2a] border border-[#303444] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#4fdbc8]/10 via-[#4cd7f6]/5 to-transparent blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252a39] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4fdbc8] animate-pulse" />
            <span className="font-space font-bold text-sm text-white">
              Actuarial Tariff Simulator
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#d0bcff]/15 text-[#d0bcff] border border-[#d0bcff]/30 font-mono text-xs font-semibold">
            Illustrative Non-Binding Model
          </span>
        </div>

        {/* The Transparent Formula Banner */}
        <div className="p-4 rounded-2xl bg-[#090e1c] border border-[#252a39] space-y-2">
          <span className="text-[11px] font-mono text-[#869397] uppercase tracking-wider block">
            Governing Underwriting Formula
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#4cd7f6] font-semibold break-words">
            Indicative Premium = Insured Amount × Base Rate × Risk Adjustment Factor
          </div>
          <div className="text-[11px] text-[#bcc9cd] font-mono">
            {formatINR(insuranceResult.insuredAmount)} × {insuranceResult.baseRatePercent}% × {insuranceResult.riskAdjustmentFactor}x = {formatINR(insuranceResult.indicativeAnnualPremium)} / yr
          </div>
        </div>

        {/* Three Formula Components Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#1a1f2e] border border-[#252a39]">
            <span className="text-[11px] font-mono text-[#869397] block">1. Insured Amount</span>
            <span className="font-space font-bold text-lg text-white mt-1 block">
              {formatINR(insuranceResult.insuredAmount)}
            </span>
            <span className="text-[10px] text-[#bcc9cd] mt-0.5 block">
              Structure + Declared Contents
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1f2e] border border-[#252a39]">
            <span className="text-[11px] font-mono text-[#869397] block">2. Configured Base Rate</span>
            <span className="font-space font-bold text-lg text-[#4cd7f6] mt-1 block">
              {insuranceResult.baseRatePercent}%
            </span>
            <span className="text-[10px] text-[#bcc9cd] mt-0.5 block">
              Standard {disasterType.toUpperCase()} Tariff Benchmark
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1f2e] border border-[#252a39]">
            <span className="text-[11px] font-mono text-[#869397] block">3. Risk Adjustment Factor</span>
            <span className="font-space font-bold text-lg text-[#4fdbc8] mt-1 block">
              {insuranceResult.riskAdjustmentFactor}x
            </span>
            <span className="text-[10px] text-[#bcc9cd] mt-0.5 block">
              Scaled from Score {riskResult.vulnerabilityIndex}/100
            </span>
          </div>
        </div>

        {/* Premium Breakdown & Deductible Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Deductible Slider */}
          <div className="space-y-3 bg-[#1a1f2e] p-5 rounded-2xl border border-[#252a39]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white">
                Policy Deductible Selection
              </label>
              <span className="font-mono text-xs font-bold text-[#4cd7f6]">
                {deductiblePercent}% ({formatINR(insuranceResult.deductibleAmount)})
              </span>
            </div>
            <p className="text-[11px] text-[#bcc9cd]">
              The insured co-payment retained before insurer indemnification begins.
            </p>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={deductiblePercent}
              onChange={(e) => setDeductiblePercent(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#252a39] rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#869397]">
              <span>2% (Min)</span>
              <span>5% (Standard)</span>
              <span>15% (Max)</span>
            </div>
          </div>

          {/* Computed Premium Summary Display */}
          <div className="p-5 rounded-2xl bg-[#090e1c] border border-[#303444] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono text-[#869397] uppercase tracking-wider block">
                Total Indicative Annual Cost
              </span>
              <div className="font-space font-extrabold text-3xl text-[#4fdbc8] mt-1">
                {formatINR(insuranceResult.totalIndicativePayable)}
                <span className="text-xs font-normal text-[#bcc9cd] ml-1.5 font-mono">/ year</span>
              </div>
              <div className="text-xs text-[#bcc9cd] mt-1 font-mono">
                Net Premium: {formatINR(insuranceResult.indicativeAnnualPremium)} + 18% GST: {formatINR(insuranceResult.gstAmount)}
              </div>
            </div>

            <div className="text-[11px] text-[#869397] pt-2 border-t border-[#252a39]">
              Underwriting class: {property.propertyType} in {riskResult.location.district}
            </div>
          </div>
        </div>

        {/* Storefront Policy Add-On Checklist */}
        <div className="space-y-3 pt-2">
          <span className="font-space font-bold text-sm text-white block">
            Mandatory Catastrophe Clauses to Verify with Underwriter
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                title: 'STFI (Storm, Tempest, Flood & Inundation)',
                status: 'Essential Endorsement',
                desc: 'Confirm flood water backup through domestic drains is not excluded.',
              },
              {
                title: 'Basement Storage Rider',
                status: 'Specific Declaration',
                desc: 'Electrical boards and vehicles parked in basements require explicit endorsement.',
              },
              {
                title: 'IS 1893 Earthquake Fire & Shock',
                status: 'Seismic Endorsement',
                desc: 'Protects against structural cracking and earthquake-triggered domestic fire.',
              },
              {
                title: 'Debris Removal & Escalation Clause',
                status: 'Cost Coverage',
                desc: 'Covers municipal debris clearing and post-disaster materials cost spikes.',
              },
            ].map((addon) => (
              <div
                key={addon.title}
                className="p-3.5 rounded-2xl bg-[#1a1f2e] border border-[#252a39] flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[#4fdbc8] text-[20px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <div className="font-semibold text-xs text-white">{addon.title}</div>
                  <div className="text-[10px] font-mono text-[#4cd7f6] mt-0.5">{addon.status}</div>
                  <div className="text-[11px] text-[#bcc9cd] mt-1">{addon.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Warning Box */}
        <div className="p-4 rounded-2xl bg-[#93000a]/15 border border-[#ffb4ab]/30 flex items-start gap-3 text-xs text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">verified_user</span>
          <div className="space-y-1">
            <strong className="block text-white font-space">
              Statutory Transparency &amp; Non-Quotation Notice:
            </strong>
            <p className="leading-relaxed">
              {insuranceResult.disclaimer}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onExploreRecommendations}
            className="w-full h-14 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#04b4a2] hover:brightness-110 text-[#003640] font-space font-bold text-base flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            <span>View Prevention &amp; Safety (Step 6)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="w-full h-14 rounded-full bg-[#1a1f2e] hover:bg-[#252a39] text-[#dee2f6] font-space font-semibold text-sm flex items-center justify-center space-x-2 border border-[#303444] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">picture_as_pdf</span>
            <span>Download Insurance Pricing Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
