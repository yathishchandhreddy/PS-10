import React, { useState, useEffect, useRef } from 'react';
import { DisasterType, LocationData, RiskAnalysisResult } from '../types';

interface SimulationViewerProps {
  location: LocationData;
  disasterType: DisasterType;
  riskResult: RiskAnalysisResult;
  onViewMitigation?: () => void;
}

export const SimulationViewer: React.FC<SimulationViewerProps> = ({
  location,
  disasterType,
  riskResult,
  onViewMitigation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(5.2);
  const totalTime = 10.0;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic stages tailored to disaster peril and location
  const getStages = () => {
    if (disasterType === 'flood') {
      return [
        {
          min: 0,
          max: 2,
          milestone: '0-2s',
          tabName: 'TN View',
          label: `0-2s • Tamil Nadu Basin & ${location.district} Regional Grid`,
          depth: '+0.00m MSL',
          waterStatus: 'Precipitation Inflow',
          description: `IMD radar detects deep depression over Bay of Bengal channel discharging ~180mm into ${location.name} catchment.`,
          imageUrl:
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 2,
          max: 4,
          milestone: '2-4s',
          tabName: 'Intro',
          label: `2-4s • ${location.name} Topographic Inflow Scenario`,
          depth: '+0.15m Ingress',
          waterStatus: 'Culverts At Capacity',
          description: `Elevation profile at ${location.elevationMeters}m MSL creates natural depression. Siltation limits stormwater flow.`,
          imageUrl:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 4,
          max: 6,
          milestone: '4-6s',
          tabName: 'Runoff',
          label: '4-6s • Water Runoff Vectors & Curbside Pooling',
          depth: '+0.42m Expected',
          waterStatus: 'Drainage Saturated',
          description: 'High surface runoff vectors push excess volume toward residential boundaries and low-lying road networks.',
          // The Stitch export image
          imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAuuwCazU5HQHIaoXF5mYTVTz81bU2Ll7cC4dVx5GRJYjoOmJrQpwd34QFKwIWKjr5qtjEglcwfqL-QhoUxYMeSEUdITY86E1Ul0aYarkUu3HY5NjZzm2B4qxq8LXsaiP3Pe5m-tlqbeXG4UFGH2dZRTLIFfoiDlmAhbPXu9y_sK6w2XqB822HAI7cJ1kYyZr8Y4HbnW7HNsXOxGSUhz1lvj3KWU6V16dZTS2RH2GEMr2Tw2pYtdjQKoA',
          vectorOverlay: true,
        },
        {
          min: 6,
          max: 8,
          milestone: '6-8s',
          tabName: 'Inundation',
          label: '6-8s • Street-Level Inundation Peak',
          depth: '+0.75m High Water',
          waterStatus: 'Submersion Threshold',
          description: 'Ground floors and basement car park entries risk inundation if plinth barrier elevation is below 60cm.',
          imageUrl:
            'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 8,
          max: 10,
          milestone: '8-10s',
          tabName: 'Protect',
          label: '8-10s • Resilience Measures & Active Dewatering',
          depth: '+0.10m Receding',
          waterStatus: 'Sump Gates Operational',
          description: 'Flood barrier deployment and electrical elevation prevent catastrophic loss. Emergency SOS 112 active.',
          imageUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
      ];
    } else if (disasterType === 'cyclone') {
      return [
        {
          min: 0,
          max: 2,
          milestone: '0-2s',
          tabName: 'TN View',
          label: `0-2s • Bay of Bengal Cyclone Eye Tracking`,
          depth: '120 km/h Gusts',
          waterStatus: 'Outer Spiral Bands',
          description: `Severe cyclonic system approaching ${location.name} coastline (${location.distanceToCoastKm.toFixed(1)} km offshore).`,
          imageUrl:
            'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 2,
          max: 4,
          milestone: '2-4s',
          tabName: 'Intro',
          label: '2-4s • Coastal Landfall & Squall Inflow',
          depth: '155 km/h Peak',
          waterStatus: 'Gale Force Onset',
          description: 'Rapid drop in atmospheric pressure; high-velocity wind turbulence tests building cladding and rooftop structures.',
          imageUrl:
            'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 4,
          max: 6,
          milestone: '4-6s',
          tabName: 'Runoff',
          label: '4-6s • Aerodynamic Uplift & Wind Shear Vectors',
          depth: '+0.80m Storm Surge',
          waterStatus: 'High Wind Dynamic',
          description: 'Rooftop solar panels, unbolted water tanks, and sheet roofs experience critical aerodynamic lift pressures.',
          imageUrl:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: true,
        },
        {
          min: 6,
          max: 8,
          milestone: '6-8s',
          tabName: 'Inundation',
          label: '6-8s • Storm Surge Coastal Encroachment',
          depth: 'Max Gust Velocity',
          waterStatus: 'Power Grid Tripped',
          description: 'Compound storm surge causes seawater intrusion into coastal estuaries and low-lying perimeter roads.',
          imageUrl:
            'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 8,
          max: 10,
          milestone: '8-10s',
          tabName: 'Protect',
          label: '8-10s • Cyclone Preparedness & Structural Shielding',
          depth: 'Winds Subsiding',
          waterStatus: 'Storm Eye Passed',
          description: 'Storm-shutter protection and pre-anchored equipment safeguard property. Follow TNSDMA advisories.',
          imageUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
      ];
    } else {
      // Earthquake
      return [
        {
          min: 0,
          max: 2,
          milestone: '0-2s',
          tabName: 'TN View',
          label: `0-2s • Peninsular Shield Seismic Epicenter`,
          depth: 'P-Wave Arrival',
          waterStatus: 'Bedrock Motion',
          description: `Micro-tremor wave radiating through ${location.seismicZone} Precambrian crystalline bedrock.`,
          imageUrl:
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 2,
          max: 4,
          milestone: '2-4s',
          tabName: 'Intro',
          label: '2-4s • Shear S-Wave Propagation',
          depth: 'Peak Ground Accel',
          waterStatus: 'Lateral Oscillation',
          description: 'Lateral shaking forces transmitted into structural foundations; non-ductile brick infill walls undergo shear stress.',
          imageUrl:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 4,
          max: 6,
          milestone: '4-6s',
          tabName: 'Runoff',
          label: '4-6s • Structural Resonance & Displacement',
          depth: 'Inter-story Drift',
          waterStatus: 'RCC Elastic Range',
          description: 'RCC frames with tie-beams absorb kinetic displacement without brittle collapse as per IS 1893 guidelines.',
          imageUrl:
            'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: true,
        },
        {
          min: 6,
          max: 8,
          milestone: '6-8s',
          tabName: 'Inundation',
          label: '6-8s • Non-Structural Fixture Hazard',
          depth: 'Secondary Tremors',
          waterStatus: 'Masonry Intact',
          description: 'Unanchored parapets and heavy furniture pose the highest domestic hazard during ground vibration.',
          imageUrl:
            'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
        {
          min: 8,
          max: 10,
          milestone: '8-10s',
          tabName: 'Protect',
          label: '8-10s • Safe Evacuation & Gas Shutoff',
          depth: 'Quiescence',
          waterStatus: 'Post-Shock Safe',
          description: 'Drop, Cover & Hold protocol. Turn off main LPG valves and circuit breakers immediately.',
          imageUrl:
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
          vectorOverlay: false,
        },
      ];
    }
  };

  const stages = getStages();
  const currentStage = stages.find((s) => currentTime <= s.max) || stages[stages.length - 1];

  // Play / Pause timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const progressPercent = (currentTime / totalTime) * 100;

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Title & Truth In Labeling Header */}
      <div className="flex flex-col px-1">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">movie_filter</span>
          <span className="text-white font-space font-bold text-base sm:text-lg">
            See What Could Happen Here
          </span>
        </div>
        <span className="text-[#bcc9cd] font-mono text-[11px] mt-0.5">
          Illustrative Disaster Scenario • Scenario-Based Model, Not a Guarantee
        </span>
      </div>

      {/* Player Screen Frame */}
      <div className="relative bg-[#090e1c] border border-[#252a39] rounded-3xl overflow-hidden shadow-2xl">
        {/* Simulation Stage Viewport */}
        <div className="relative w-full h-64 sm:h-72 md:h-80 bg-[#1a1f2e] overflow-hidden flex items-center justify-center">
          {/* Rendered GIS Inundation / Storm Simulation Image */}
          <img
            src={currentStage.imageUrl}
            alt={currentStage.label}
            className="w-full h-full object-cover filter brightness-90 transition-opacity duration-300"
          />

          {/* Dark gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1321] via-transparent to-[#0e1321]/60 pointer-events-none" />

          {/* Dynamic Animated Runoff Vector Arrows overlay if active */}
          {currentStage.vectorOverlay && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full opacity-60" viewBox="0 0 400 200">
                <defs>
                  <marker id="cyanArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#4cd7f6" />
                  </marker>
                </defs>
                <path
                  d="M 50 160 Q 150 120 220 140 T 350 180"
                  fill="transparent"
                  stroke="#4cd7f6"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  markerEnd="url(#cyanArrow)"
                  className="animate-pulse"
                />
                <path
                  d="M 80 180 Q 180 150 260 170 T 380 190"
                  fill="transparent"
                  stroke="#4fdbc8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#cyanArrow)"
                />
              </svg>
            </div>
          )}

          {/* Dynamic Scenario Stage Overlay Label (Top Left) */}
          <div className="absolute top-3 left-3 bg-[#090e1c]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
            <span className="font-mono text-[11px] text-white font-medium">
              {currentStage.label}
            </span>
          </div>

          {/* Simulation HUD Readout Tag (Top Right) */}
          <div className="absolute top-3 right-3 bg-[#090e1c]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[15px]">water_do</span>
            <span className="font-mono text-[11px] font-bold text-white">
              {currentStage.depth}
            </span>
          </div>

          {/* Central Play / Pause Controller Trigger */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            className="absolute w-14 h-14 rounded-full bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] flex items-center justify-center shadow-[0_0_24px_rgba(76,215,246,0.6)] active:scale-95 transition-all cursor-pointer z-20"
          >
            <span className="material-symbols-outlined text-[32px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* In-scene Status Badges (Bottom Left & Right) */}
          <div className="absolute bottom-3 left-3 bg-[#0e1321]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 z-10">
            <span className="material-symbols-outlined text-[#4fdbc8] text-[16px]">waves</span>
            <span className="font-mono text-[11px] font-semibold text-[#71f8e4]">
              {currentStage.waterStatus}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 bg-[#0e1321]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 z-10">
            <span className="material-symbols-outlined text-[#bcc9cd] text-[14px]">schedule</span>
            <span className="font-mono text-[11px] text-white">
              {currentTime < 10 ? '0' : ''}{currentTime.toFixed(1)}s / 10s
            </span>
          </div>
        </div>

        {/* Narrative Sub-Panel */}
        <div className="px-4 py-2.5 bg-[#0e1321] border-b border-[#252a39] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[16px] flex-shrink-0">info</span>
          <p className="text-xs text-[#bcc9cd] truncate">
            {currentStage.description}
          </p>
        </div>

        {/* Scrubber Timeline Bar */}
        <div className="p-4 bg-[#161b2a] flex flex-col space-y-3">
          {/* Interactive Progress Line */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              seekTo(Number((ratio * totalTime).toFixed(1)));
            }}
            className="relative w-full h-2.5 bg-[#252a39] rounded-full cursor-pointer overflow-hidden group"
          >
            <div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#4fdbc8] to-[#4cd7f6] rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 5 Key Milestones Indicators */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {stages.map((stage, idx) => {
              const targetSec = idx * 2 + 1;
              const isActive = currentTime >= stage.min && currentTime <= stage.max;
              return (
                <button
                  key={stage.milestone}
                  type="button"
                  onClick={() => seekTo(targetSec)}
                  className="flex flex-col items-center text-center group transition-all"
                >
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? 'text-[#4cd7f6] font-bold' : 'text-[#869397] group-hover:text-white'
                    }`}
                  >
                    {stage.milestone}
                  </span>
                  <span
                    className={`font-mono text-[9px] truncate w-full ${
                      isActive ? 'text-[#4cd7f6] font-semibold' : 'text-[#869397]/70'
                    }`}
                  >
                    {stage.tabName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
