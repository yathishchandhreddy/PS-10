import React from 'react';
import { DisasterType } from '../types';

interface DisasterSelectorProps {
  selectedDisaster: DisasterType;
  onSelectDisaster: (disaster: DisasterType) => void;
}

export const DisasterSelector: React.FC<DisasterSelectorProps> = ({
  selectedDisaster,
  onSelectDisaster,
}) => {
  const options: {
    id: DisasterType;
    label: string;
    sublabel: string;
    icon: string;
    tag: string;
    tagColor: string;
    activeBorder: string;
    activeBg: string;
  }[] = [
    {
      id: 'flood',
      label: 'Flood Hazard',
      sublabel: 'Surface Inundation & Cloudburst Runoff',
      icon: 'flood',
      tag: 'Primary Monsoon Risk',
      tagColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
      activeBorder: 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/20 shadow-sm',
      activeBg: 'bg-[#F0F9FF]',
    },
    {
      id: 'cyclone',
      label: 'Cyclone & Surge',
      sublabel: 'Bay of Bengal Landfall & Gale Gusts',
      icon: 'air',
      tag: 'Coastal Wind Risk',
      tagColor: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
      activeBorder: 'border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-sm',
      activeBg: 'bg-[#F0FDFA]',
    },
    {
      id: 'earthquake',
      label: 'Earthquake (IS 1893)',
      sublabel: 'Peninsular Shield Zone II & III Tremors',
      icon: 'earthquake',
      tag: 'Seismic Baselines',
      tagColor: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
      activeBorder: 'border-[#9333EA] ring-2 ring-[#9333EA]/20 shadow-sm',
      activeBg: 'bg-[#FAF5FF]',
    },
  ];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#059669]">warning</span>
          <span>Select Catastrophe Peril</span>
        </label>
        <span className="text-[11px] font-mono text-[#64748B]">Independent Risk Models</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selectedDisaster === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectDisaster(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? `${opt.activeBg} ${opt.activeBorder}`
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white text-[#059669] shadow-xs' : 'bg-[#F8FAFC] text-[#64748B]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${opt.tagColor}`}>
                    {opt.tag}
                  </span>
                </div>

                <div className="font-space font-bold text-sm text-[#1E293B]">{opt.label}</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">{opt.sublabel}</div>
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#059669] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  <span>Model Active</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
