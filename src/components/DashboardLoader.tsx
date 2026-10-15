import React, { useState, useEffect } from 'react';

interface DashboardLoaderProps {
  userName: string;
  userRole: string;
  onLoaded: () => void;
}

export const DashboardLoader: React.FC<DashboardLoaderProps> = ({
  userName,
  userRole,
  onLoaded,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const steps = [
    { id: 1, label: 'Initializing geospatial workspace', detail: 'Calibrating WGS-84 Tamil Nadu projection' },
    { id: 2, label: 'Preparing location tools', detail: 'OpenStreetMap tile cache & geocoding index' },
    { id: 3, label: 'Loading available risk data', detail: 'Verified TNSDMA, IMD & BMTPC baseline profiles' },
    { id: 4, label: 'Preparing insurance analysis', detail: 'Tamil Nadu IIB property underwriting rules' },
    { id: 5, label: 'Opening your dashboard', detail: 'Mounting interactive map & risk models' },
  ];

  useEffect(() => {
    // Total duration: 2000ms (~2s)
    const stepDuration = 380;

    const t1 = setTimeout(() => {
      setCompletedSteps([1]);
      setProgress(20);
    }, stepDuration);

    const t2 = setTimeout(() => {
      setCompletedSteps([1, 2]);
      setProgress(45);
    }, stepDuration * 2);

    const t3 = setTimeout(() => {
      setCompletedSteps([1, 2, 3]);
      setProgress(70);
    }, stepDuration * 3);

    const t4 = setTimeout(() => {
      setCompletedSteps([1, 2, 3, 4]);
      setProgress(90);
    }, stepDuration * 4);

    const t5 = setTimeout(() => {
      setCompletedSteps([1, 2, 3, 4, 5]);
      setProgress(100);
    }, stepDuration * 5);

    const tComplete = setTimeout(() => {
      onLoaded();
    }, stepDuration * 5 + 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tComplete);
    };
  }, [onLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] text-[#1E293B] select-none font-sans overflow-hidden">
      {/* Background Geospatial Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="loaderGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
              <circle cx="48" cy="48" r="1.2" fill="#0D9488" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loaderGrid)" />
        </svg>
      </div>

      {/* Luminous Soft Horizon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#059669]/10 via-[#0D9488]/15 to-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6 animate-fadeIn">
        {/* Animated Map Marker Icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] animate-ping opacity-60" />
          <div className="relative w-14 h-14 rounded-2xl bg-white border border-[#CBD5E1] shadow-md flex items-center justify-center text-[#059669]">
            <span className="material-symbols-outlined text-3xl animate-bounce">
              location_on
            </span>
          </div>
        </div>

        {/* Title & Perspective context */}
        <div className="text-center space-y-1">
          <h2 className="font-space font-extrabold text-xl sm:text-2xl text-[#1E293B]">
            Preparing Your Risk Intelligence Workspace
          </h2>
          <p className="text-xs text-[#64748B]">
            Welcome, <strong className="text-[#059669]">{userName}</strong> ({userRole})
          </p>
        </div>

        {/* Status Checklist */}
        <div className="w-full space-y-2.5">
          {steps.map((st) => {
            const isDone = completedSteps.includes(st.id);
            const isCurrent = completedSteps.length + 1 === st.id;

            return (
              <div
                key={st.id}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isDone
                    ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
                    : isCurrent
                    ? 'bg-white border-[#059669] text-[#1E293B] shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isDone
                        ? 'bg-[#059669] text-white'
                        : isCurrent
                        ? 'bg-[#E0F2FE] text-[#0284C7] animate-pulse'
                        : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    {isDone ? '✓' : st.id}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isDone ? 'text-[#059669]' : isCurrent ? 'text-[#1E293B]' : 'text-[#64748B]'
                      }`}
                    >
                      {st.label}
                    </p>
                    <p className="text-[10px] text-[#64748B] truncate">{st.detail}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono shrink-0 font-bold">
                  {isDone ? (
                    <span className="text-[#059669]">READY</span>
                  ) : isCurrent ? (
                    <span className="text-[#0284C7] animate-pulse">CONNECTING...</span>
                  ) : (
                    <span className="text-[#94A3B8]">QUEUED</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
            <span>Workspace Setup</span>
            <span className="text-[#059669] font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#0EA5E9] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
