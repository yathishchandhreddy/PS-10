import React, { useState, useEffect, useRef } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  // 5 Scenes:
  // 0: Animated Globe transitioning toward Tamil Nadu (0–2.5s)
  // 1: Cinematic Tamil Nadu Map & Geographic Markers (2.5–5s)
  // 2: Risk Score & Peril Visualization (5–7.5s)
  // 3: Property Exposure & Insurance Pricing (7.5–10s)
  // 4: Brand Reveal & Launch (10–12s)
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const totalDurationMs = 12000;
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Globe Canvas Ref
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Logo URL from Google Stitch UI export
  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1XDuaGwYbhktFh88KJACJydQqZsbrcgQOuZKb_v3A96ZHWRjk5CX10oeOW1m_U9TyWbxqh7I-AZ9jIQRgXJWgnMyeeui8B1a_af68gJn8uYgcR3o3NA3JkNLVUjsIPuBug-xUrG7XFBSNZ9CbeyFce55fBp9l7NlvnRCy-ps2aFjMHmBT6zIrYi-6_Pay01F0zydjzavq1LNCxzf7lzYekrHrWdC9s2w6mOnDOmrvXFTiMOL9n3WxTM80gt';

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Timeline driver
  useEffect(() => {
    if (prefersReducedMotion) {
      const t = setTimeout(() => handleSkip(), 1200);
      return () => clearTimeout(t);
    }

    startTimeRef.current = Date.now() - elapsedRef.current;

    const tick = () => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        elapsedRef.current = elapsed;

        const p = Math.min(100, (elapsed / totalDurationMs) * 100);
        setProgress(p);

        // Scene mapping:
        // 0 - 2500ms: Scene 0 (Globe)
        // 2500 - 5000ms: Scene 1 (Tamil Nadu Map)
        // 5000 - 7500ms: Scene 2 (Risk Score)
        // 7500 - 10000ms: Scene 3 (Property & Insurance)
        // 10000ms+: Scene 4 (Brand Reveal)
        let s = 0;
        if (elapsed < 2500) s = 0;
        else if (elapsed < 5000) s = 1;
        else if (elapsed < 7500) s = 2;
        else if (elapsed < 10000) s = 3;
        else s = 4;

        setCurrentScene(s);

        if (elapsed >= totalDurationMs + 4000) {
          handleComplete();
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, prefersReducedMotion]);

  // 3D Animated Globe Canvas Effect in Scene 1
  useEffect(() => {
    if (currentScene !== 0) return;
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let globeAnimId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 500);

    let rotationAngle = -0.6; // Starts rotating toward India longitude

    // Generate globe surface points (parallels & meridians)
    const points: { lat: number; lng: number }[] = [];
    for (let lat = -80; lat <= 80; lat += 15) {
      for (let lng = -180; lng < 180; lng += 15) {
        points.push({ lat: (lat * Math.PI) / 180, lng: (lng * Math.PI) / 180 });
      }
    }

    // Dense India / Tamil Nadu points cluster (approx Lat 8° to 24°N, Lng 72° to 86°E)
    const tnCluster: { lat: number; lng: number }[] = [];
    for (let lat = 8; lat <= 20; lat += 2) {
      for (let lng = 75; lng <= 82; lng += 2) {
        tnCluster.push({ lat: (lat * Math.PI) / 180, lng: (lng * Math.PI) / 180 });
      }
    }

    const renderGlobe = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      rotationAngle += 0.009;

      // Draw subtle atmosphere rim
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.08);
      grad.addColorStop(0, 'rgba(13, 148, 136, 0.25)');
      grad.addColorStop(0.7, 'rgba(5, 150, 105, 0.15)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw Globe Base Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Meridian & Parallel Grid Points (Spherical Projection)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      points.forEach((p) => {
        const currentLng = p.lng + rotationAngle;
        const x3d = Math.cos(p.lat) * Math.sin(currentLng);
        const y3d = -Math.sin(p.lat);
        const z3d = Math.cos(p.lat) * Math.cos(currentLng);

        // Only draw points on the visible front hemisphere (z3d > 0)
        if (z3d > 0) {
          const px = cx + x3d * radius;
          const py = cy + y3d * radius;
          const pointAlpha = Math.max(0.1, z3d);

          ctx.beginPath();
          ctx.arc(px, py, 1.2 * z3d, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(14, 165, 233, ${pointAlpha * 0.7})`;
          ctx.fill();
        }
      });

      // Draw Highlighted Southern India & Tamil Nadu Points
      tnCluster.forEach((p) => {
        const currentLng = p.lng + rotationAngle;
        const x3d = Math.cos(p.lat) * Math.sin(currentLng);
        const y3d = -Math.sin(p.lat);
        const z3d = Math.cos(p.lat) * Math.cos(currentLng);

        if (z3d > 0) {
          const px = cx + x3d * radius;
          const py = cy + y3d * radius;

          ctx.beginPath();
          ctx.arc(px, py, 2.2 * z3d, 0, Math.PI * 2);
          ctx.fillStyle = '#059669';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#10B981';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Target Pin on Tamil Nadu (approx 13°N, 80°E)
      const targetLat = (13 * Math.PI) / 180;
      const targetLng = (80.25 * Math.PI) / 180 + rotationAngle;
      const tx = Math.cos(targetLat) * Math.sin(targetLng);
      const ty = -Math.sin(targetLat);
      const tz = Math.cos(targetLat) * Math.cos(targetLng);

      if (tz > 0.1) {
        const pinX = cx + tx * radius;
        const pinY = cy + ty * radius;

        // Pulsing geodetic beacon
        const pulseSize = 10 + Math.sin(Date.now() * 0.008) * 4;
        ctx.beginPath();
        ctx.arc(pinX, pinY, pulseSize * tz, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${tz * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pinX, pinY, 4 * tz, 0, Math.PI * 2);
        ctx.fillStyle = '#0EA5E9';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0EA5E9';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        if (tz > 0.5) {
          ctx.font = 'bold 11px "Space Grotesk", sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('TAMIL NADU', pinX + 10, pinY - 6);
          ctx.font = '9px monospace';
          ctx.fillStyle = '#10B981';
          ctx.fillText('13.08°N, 80.27°E', pinX + 10, pinY + 6);
        }
      }

      globeAnimId = requestAnimationFrame(renderGlobe);
    };

    renderGlobe();

    return () => {
      cancelAnimationFrame(globeAnimId);
    };
  }, [currentScene]);

  const handleSkip = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try {
      sessionStorage.setItem('risklens_intro_completed', 'true');
    } catch {}
    onComplete();
  };

  const handleComplete = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try {
      sessionStorage.setItem('risklens_intro_completed', 'true');
    } catch {}
    onComplete();
  };

  const jumpToScene = (sceneIndex: number) => {
    const sceneTimes = [0, 2600, 5100, 7600, 10100];
    const targetElapsed = sceneTimes[sceneIndex];
    elapsedRef.current = targetElapsed;
    startTimeRef.current = Date.now() - targetElapsed;
    setCurrentScene(sceneIndex);
    setProgress((targetElapsed / totalDurationMs) * 100);
  };

  const togglePause = () => {
    if (!isPaused) {
      setIsPaused(true);
    } else {
      startTimeRef.current = Date.now() - elapsedRef.current;
      setIsPaused(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#F8FAFC] text-[#1E293B] overflow-hidden select-none font-sans">
      {/* Background Subtle Geospatial Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="introGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
              <circle cx="60" cy="60" r="1.5" fill="#0D9488" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#introGrid)" />
        </svg>
      </div>

      {/* Luminous Light Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-[#059669]/10 via-[#0D9488]/15 to-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Brand & Controls */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white border border-[#CBD5E1] p-1.5 shadow-sm flex items-center justify-center">
            <img src={logoUrl} alt="RiskLens TN Logo" className="h-full w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-space font-extrabold text-sm tracking-widest uppercase text-[#1E293B]">
              RISKLENS <span className="text-[#059669]">TN</span>
            </span>
            <span className="text-[10px] text-[#64748B] tracking-wider uppercase font-mono">
              Catastrophe Risk Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={togglePause}
            className="px-3 py-1.5 rounded-full bg-white/90 border border-[#CBD5E1] text-[#64748B] hover:text-[#1E293B] text-xs font-mono flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title={isPaused ? 'Resume Intro' : 'Pause Intro'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Skip Intro */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-1.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs font-space font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer group"
          >
            <span>Skip Intro</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              skip_next
            </span>
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-6 flex items-center justify-center">
        {/* ======================================================== */}
        {/* SCENE 1: ANIMATED GLOBE TRANSITIONING TO TAMIL NADU       */}
        {/* ======================================================== */}
        {currentScene === 0 && (
          <div className="w-full flex flex-col items-center text-center space-y-4 max-w-2xl animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
              <span>GEODETIC TARGET ACQUISITION · 13.0827° N, 80.2707° E</span>
            </div>

            {/* Rotating 3D Globe Canvas with India Highlight */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 flex items-center justify-center">
              <canvas
                ref={globeCanvasRef}
                className="w-full h-full rounded-full shadow-[0_12px_36px_rgba(13,148,136,0.18)]"
              />
              <div className="absolute -inset-3 rounded-full border border-[#0D9488]/30 animate-pulse pointer-events-none" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[#1E293B] tracking-tight">
                RISK LENS <span className="text-[#059669]">TN</span>
              </h1>
              <p className="font-space text-base sm:text-lg text-[#0D9488] font-semibold">
                Tamil Nadu Catastrophe Risk Intelligence Platform
              </p>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                Hyperlocal environmental hazard quantification, physical property loss modeling, and indicative insurance underwriting.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 2: CINEMATIC MAP VISUALIZATION (TAMIL NADU)        */}
        {/* ======================================================== */}
        {currentScene === 1 && (
          <div className="w-full flex flex-col items-center space-y-4 max-w-2xl animate-fadeIn">
            <div className="text-center space-y-1 mb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] text-xs font-mono font-semibold">
                <span className="material-symbols-outlined text-[16px]">map</span>
                <span>REGIONAL GIS TERRAIN MATRIX</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[#1E293B]">
                Tamil Nadu Spatial GIS Framework
              </h2>
            </div>

            {/* High-fidelity Vector Geographic Silhouette & Markers */}
            <div className="relative w-full h-64 sm:h-72 bg-white rounded-3xl border border-[#CBD5E1] shadow-xl overflow-hidden flex items-center justify-center">
              {/* Geographic grid lines */}
              <div className="absolute inset-0 bg-[#F8FAFC]">
                <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="scene2Tiles" width="60" height="60" patternUnits="userSpaceOnUse">
                    <rect width="60" height="60" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                    <circle cx="60" cy="60" r="1.5" fill="#94A3B8" opacity="0.4" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#scene2Tiles)" />
                </svg>
              </div>

              {/* Realistic Geographic Silhouette of Tamil Nadu */}
              <svg
                viewBox="0 0 400 320"
                className="w-full h-full p-4 relative z-10 transition-transform duration-1000 scale-105"
              >
                {/* Coastal buffer / Bay of Bengal */}
                <path
                  d="M 280,30 Q 320,120 310,210 T 260,300"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="8"
                  strokeOpacity="0.2"
                />

                {/* Tamil Nadu Accurate Regional Vector Outline */}
                <path
                  d="M 180,25 L 285,45 L 295,95 L 280,150 L 305,210 L 250,295 L 210,310 L 175,270 L 140,240 L 130,180 L 150,110 L 145,55 Z"
                  fill="#ECFDF5"
                  stroke="#059669"
                  strokeWidth="2.5"
                  className="transition-all duration-700"
                />

                {/* Major River Corridors (Cauvery & Adyar drainage paths) */}
                <path
                  d="M 140,150 Q 220,165 290,175"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.8"
                />

                {/* Analysis Radius Circle (Expanding with subtle radar sweep) */}
                <circle
                  cx="280"
                  cy="65"
                  r="38"
                  fill="#0EA5E9"
                  fillOpacity="0.12"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />

                {/* Target Marker: Chennai Basin (13.08°N, 80.27°E) */}
                <g transform="translate(280, 65)">
                  <circle r="14" fill="#0EA5E9" opacity="0.3" className="animate-ping" />
                  <circle r="7" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="2" />
                  <circle r="2" fill="#FFFFFF" />
                  <text
                    x="14"
                    y="4"
                    fill="#1E293B"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    Chennai Basin
                  </text>
                  <text x="14" y="16" fill="#64748B" fontSize="9" fontFamily="monospace">
                    13.08°N, 80.27°E
                  </text>
                </g>

                {/* Regional City Markers */}
                <circle cx="150" cy="180" r="4" fill="#059669" />
                <text x="160" y="184" fill="#64748B" fontSize="9" fontFamily="sans-serif">
                  Coimbatore
                </text>

                <circle cx="210" cy="230" r="4" fill="#059669" />
                <text x="220" y="234" fill="#64748B" fontSize="9" fontFamily="sans-serif">
                  Madurai
                </text>

                <circle cx="220" cy="165" r="3.5" fill="#059669" />
                <text x="228" y="169" fill="#64748B" fontSize="9" fontFamily="sans-serif">
                  Tiruchirappalli
                </text>
                {/* Admin Cadastral Building Risk Color Footprints */}
                <g id="introBuildingColors" className="animate-fadeIn">
                  {/* High Risk (Red: #DC2626) */}
                  <rect x="264" y="54" width="7" height="6" fill="#DC2626" rx="1" />
                  <rect x="272" y="74" width="8" height="6" fill="#DC2626" rx="1" />
                  <rect x="296" y="58" width="7" height="6" fill="#DC2626" rx="1" />
                  <rect x="260" y="80" width="8" height="6" fill="#DC2626" rx="1" />

                  {/* Moderate Risk (Amber: #D97706) */}
                  <rect x="258" y="66" width="7" height="6" fill="#D97706" rx="1" />
                  <rect x="286" y="80" width="8" height="6" fill="#D97706" rx="1" />
                  <rect x="300" y="68" width="7" height="6" fill="#D97706" rx="1" />
                  <rect x="274" y="88" width="7" height="6" fill="#D97706" rx="1" />

                  {/* Resilient / Low Risk (Green: #059669) */}
                  <rect x="268" y="44" width="8" height="6" fill="#059669" rx="1" />
                  <rect x="290" y="48" width="7" height="6" fill="#059669" rx="1" />
                  <rect x="284" y="88" width="7" height="6" fill="#059669" rx="1" />
                </g>
              </svg>

              {/* Geographic HUD Telemetry Overlays */}
              <div className="absolute bottom-3 left-4 z-20 px-3 py-1 rounded-lg bg-white/95 border border-[#CBD5E1] text-[10px] font-mono text-[#64748B] shadow-xs">
                Active Coordinate: 13.0827° N, 80.2707° E · 6m MSL Elevation
              </div>

              {/* Admin Building Colors Pill at starting */}
              <div className="absolute bottom-3 right-4 z-20 px-2.5 py-1 rounded-lg bg-white/95 border border-[#CBD5E1] text-[10px] font-mono text-[#1E293B] shadow-xs flex items-center gap-2">
                <span className="font-semibold text-[#64748B]">Building Colors:</span>
                <span className="flex items-center gap-1 text-[#DC2626] font-bold"><span className="w-2 h-2 rounded-xs bg-[#DC2626]" />Red</span>
                <span className="flex items-center gap-1 text-[#D97706] font-bold"><span className="w-2 h-2 rounded-xs bg-[#D97706]" />Amber</span>
                <span className="flex items-center gap-1 text-[#059669] font-bold"><span className="w-2 h-2 rounded-xs bg-[#059669]" />Green</span>
              </div>

              <div className="absolute top-3 right-4 z-20 px-3 py-1 rounded-lg bg-white/95 border border-[#CBD5E1] text-[10px] font-mono text-[#059669] font-bold shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                <span>5 km Analysis Radius</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 3: RISK SCORE & DISASTER INDICATORS (5–7.5s)       */}
        {/* ======================================================== */}
        {currentScene === 2 && (
          <div className="w-full flex flex-col items-center space-y-4 max-w-2xl animate-fadeIn">
            <div className="text-center space-y-1 mb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-mono font-semibold">
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                <span>MULTI-PERIL RISK INDEX</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[#1E293B]">
                Vulnerability Assessment &amp; Risk Gauges
              </h2>
            </div>

            {/* Truth-in-Labeling Notice */}
            <div className="px-3.5 py-1 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] text-[#64748B] font-mono text-center">
              ⚠️ <strong className="text-[#1E293B]">Illustrative Preview</strong> — Computed from user coordinates and vetted datasets on dashboard.
            </div>

            {/* Risk Interface Bento Grid */}
            <div className="w-full bg-white rounded-3xl border border-[#CBD5E1] p-5 sm:p-6 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Circular Risk Score Gauge Drawing Itself */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="65"
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold font-space text-[#1E293B]">74</span>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#D97706]">
                      Higher Risk
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#1E293B] mt-2">
                  Risk Assessment Index
                </span>
                <span className="text-[10px] text-[#64748B]">Composite Catastrophe Score</span>
              </div>

              {/* Peril Exposure Indicators (Flood, Cyclone, Earthquake) */}
              <div className="md:col-span-7 space-y-2">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0EA5E9] text-[18px]">
                      water_damage
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Flood Exposure</h4>
                      <p className="text-[10px] text-[#64748B]">Low-lying basin catchment &amp; runoff</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626] font-mono text-xs font-bold">
                    High (78%)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0D9488] text-[18px]">
                      cyclone
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Cyclone Exposure</h4>
                      <p className="text-[10px] text-[#64748B]">50 m/s Coastal wind gust zone (IS 875)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-mono text-xs font-bold">
                    Moderate (64%)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#D97706] text-[18px]">
                      vibration
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Earthquake Horizon</h4>
                      <p className="text-[10px] text-[#64748B]">IS 1893:2016 Seismic Zone II &amp; III</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-mono text-xs font-bold">
                    Zone III (Low-Mod)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1 px-1">
                  <span>Data Confidence: High</span>
                  <span className="text-[#059669] font-semibold">TNSDMA, IMD &amp; BMTPC Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 4: PROPERTY EXPOSURE & INSURANCE PRICING (7.5–10s) */}
        {/* ======================================================== */}
        {currentScene === 3 && (
          <div className="w-full flex flex-col items-center space-y-4 max-w-2xl animate-fadeIn">
            <div className="text-center space-y-1 mb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-mono font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>PROPERTY PROTECTION &amp; UNDERWRITING</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[#1E293B]">
                Loss Quantification &amp; Indicative Pricing
              </h2>
            </div>

            {/* Illustrative Notice */}
            <div className="px-3.5 py-1 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] text-[#64748B] font-mono text-center">
              ⚠️ <strong className="text-[#1E293B]">Illustrative Scenario</strong> — Actual prices calculated dynamically based on user property specifics.
            </div>

            {/* Property Shield, Loss Calculation, and Insurance Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Property Outline & Protective Shield */}
              <div className="bg-white p-5 rounded-3xl border border-[#CBD5E1] shadow-lg flex flex-col items-center text-center space-y-3 relative overflow-hidden">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-[#059669]">
                    home
                  </span>
                  <div className="absolute inset-0 border-2 border-[#059669] rounded-2xl animate-ping opacity-30" />
                  <span className="material-symbols-outlined text-xl text-[#0D9488] absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    shield
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] font-space">
                    Structural Resilience
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Plinth barrier + sump non-return valves
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10px] font-mono font-bold">
                  Recommended Upgrades
                </span>
              </div>

              {/* Card 2: Property Loss Calculation */}
              <div className="bg-white p-5 rounded-3xl border border-[#CBD5E1] shadow-lg flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
                  <span className="material-symbols-outlined text-2xl">calculate</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] font-space">
                    Loss Estimation
                  </h4>
                  <p className="text-lg font-extrabold font-space text-[#DC2626] mt-0.5">
                    ₹14,50,000
                  </p>
                  <p className="text-[10px] text-[#64748B]">19.3% Mean Damage Ratio</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] text-[10px] font-mono">
                  Illustrative Scenario
                </span>
              </div>

              {/* Card 3: Indicative Insurance Card & PDF Report */}
              <div className="bg-white p-5 rounded-3xl border border-[#CBD5E1] shadow-lg flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488]">
                  <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] font-space">
                    Indicative Premium &amp; PDF
                  </h4>
                  <p className="text-lg font-extrabold font-space text-[#059669] mt-0.5">
                    ₹11,250 <span className="text-xs text-[#64748B] font-normal">/year</span>
                  </p>
                  <p className="text-[10px] text-[#64748B]">Instant Comprehensive PDF</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10px] font-mono font-bold">
                  PDF Reports Enabled
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 5: RISKLENS TN LOGO REVEAL & CALL TO ACTION        */}
        {/* ======================================================== */}
        {currentScene === 4 && (
          <div className="flex flex-col items-center text-center space-y-6 max-w-xl animate-fadeIn">
            {/* Logo with restrained halo */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-[#059669] shadow-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <img src={logoUrl} alt="RiskLens TN Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border-2 border-[#059669]/30 animate-pulse pointer-events-none" />
            </div>

            <div className="space-y-2">
              <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[#1E293B]">
                Understand Risk. Protect What Matters.
              </h1>
              <p className="font-space text-sm sm:text-base text-[#059669] font-bold">
                Tamil Nadu Catastrophe Risk Intelligence Platform
              </p>
            </div>

            {/* Subtle Animated Progress Indicator */}
            <div className="w-full max-w-xs space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                <span>Loading RiskLens TN...</span>
                <span className="text-[#059669] font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#0EA5E9] rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Single Prominent Call to Action */}
            <button
              type="button"
              onClick={handleComplete}
              className="px-8 py-3.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-sm font-space font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Timeline Scrubber & Scene Navigation Pills */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white/80 backdrop-blur-md rounded-t-3xl">
        {/* Scene Navigation Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { idx: 0, label: '1. 3D Globe' },
            { idx: 1, label: '2. Tamil Nadu Map' },
            { idx: 2, label: '3. Risk Gauges' },
            { idx: 3, label: '4. Asset Protection' },
            { idx: 4, label: '5. Launch' },
          ].map((tab) => (
            <button
              key={tab.idx}
              type="button"
              onClick={() => jumpToScene(tab.idx)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                currentScene === tab.idx
                  ? 'bg-[#059669] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-[#CBD5E1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-36 h-1.5 bg-[#CBD5E1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] shrink-0">
            {Math.max(0, Math.ceil((totalDurationMs - elapsedRef.current) / 1000))}s
          </span>
        </div>
      </footer>
    </div>
  );
};
