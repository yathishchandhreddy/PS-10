import React, { useState } from 'react';
import { RiskAnalysisResult } from '../types';

interface RiskSummaryViewProps {
  riskResult: RiskAnalysisResult;
  onEstimateLoss: () => void;
  onExploreInsurance: () => void;
  onDownloadPdf: () => void;
}

export const RiskSummaryView: React.FC<RiskSummaryViewProps> = ({
  riskResult,
  onEstimateLoss,
  onExploreInsurance,
  onDownloadPdf,
}) => {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const score = riskResult.vulnerabilityIndex;
  const circumference = 314.159;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let badgeBgClass = 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
  if (score >= 70) {
    badgeBgClass = 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
  } else if (score >= 45) {
    badgeBgClass = 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Step & Location Header Context */}
      <div className="flex flex-col space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
              Step 3 of 6
            </span>
            <span className="text-[#64748B] font-mono text-xs font-medium">
              Risk Summary &amp; Impact
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#0D9488] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            Live Computed
          </span>
        </div>

        {/* Location Bar */}
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="material-symbols-outlined text-[#0D9488] text-[22px] flex-shrink-0">
              location_on
            </span>
            <span className="text-[#1E293B] font-space font-bold text-base sm:text-lg truncate">
              {riskResult.location.name}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#059669] text-[16px]">
              {riskResult.disasterType === 'flood' ? 'flood' : riskResult.disasterType === 'cyclone' ? 'air' : 'earthquake'}
            </span>
            <span className="text-[#64748B] font-mono text-[11px] font-medium capitalize">
              {riskResult.disasterType} Hazard
            </span>
          </div>
        </div>
      </div>

      {/* Primary Risk Gauge Card */}
      <div className="relative bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col items-center">
        {/* Soft emerald ambient glow */}
        <div className="absolute -top-12 inset-x-0 h-32 bg-gradient-to-b from-[#059669]/10 via-[#0D9488]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="w-full flex items-center justify-between z-10 mb-2">
          <span className="text-[#64748B] font-mono text-[11px] uppercase tracking-wider font-semibold">
            Computed Vulnerability Index
          </span>
          <div className="flex items-center gap-1 bg-[#ECFDF5] px-2.5 py-0.5 rounded-full text-[#059669] border border-[#A7F3D0]">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span className="font-mono text-[11px] font-semibold text-[#059669]">Verified Grid</span>
          </div>
        </div>

        {/* Circular Gauge & Score */}
        <div className="relative w-48 h-48 flex items-center justify-center my-3 z-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              className="text-[#E2E8F0]"
              cx="60"
              cy="60"
              fill="transparent"
              r="50"
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="riskGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <circle
              className="transition-all duration-1000 ease-out"
              cx="60"
              cy="60"
              fill="transparent"
              r="50"
              stroke="url(#riskGradientLight)"
              strokeDasharray="314.159"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>

          {/* Center Telemetry Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline justify-center">
              <span className="font-space font-extrabold text-4xl text-[#1E293B] tracking-tighter">
                {score}
              </span>
              <span className="text-[#64748B] font-mono text-sm ml-0.5 font-medium">/100</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide mt-1.5 border ${badgeBgClass}`}>
              {riskResult.riskCategory}
            </span>
          </div>
        </div>

        <p className="text-[#64748B] text-xs sm:text-sm text-center max-w-sm z-10 leading-relaxed mt-1">
          {riskResult.summaryText}
        </p>

        {/* Data Confidence Badge */}
        <div className="mt-5 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-2.5 flex items-center justify-center gap-2 z-10">
          <span className="material-symbols-outlined text-[#059669] text-[18px]">verified_user</span>
          <span className="text-[#1E293B] font-mono text-xs text-center font-medium">
            {riskResult.confidenceDetail}
          </span>
        </div>
      </div>

      {/* Key Contributing Factors Bento List */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[#1E293B] font-space font-bold text-base">Primary Drivers</span>
          <span className="text-[#64748B] font-mono text-[11px]">
            {riskResult.contributingFactors.length} Site Attributes
          </span>
        </div>

        {riskResult.contributingFactors.map((factor) => {
          let badgeColor = 'text-[#0D9488] border-[#99F6E4] bg-[#CCFBF1]';
          if (factor.impactLevel === 'Critical Zone' || factor.impactLevel === 'High Impact') {
            badgeColor = 'text-[#DC2626] border-[#FECACA] bg-[#FEE2E2]';
          }

          return (
            <div
              key={factor.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-start space-x-3.5 shadow-xs hover:border-[#CBD5E1] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#059669]">
                <span className="material-symbols-outlined text-[20px]">{factor.icon}</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-space font-bold text-sm text-[#1E293B]">{factor.name}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {factor.impactLevel}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {factor.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#94A3B8]">
                  <span>Metric: <strong className="text-[#1E293B]">{factor.verifiedValue}</strong></span>
                  <span>·</span>
                  <span>Source: {factor.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Open Methodology Accordion */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-[#059669] text-[20px]">psychology_alt</span>
            <span className="font-space font-bold text-sm text-[#1E293B]">How did we calculate this?</span>
          </div>
          <span
            className={`material-symbols-outlined text-[#64748B] transition-transform duration-300 ${
              isMethodologyOpen ? 'rotate-180 text-[#059669]' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isMethodologyOpen && (
          <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-[#E2E8F0] text-xs">
            <p className="text-[#64748B] leading-relaxed">
              RiskLens aggregates multi-decade state records to evaluate hyper-local structural exposures without proprietary black-boxes:
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0D9488] text-[18px] flex-shrink-0 mt-0.5">query_stats</span>
                <div className="text-[#64748B]">
                  <strong className="text-[#1E293B]">Historical Precipitation:</strong> Modeled over 50 years of IMD coastal cyclone intensity and cloudburst clusters.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#059669] text-[18px] flex-shrink-0 mt-0.5">terrain</span>
                <div className="text-[#64748B]">
                  <strong className="text-[#1E293B]">Elevation Differential:</strong> 10m-resolution CartoDEM terrain meshes highlighting natural accumulation sinks.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0EA5E9] text-[18px] flex-shrink-0 mt-0.5">engineering</span>
                <div className="text-[#64748B]">
                  <strong className="text-[#1E293B]">Drainage Network Capacity:</strong> Municipal canal outflows and marsh discharge capacity ratings during peak high-tide locks.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#94A3B8]">
              Model Version: {riskResult.modelVersion} · Calculated: {new Date(riskResult.calculatedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Action CTAs */}
      <div className="flex flex-col space-y-3 pt-2">
        <button
          type="button"
          onClick={onEstimateLoss}
          className="w-full h-14 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-base flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">currency_rupee</span>
          <span>Estimate Property Loss</span>
        </button>

        <button
          type="button"
          onClick={onExploreInsurance}
          className="w-full h-12 rounded-full bg-white hover:bg-[#F8FAFC] text-[#1E293B] font-space font-semibold text-sm flex items-center justify-center space-x-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer border border-[#CBD5E1]"
        >
          <span className="material-symbols-outlined text-[#0D9488] text-[20px]">shield</span>
          <span>Explore Protection &amp; Insurance</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="w-full h-12 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] font-space font-medium text-sm flex items-center justify-center space-x-2 border border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>Download Risk Summary PDF</span>
        </button>
      </div>
    </div>
  );
};
