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
  }[] = [
    {
      id: 'flood',
      label: 'Flood Hazard',
      sublabel: 'Surface Inundation & Cloudburst Runoff',
      icon: 'flood',
      tag: 'Primary Monsoon Risk',
      tagColor: 'bg-[#4cd7f6]/15 text-[#4cd7f6] border-[#4cd7f6]/30',
      activeBorder: 'border-[#4cd7f6] shadow-[0_0_20px_rgba(76,215,246,0.3)]',
    },
    {
      id: 'cyclone',
      label: 'Cyclone & Surge',
      sublabel: 'Bay of Bengal Landfall & Gale Gusts',
      icon: 'air',
      tag: 'Coastal Wind Risk',
      tagColor: 'bg-[#4fdbc8]/15 text-[#4fdbc8] border-[#4fdbc8]/30',
      activeBorder: 'border-[#4fdbc8] shadow-[0_0_20px_rgba(79,219,200,0.3)]',
    },
    {
      id: 'earthquake',
      label: 'Earthquake (IS 1893)',
      sublabel: 'Peninsular Shield Zone II & III Tremors',
      icon: 'earthquake',
      tag: 'Seismic Baselines',
      tagColor: 'bg-[#d0bcff]/15 text-[#d0bcff] border-[#d0bcff]/30',
      activeBorder: 'border-[#d0bcff] shadow-[0_0_20px_rgba(208,188,255,0.3)]',
    },
  ];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-mono font-bold text-[#bcc9cd] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">warning</span>
          <span>Select Catastrophe Peril</span>
        </label>
        <span className="text-[11px] font-mono text-[#869397]">Independent Risk Models</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selectedDisaster === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectDisaster(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-[#1a1f2e] ${opt.activeBorder}`
                  : 'bg-[#161b2a]/80 border-[#252a39] hover:border-[#303444] opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#090e1c] text-[#4cd7f6]' : 'bg-[#1a1f2e] text-[#869397]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${opt.tagColor}`}>
                    {opt.tag}
                  </span>
                </div>

                <div className="font-space font-bold text-sm text-white">{opt.label}</div>
                <div className="text-[11px] text-[#bcc9cd] mt-0.5">{opt.sublabel}</div>
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-[#4cd7f6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
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
