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
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
            Step 6 of 6
          </span>
          <span className="text-[#64748B] font-mono text-xs font-medium">
            Prevention, Preparedness &amp; Official Directives
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl text-[#1E293B]">
          Prevention Recommendations &amp; Safety
        </h2>
        <p className="text-xs text-[#64748B]">
          Tailored resilience guidance for {riskResult.location.name} against {disasterType.toUpperCase()} hazards.
        </p>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="bg-white border border-[#FECACA] rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <span className="material-symbols-outlined text-[20px] animate-pulse">crisis_alert</span>
            <span className="font-space font-bold text-sm text-[#1E293B]">
              Official Verified Emergency Contacts
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded-full bg-[#FEE2E2] font-semibold">
            24x7 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.number}
              href={`tel:${contact.number}`}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#059669] hover:bg-white transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#059669] transition-colors block">
                  {contact.name}
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5 block">{contact.role}</span>
              </div>
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                <span className="text-sm font-space font-extrabold text-[#059669]">
                  {contact.number}
                </span>
                <span className="material-symbols-outlined text-xs text-[#059669] group-hover:translate-x-0.5 transition-transform">
                  call
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Truth In Shelters Notice */}
      <div className="p-4 rounded-3xl bg-[#F0FDFA] border border-[#99F6E4] flex items-start gap-3 shadow-xs">
        <span className="material-symbols-outlined text-[#0D9488] text-[22px] flex-shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-1">
          <strong className="text-[#1E293B] font-space text-xs sm:text-sm block">
            Government Shelter Activation Protocol
          </strong>
          <p className="text-xs text-[#64748B] leading-relaxed">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-space whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#059669] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-[#CBD5E1]'
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
            className="p-5 rounded-3xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors space-y-2 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-space font-bold text-sm sm:text-base text-[#1E293B]">
                {rec.title}
              </span>
              <div className="flex items-center gap-1.5">
                {rec.isLocationSpecific && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    Location-Specific
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                  {rec.priority}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {rec.action}
            </p>
          </div>
        ))}
      </div>

      {/* Official Government Portals */}
      <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
        <span className="font-space font-bold text-xs uppercase tracking-wider text-[#64748B] block">
          Official Government Disaster Portals
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {officialPortals.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noreferrer noopener"
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#059669] hover:bg-white flex items-center justify-between group transition-colors shadow-2xs"
            >
              <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#059669] truncate">
                {portal.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#059669] flex-shrink-0 ml-1">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Final Action Hub: Download Both PDFs & Restart */}
      <div className="pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onDownloadRiskPdf}
          className="w-full sm:flex-1 h-14 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-sm flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>Download Risk Report (PDF)</span>
        </button>

        <button
          type="button"
          onClick={onDownloadInsurancePdf}
          className="w-full sm:flex-1 h-14 rounded-full bg-white hover:bg-[#F8FAFC] text-[#1E293B] font-space font-semibold text-sm flex items-center justify-center space-x-2 border border-[#CBD5E1] active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[#0D9488] text-[20px]">picture_as_pdf</span>
          <span>Download Pricing Report (PDF)</span>
        </button>

        <button
          type="button"
          onClick={onStartNewSearch}
          className="w-full sm:w-auto h-14 px-6 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] font-space text-xs font-semibold flex items-center justify-center space-x-1.5 border border-[#CBD5E1] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>New Location</span>
        </button>
      </div>
    </div>
  );
};
