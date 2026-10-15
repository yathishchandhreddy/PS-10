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
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps = 6,
  stepTitle = 'Catastrophe Risk Intelligence',
  onGoBack,
  onNavigateStep,
  userRole,
  onSwitchUser,
}) => {
  const [showSosModal, setShowSosModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0e1321]/90 backdrop-blur-xl border-b border-[#252a39] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-2">
          {/* Left: Back / Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onGoBack && currentStep > 1 && (
              <button
                type="button"
                aria-label="Go back"
                onClick={onGoBack}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#dee2f6] hover:bg-[#252a39] active:scale-95 transition-all flex-shrink-0"
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
                <span className="font-bold text-sm tracking-wider text-white font-space uppercase">
                  RiskLens <span className="text-[#4cd7f6]">TN</span>
                </span>
                <span className="text-[10px] text-[#bcc9cd] font-mono tracking-tight -mt-0.5">
                  Tamil Nadu Catastrophe Engine
                </span>
              </div>
            </div>
          </div>

          {/* Center: Step Navigation Indicator (Desktop / Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#161b2a] border border-[#252a39] px-3 py-1.5 rounded-full">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const isActive = step === currentStep;
              const isPast = step < currentStep;
              return (
                <button
                  key={step}
                  onClick={() => onNavigateStep && onNavigateStep(step)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#4cd7f6] text-[#003640] font-bold shadow-[0_0_12px_rgba(76,215,246,0.5)]'
                      : isPast
                      ? 'text-[#4fdbc8] hover:bg-[#252a39]'
                      : 'text-[#869397] hover:bg-[#252a39]'
                  }`}
                >
                  <span>{step}</span>
                  {isActive && <span className="font-sans font-medium text-[11px] truncate max-w-[100px]">{stepTitle}</span>}
                </button>
              );
            })}
          </div>

          {/* Right Actions: SOS Emergency & User Role */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="h-10 px-3 rounded-full bg-[#93000a]/30 border border-[#ffb4ab]/40 hover:bg-[#93000a]/50 flex items-center gap-1.5 text-[#ffb4ab] text-xs font-medium transition-all active:scale-95 shadow-sm"
              aria-label="Emergency SOS Hotlines"
            >
              <span className="material-symbols-outlined text-[#ffb4ab] text-[18px] animate-pulse">e911_emergency</span>
              <span className="font-mono font-bold">SOS 112</span>
            </button>

            <button
              type="button"
              onClick={onSwitchUser}
              title={`Active Role: ${userRole || 'Resident'}. Click to switch.`}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-[#1a1f2e] border border-[#303444] hover:border-[#4cd7f6] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#4cd7f6] flex items-center justify-center text-[#003640] font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[#dee2f6]">
                {userRole || 'Resident'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* SOS Quick Dial Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161b2a] border border-[#ffb4ab]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#252a39]">
              <div className="flex items-center gap-2 text-[#ffb4ab]">
                <span className="material-symbols-outlined text-2xl animate-pulse">crisis_alert</span>
                <h3 className="font-bold text-lg text-white font-space">Tamil Nadu Emergency Helplines</h3>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="w-8 h-8 rounded-full bg-[#252a39] flex items-center justify-center text-[#bcc9cd] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#bcc9cd]">
              Official government 24x7 control rooms for flood rescue, storm evacuation, and civil defense:
            </p>

            <div className="space-y-2.5">
              {OFFICIAL_EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#090e1c] border border-[#252a39] hover:border-[#4cd7f6] transition-all group"
                >
                  <div>
                    <div className="font-semibold text-sm text-white group-hover:text-[#4cd7f6] transition-colors">
                      {contact.service}
                    </div>
                    <div className="text-[11px] text-[#869397]">{contact.authority}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono font-bold text-sm">
                    <span className="material-symbols-outlined text-base">call</span>
                    {contact.number}
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-[#869397] border-t border-[#252a39] text-center">
              Never misuse emergency numbers. Verified data provided by TNSDMA & MHA India.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
