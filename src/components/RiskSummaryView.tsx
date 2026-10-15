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

  // SVG Gauge calculations (circumference for r=50 is 2 * PI * 50 = 314.159)
  const score = riskResult.vulnerabilityIndex;
  const circumference = 314.159;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color mapping based on score
  let scoreColorClass = 'text-[#4fdbc8]';
  let badgeBgClass = 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
  if (score >= 70) {
    scoreColorClass = 'text-[#ffb4ab]';
    badgeBgClass = 'bg-[#93000a]/40 text-[#ffb4ab] border-[#ffb4ab]/30';
  } else if (score >= 45) {
    scoreColorClass = 'text-[#f59e0b]';
    badgeBgClass = 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30';
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Step & Location Header Context */}
      <div className="flex flex-col space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#4cd7f6]/20">
              Step 3 of 6
            </span>
            <span className="text-[#bcc9cd] font-mono text-xs">
              Risk Summary &amp; Impact
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#4fdbc8]">
            <span className="w-2 h-2 rounded-full bg-[#4fdbc8] animate-pulse" />
            Live Computed
          </span>
        </div>

        {/* Location Bar */}
        <div className="w-full bg-[#161b2a] border border-[#252a39] rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px] flex-shrink-0">
              location_on
            </span>
            <span className="text-white font-space font-bold text-base sm:text-lg truncate">
              {riskResult.location.name}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0 bg-[#1a1f2e] border border-[#303444] px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">
              {riskResult.disasterType === 'flood' ? 'flood' : riskResult.disasterType === 'cyclone' ? 'air' : 'earthquake'}
            </span>
            <span className="text-[#bcc9cd] font-mono text-[11px] capitalize">
              {riskResult.disasterType} Hazard
            </span>
          </div>
        </div>
      </div>

      {/* Primary Risk Gauge Card (Faithful to Stitch UI) */}
      <div className="relative bg-[#1a1f2e] border border-[#303444] rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Ambient back glow */}
        <div className="absolute -top-12 inset-x-0 h-32 bg-gradient-to-b from-[#4cd7f6]/15 via-[#ffb4ab]/10 to-transparent blur-2xl pointer-events-none" />

        <div className="w-full flex items-center justify-between z-10 mb-2">
          <span className="text-[#bcc9cd] font-mono text-[11px] uppercase tracking-wider font-semibold">
            Computed Vulnerability Index
          </span>
          <div className="flex items-center gap-1 bg-[#252a39] px-2.5 py-0.5 rounded-full text-[#4fdbc8] border border-[#4fdbc8]/30">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span className="font-mono text-[11px] font-semibold text-[#71f8e4]">Verified Grid</span>
          </div>
        </div>

        {/* Circular Gauge & Score */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2 z-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              className="text-[#303444]/40"
              cx="60"
              cy="60"
              fill="transparent"
              r="50"
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Glowing gradient track */}
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4fdbc8" />
                <stop offset="45%" stopColor="#4cd7f6" />
                <stop offset="100%" stopColor="#ffb4ab" />
              </linearGradient>
            </defs>
            {/* Dynamic stroke-dashoffset */}
            <circle
              className="transition-all duration-1000 ease-out"
              cx="60"
              cy="60"
              fill="transparent"
              r="50"
              stroke="url(#riskGradient)"
              strokeDasharray="314.159"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>

          {/* Center Telemetry Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline justify-center">
              <span className="font-space font-extrabold text-4xl text-white tracking-tighter">
                {score}
              </span>
              <span className="text-[#bcc9cd] font-mono text-sm ml-0.5">/100</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide mt-1.5 border ${badgeBgClass}`}>
              {riskResult.riskCategory}
            </span>
          </div>
        </div>

        <p className="text-[#bcc9cd] text-xs sm:text-sm text-center max-w-sm z-10 leading-relaxed mt-1">
          {riskResult.summaryText}
        </p>

        {/* Data Confidence Badge */}
        <div className="mt-5 w-full bg-[#252a39]/70 border border-[#303444] rounded-2xl p-2.5 flex items-center justify-center gap-2 z-10">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">verified_user</span>
          <span className="text-[#dee2f6] font-mono text-xs text-center font-medium">
            {riskResult.confidenceDetail}
          </span>
        </div>
      </div>

      {/* Key Contributing Factors Bento List */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-white font-space font-bold text-base">Primary Drivers</span>
          <span className="text-[#bcc9cd] font-mono text-[11px]">
            {riskResult.contributingFactors.length} Site Attributes
          </span>
        </div>

        {riskResult.contributingFactors.map((factor) => {
          let badgeColor = 'text-[#4fdbc8] border-[#4fdbc8]/30 bg-[#4fdbc8]/10';
          if (factor.impactLevel === 'Critical Zone' || factor.impactLevel === 'High Impact') {
            badgeColor = 'text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#93000a]/30';
          }

          return (
            <div
              key={factor.id}
              className="bg-[#161b2a] border border-[#252a39] rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm hover:border-[#303444] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a1f2e] border border-[#303444] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#4cd7f6]">
                <span className="material-symbols-outlined text-[20px]">{factor.icon}</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-space font-bold text-sm text-white">{factor.name}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {factor.impactLevel}
                  </span>
                </div>
                <p className="text-xs text-[#bcc9cd] mt-1 leading-relaxed">
                  {factor.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#869397]">
                  <span>Metric: <strong className="text-[#dee2f6]">{factor.verifiedValue}</strong></span>
                  <span>·</span>
                  <span>Source: {factor.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Open Methodology Accordion */}
      <div className="bg-[#161b2a] border border-[#252a39] rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a1f2e] transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">psychology_alt</span>
            <span className="font-space font-bold text-sm text-white">How did we calculate this?</span>
          </div>
          <span
            className={`material-symbols-outlined text-[#869397] transition-transform duration-300 ${
              isMethodologyOpen ? 'rotate-180 text-[#4cd7f6]' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isMethodologyOpen && (
          <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-[#252a39] text-xs">
            <p className="text-[#bcc9cd] leading-relaxed">
              RiskLens aggregates multi-decade state records to evaluate hyper-local structural exposures without proprietary black-boxes:
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#4fdbc8] text-[18px] flex-shrink-0 mt-0.5">query_stats</span>
                <div className="text-[#bcc9cd]">
                  <strong className="text-white">Historical Precipitation:</strong> Modeled over 50 years of IMD coastal cyclone intensity and cloudburst clusters.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px] flex-shrink-0 mt-0.5">terrain</span>
                <div className="text-[#bcc9cd]">
                  <strong className="text-white">Elevation Differential:</strong> 10m-resolution CartoDEM terrain meshes highlighting natural accumulation sinks.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px] flex-shrink-0 mt-0.5">engineering</span>
                <div className="text-[#bcc9cd]">
                  <strong className="text-white">Drainage Network Capacity:</strong> Municipal canal outflows and marsh discharge capacity ratings during peak high-tide locks.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#252a39] text-[11px] text-[#869397]">
              Model Version: {riskResult.modelVersion} · Calculated: {new Date(riskResult.calculatedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Action CTAs (Exact matching Stitch style) */}
      <div className="flex flex-col space-y-3 pt-2">
        {/* Primary Loss Estimator */}
        <button
          type="button"
          onClick={onEstimateLoss}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#04b4a2] hover:from-[#4cd7f6] hover:to-[#4fdbc8] text-[#003640] font-space font-bold text-base flex items-center justify-center space-x-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">currency_rupee</span>
          <span>Estimate Property Loss</span>
        </button>

        {/* Secondary Coverage CTA */}
        <button
          type="button"
          onClick={onExploreInsurance}
          className="w-full h-12 rounded-full bg-[#252a39] hover:bg-[#303444] text-[#dee2f6] hover:text-white font-space font-semibold text-sm flex items-center justify-center space-x-2 shadow-md active:scale-[0.99] transition-all cursor-pointer border border-[#303444]"
        >
          <span className="material-symbols-outlined text-[#4fdbc8] text-[20px]">shield</span>
          <span>Explore Protection &amp; Insurance</span>
        </button>

        {/* Outline PDF Download */}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="w-full h-12 rounded-full bg-[#161b2a] hover:bg-[#1a1f2e] text-[#bcc9cd] hover:text-white font-space font-medium text-sm flex items-center justify-center space-x-2 border border-[#303444] active:bg-[#1a1f2e] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>Download Risk Summary PDF</span>
        </button>
      </div>
    </div>
  );
};
