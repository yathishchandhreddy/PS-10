import React, { useState } from 'react';
import { DisasterType, RiskAnalysisResult } from '../types';
import { getDisasterRecommendations } from '../services/recommendations';

interface RecommendationsViewProps {
  disasterType: DisasterType;
  riskResult: RiskAnalysisResult;
  onDownloadRiskPdf: () => void;
  onDownloadInsurancePdf: () => void;
  onStartNewSearch: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  disasterType,
  riskResult,
  onDownloadRiskPdf,
  onDownloadInsurancePdf,
  onStartNewSearch,
}) => {
  const { recommendations, emergencyContacts, shelterNotice, officialPortals } =
    getDisasterRecommendations(disasterType, riskResult);

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Structural Protection',
    'Emergency Preparedness',
    'Vital Documents',
    'Insurance Underwriting Checklist',
  ];

  const filteredRecs =
    activeCategory === 'All'
      ? recommendations
      : recommendations.filter((r) => r.category === activeCategory);

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Context */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#4cd7f6]/20">
            Step 6 of 6
          </span>
          <span className="text-[#bcc9cd] font-mono text-xs">
            Prevention, Preparedness &amp; Official Directives
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl text-white">
          Prevention Recommendations &amp; Safety
        </h2>
        <p className="text-xs text-[#bcc9cd]">
          Tailored resilience guidance for {riskResult.location.name} against {disasterType.toUpperCase()} hazards.
        </p>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="bg-[#161b2a] border border-[#ffb4ab]/30 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ffb4ab]">
            <span className="material-symbols-outlined text-[20px] animate-pulse">crisis_alert</span>
            <span className="font-space font-bold text-sm text-white">
              Official Verified Emergency Contacts
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#ffb4ab] border border-[#ffb4ab]/40 px-2 py-0.5 rounded-full bg-[#93000a]/20">
            24x7 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.number}
              href={`tel:${contact.number}`}
              className="p-3 rounded-2xl bg-[#090e1c] border border-[#252a39] hover:border-[#4cd7f6] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-semibold text-white group-hover:text-[#4cd7f6] transition-colors block">
                  {contact.name}
                </span>
                <span className="text-[10px] text-[#869397] mt-0.5 block">{contact.role}</span>
              </div>
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#1a1f2e]">
                <span className="text-sm font-space font-extrabold text-[#4cd7f6]">
                  {contact.number}
                </span>
                <span className="material-symbols-outlined text-xs text-[#4cd7f6] group-hover:translate-x-0.5 transition-transform">
                  call
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Strict Truth In Shelters Notice */}
      <div className="p-4 rounded-3xl bg-[#161b2a] border border-[#4fdbc8]/30 flex items-start gap-3 shadow-sm">
        <span className="material-symbols-outlined text-[#4fdbc8] text-[22px] flex-shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-1">
          <strong className="text-white font-space text-xs sm:text-sm block">
            Government Shelter Activation Protocol
          </strong>
          <p className="text-xs text-[#bcc9cd] leading-relaxed">
            {shelterNotice}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-space whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#4cd7f6] text-[#003640] font-bold shadow-[0_0_12px_rgba(76,215,246,0.4)]'
                  : 'bg-[#161b2a] text-[#bcc9cd] hover:text-white border border-[#252a39]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-3">
        {filteredRecs.map((rec, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-[#161b2a] border border-[#252a39] hover:border-[#303444] transition-colors space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-space font-bold text-sm sm:text-base text-white">
                {rec.title}
              </span>
              <div className="flex items-center gap-1.5">
                {rec.isLocationSpecific && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/30">
                    Location-Specific
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#252a39] text-[#bcc9cd]">
                  {rec.priority}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#bcc9cd] leading-relaxed">
              {rec.action}
            </p>
          </div>
        ))}
      </div>

      {/* Official Government Portals */}
      <div className="p-5 rounded-3xl bg-[#161b2a] border border-[#252a39] space-y-3">
        <span className="font-space font-bold text-xs uppercase tracking-wider text-[#869397] block">
          Official Government Disaster Portals
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {officialPortals.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noreferrer noopener"
              className="p-3 rounded-2xl bg-[#090e1c] border border-[#252a39] hover:border-[#4cd7f6] flex items-center justify-between group transition-colors"
            >
              <span className="text-xs font-semibold text-[#dee2f6] group-hover:text-white truncate">
                {portal.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#4cd7f6] flex-shrink-0 ml-1">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Final Action Hub: Download Both PDFs & Restart */}
      <div className="pt-2 border-t border-[#252a39] flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onDownloadRiskPdf}
          className="w-full sm:flex-1 h-14 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#04b4a2] hover:brightness-110 text-[#003640] font-space font-bold text-sm flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>Download Risk Report (PDF)</span>
        </button>

        <button
          type="button"
          onClick={onDownloadInsurancePdf}
          className="w-full sm:flex-1 h-14 rounded-full bg-[#1a1f2e] hover:bg-[#252a39] text-white font-space font-semibold text-sm flex items-center justify-center space-x-2 border border-[#303444] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#4fdbc8] text-[20px]">picture_as_pdf</span>
          <span>Download Pricing Report (PDF)</span>
        </button>

        <button
          type="button"
          onClick={onStartNewSearch}
          className="w-full sm:w-auto h-14 px-6 rounded-full bg-[#090e1c] hover:bg-[#161b2a] text-[#bcc9cd] font-space text-xs font-semibold flex items-center justify-center space-x-1.5 border border-[#252a39] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>New Location</span>
        </button>
      </div>
    </div>
  );
};
