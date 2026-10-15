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
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
            Step 5 of 6
          </span>
          <span className="text-[#64748B] font-mono text-xs font-medium">
            Indicative Insurance Pricing Engine
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
          Catastrophe Insurance Pricing
        </h2>
        <p className="text-xs text-[#64748B]">
          Transparent actuarial formula benchmarked against IRDAI peril schedules.
        </p>
      </div>

      {/* Main Pricing Hero Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#0D9488]/5 via-[#059669]/5 to-transparent blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="font-space font-bold text-sm text-[#1E293B]">
              Actuarial Tariff Simulator
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] font-mono text-xs font-semibold">
            Illustrative Non-Binding Model
          </span>
        </div>

        {/* The Transparent Formula Banner */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block font-semibold">
            Governing Underwriting Formula
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#059669] font-bold break-words">
            Indicative Premium = Insured Amount × Base Rate × Risk Adjustment Factor
          </div>
          <div className="text-[11px] text-[#64748B] font-mono">
            {formatINR(insuranceResult.insuredAmount)} × {insuranceResult.baseRatePercent}% × {insuranceResult.riskAdjustmentFactor}x = {formatINR(insuranceResult.indicativeAnnualPremium)} / yr
          </div>
        </div>

        {/* Three Formula Components Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-mono text-[#64748B] block font-medium">1. Insured Amount</span>
            <span className="font-space font-bold text-lg text-[#1E293B] mt-1 block">
              {formatINR(insuranceResult.insuredAmount)}
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 block">
              Structure + Declared Contents
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-mono text-[#64748B] block font-medium">2. Configured Base Rate</span>
            <span className="font-space font-bold text-lg text-[#0EA5E9] mt-1 block">
              {insuranceResult.baseRatePercent}%
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 block">
              Standard {disasterType.toUpperCase()} Tariff Benchmark
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[11px] font-mono text-[#64748B] block font-medium">3. Risk Adjustment Factor</span>
            <span className="font-space font-bold text-lg text-[#0D9488] mt-1 block">
              {insuranceResult.riskAdjustmentFactor}x
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 block">
              Scaled from Score {riskResult.vulnerabilityIndex}/100
            </span>
          </div>
        </div>

        {/* Premium Breakdown & Deductible Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Deductible Slider */}
          <div className="space-y-3 bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[#1E293B]">
                Policy Deductible Selection
              </label>
              <span className="font-mono text-xs font-bold text-[#059669]">
                {deductiblePercent}% ({formatINR(insuranceResult.deductibleAmount)})
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              The insured co-payment retained before insurer indemnification begins.
            </p>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={deductiblePercent}
              onChange={(e) => setDeductiblePercent(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#059669]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>2% (Min)</span>
              <span>5% (Standard)</span>
              <span>15% (Max)</span>
            </div>
          </div>

          {/* Computed Premium Summary Display */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block font-semibold">
                Total Indicative Annual Cost
              </span>
              <div className="font-space font-extrabold text-3xl text-[#059669] mt-1">
                {formatINR(insuranceResult.totalIndicativePayable)}
                <span className="text-xs font-normal text-[#64748B] ml-1.5 font-mono">/ year</span>
              </div>
              <div className="text-xs text-[#64748B] mt-1 font-mono">
                Net Premium: {formatINR(insuranceResult.indicativeAnnualPremium)} + 18% GST: {formatINR(insuranceResult.gstAmount)}
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#DCFCE7]">
              Underwriting class: {property.propertyType} in {riskResult.location.district}
            </div>
          </div>
        </div>

        {/* Storefront Policy Add-On Checklist */}
        <div className="space-y-3 pt-2">
          <span className="font-space font-bold text-sm text-[#1E293B] block">
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
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[#059669] text-[20px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <div className="font-semibold text-xs text-[#1E293B]">{addon.title}</div>
                  <div className="text-[10px] font-mono text-[#0D9488] font-medium mt-0.5">{addon.status}</div>
                  <div className="text-[11px] text-[#64748B] mt-1">{addon.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Warning Box */}
        <div className="p-4 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] flex items-start gap-3 text-xs text-[#DC2626]">
          <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">verified_user</span>
          <div className="space-y-1">
            <strong className="block text-[#1E293B] font-space">
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
            className="w-full h-14 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-base flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            <span>View Prevention &amp; Safety (Step 6)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="w-full h-14 rounded-full bg-white hover:bg-[#F8FAFC] text-[#1E293B] font-space font-semibold text-sm flex items-center justify-center space-x-2 border border-[#CBD5E1] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[#059669] text-[20px]">picture_as_pdf</span>
            <span>Download Insurance Pricing Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
