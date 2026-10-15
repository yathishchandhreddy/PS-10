import React, { useState } from 'react';
import { OFFICIAL_EMERGENCY_CONTACTS } from '../services/dataSources';

interface HeaderProps {
  currentStep: number;
  totalSteps?: number;
  stepTitle?: string;
  onGoBack?: () => void;
  onNavigateStep?: (step: number) => void;
  userRole?: string;
  onSwitchUser?: () => void;
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps = 6,
  stepTitle = 'Catastrophe Risk Intelligence',
  onGoBack,
  onNavigateStep,
  userRole,
  onSwitchUser,
  onReplayIntro,
}) => {
  const [showSosModal, setShowSosModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-2">
          {/* Left: Back Button & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onGoBack && currentStep > 1 && (
              <button
                type="button"
                aria-label="Go back"
                onClick={onGoBack}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#1E293B] hover:bg-[#F1F5F9] active:scale-95 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
            )}

            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onNavigateStep && onNavigateStep(1)}
            >
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1XDuaGwYbhktFh88KJACJydQqZsbrcgQOuZKb_v3A96ZHWRjk5CX10oeOW1m_U9TyWbxqh7I-AZ9jIQRgXJWgnMyeeui8B1a_af68gJn8uYgcR3o3NA3JkNLVUjsIPuBug-xUrG7XFBSNZ9CbeyFce55fBp9l7NlvnRCy-ps2aFjMHmBT6zIrYi-6_Pay01F0zydjzavq1LNCxzf7lzYekrHrWdC9s2w6mOnDOmrvXFTiMOL9n3WxTM80gt"
                alt="RiskLens TN Brand Logo"
                className="h-8 w-auto object-contain flex-shrink-0"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-sm tracking-wider text-[#1E293B] font-space uppercase">
                  RiskLens <span className="text-[#059669]">TN</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-mono tracking-tight -mt-0.5">
                  Tamil Nadu Catastrophe Engine
                </span>
              </div>
            </div>
          </div>

          {/* Center: Step Navigation Indicator (Desktop / Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-full shadow-inner">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const isActive = step === currentStep;
              const isPast = step < currentStep;
              return (
                <button
                  key={step}
                  onClick={() => onNavigateStep && onNavigateStep(step)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#059669] text-white font-bold shadow-sm'
                      : isPast
                      ? 'text-[#0D9488] hover:bg-[#E2E8F0]/60'
                      : 'text-[#64748B] hover:bg-[#E2E8F0]/60'
                  }`}
                >
                  <span>{step}</span>
                  {isActive && <span className="font-sans font-medium text-[11px] truncate max-w-[110px]">{stepTitle}</span>}
                </button>
              );
            })}
          </div>

          {/* Right Actions: SOS Emergency & User Role */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="h-10 px-3.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] hover:bg-[#FCD34D]/30 flex items-center gap-1.5 text-[#DC2626] text-xs font-medium transition-all active:scale-95 shadow-sm cursor-pointer"
              aria-label="Emergency SOS Hotlines"
            >
              <span className="material-symbols-outlined text-[#DC2626] text-[18px] animate-pulse">e911_emergency</span>
              <span className="font-mono font-bold">SOS 112</span>
            </button>

            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                title="Watch Cinematic Intro"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] hover:border-[#059669] text-xs font-mono text-[#64748B] hover:text-[#059669] transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#059669]">movie</span>
                <span>Intro</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSwitchUser}
              title={`Active Role: ${userRole || 'Property Owner'}. Click to switch.`}
              className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-[#E2E8F0] hover:border-[#059669] transition-colors shadow-sm cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#059669] flex items-center justify-center text-white font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[#1E293B]">
                {userRole || 'Property Owner'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* SOS Quick Dial Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <span className="material-symbols-outlined text-2xl animate-pulse">crisis_alert</span>
                <h3 className="font-bold text-lg text-[#1E293B] font-space">Tamil Nadu Emergency Helplines</h3>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#1E293B]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Official government 24x7 control rooms for flood rescue, storm evacuation, and civil defense:
            </p>

            <div className="space-y-2.5">
              {OFFICIAL_EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#059669] hover:bg-white transition-all group shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-sm text-[#1E293B] group-hover:text-[#059669] transition-colors">
                      {contact.service}
                    </div>
                    <div className="text-[11px] text-[#64748B]">{contact.authority}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#059669] font-mono font-bold text-sm">
                    <span className="material-symbols-outlined text-base">call</span>
                    {contact.number}
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-[#64748B] border-t border-[#E2E8F0] text-center">
              Verified data provided by TNSDMA &amp; MHA India.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
