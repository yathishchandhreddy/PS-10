import React, { useState, useEffect, useMemo } from 'react';
import {
  OFFICIAL_TN_DATASETS,
  DatasetRecord,
  fetchLiveClimateData,
  fetchLiveUsgsEarthquakes,
  LiveClimateQueryResponse,
  LiveSeismicEvent,
  downloadDatasetAsJson,
  downloadDatasetAsCsv
} from '../services/datasetEngine';
import { LocationData } from '../types';

interface DatasetHubProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationData;
}

export const DatasetHub: React.FC<DatasetHubProps> = ({
  isOpen,
  onClose,
  selectedLocation,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<DatasetRecord | null>(OFFICIAL_TN_DATASETS[0]);
  
  // Live API states
  const [isQueryingLiveClimate, setIsQueryingLiveClimate] = useState(false);
  const [liveClimateData, setLiveClimateData] = useState<LiveClimateQueryResponse | null>(null);
  const [isQueryingLiveSeismic, setIsQueryingLiveSeismic] = useState(false);
  const [liveSeismicData, setLiveSeismicData] = useState<LiveSeismicEvent[]>([]);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Trigger live climate check on modal open
  useEffect(() => {
    if (isOpen) {
      handleLiveClimateSync();
      handleLiveSeismicSync();
    }
  }, [isOpen, selectedLocation.lat, selectedLocation.lng]);

  const handleLiveClimateSync = async () => {
    setIsQueryingLiveClimate(true);
    const result = await fetchLiveClimateData(selectedLocation.lat, selectedLocation.lng);
    setLiveClimateData(result);
    setIsQueryingLiveClimate(false);
  };

  const handleLiveSeismicSync = async () => {
    setIsQueryingLiveSeismic(true);
    const result = await fetchLiveUsgsEarthquakes();
    setLiveSeismicData(result);
    setIsQueryingLiveSeismic(false);
  };

  const handleDownloadJson = (d: DatasetRecord) => {
    downloadDatasetAsJson(d);
    triggerToast(`Downloaded ${d.id}.json successfully`);
  };

  const handleDownloadCsv = (d: DatasetRecord) => {
    downloadDatasetAsCsv(d);
    triggerToast(`Exported ${d.id}.csv successfully`);
  };

  const triggerToast = (msg: string) => {
    setDownloadSuccessToast(msg);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  const categories = [
    { id: 'all', label: 'All Datasets', icon: 'database' },
    { id: 'rainfall_climate', label: 'Rainfall & Climate', icon: 'water_drop' },
    { id: 'flood_inundation', label: 'Flood & Inundation', icon: 'flood' },
    { id: 'cyclone_wind', label: 'Cyclones & Wind', icon: 'cyclone' },
    { id: 'seismic', label: 'Seismic & Faults', icon: 'volcano' },
    { id: 'boundaries', label: 'TN Boundaries', icon: 'map' },
    { id: 'elevation', label: 'Elevation & DEM', icon: 'terrain' },
    { id: 'crop_yield', label: 'Crop Production', icon: 'agriculture' },
    { id: 'market_prices', label: 'Mandi Prices', icon: 'storefront' },
    { id: 'crop_insurance', label: 'PMFBY Rules', icon: 'verified_user' },
    { id: 'land_use', label: 'Cadastral & Land Use', icon: 'domain' },
  ];

  const filteredDatasets = useMemo(() => {
    return OFFICIAL_TN_DATASETS.filter((d) => {
      const matchCat = activeCategory === 'all' || d.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.sourceAuthority.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8F0] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between gap-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">dataset</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-space font-extrabold text-lg sm:text-xl text-white">
                  Autonomous Data Discovery &amp; Official Datasets Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Verified Gov/Open APIs
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Tamil Nadu meteorological, flood hazard, cyclone tracks, seismic, elevation, crop yield, and PMFBY data.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live API Telemetry Strip */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap font-mono text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>Target: <strong className="text-[#1E293B]">{selectedLocation.name}</strong> ({selectedLocation.lat.toFixed(3)}°, {selectedLocation.lng.toFixed(3)}°)</span>
            </div>

            {liveClimateData && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0D9488]">thermostat</span>
                <span>Live Temp: <strong className="text-[#1E293B]">{liveClimateData.currentTempC}°C</strong></span>
                <span>· Rain: <strong className="text-[#059669]">{liveClimateData.currentPrecipitationMm} mm</strong></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLiveClimateSync}
              disabled={isQueryingLiveClimate}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#059669] text-[11px] font-mono text-[#1E293B] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[13px] text-[#059669]">
                {isQueryingLiveClimate ? 'sync' : 'refresh'}
              </span>
              <span>{isQueryingLiveClimate ? 'Querying Open-Meteo...' : 'Refresh Climate API'}</span>
            </button>

            <button
              type="button"
              onClick={handleLiveSeismicSync}
              disabled={isQueryingLiveSeismic}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D9488] text-[11px] font-mono text-[#1E293B] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[13px] text-[#0D9488]">
                {isQueryingLiveSeismic ? 'sync' : 'satellite_alt'}
              </span>
              <span>{isQueryingLiveSeismic ? 'Querying USGS...' : 'Sync USGS Seismicity'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Categories & Dataset Grid vs Selected Detail) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Category Pills & List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[#E2E8F0] flex flex-col bg-[#FAFAFA] overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-[#E2E8F0] bg-white">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search IMD, ISRO, PMFBY datasets..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#059669] font-sans text-[#1E293B]"
                />
              </div>
            </div>

            {/* Category Ribbon */}
            <div className="p-2 border-b border-[#E2E8F0] flex gap-1.5 overflow-x-auto no-scrollbar bg-white">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    activeCategory === c.id
                      ? 'bg-[#059669] text-white font-bold shadow-2xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Datasets List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredDatasets.map((d) => {
                const isSelected = selectedDataset?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDataset(d)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#059669] shadow-sm ring-1 ring-[#059669]/20'
                        : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-bold border border-[#A7F3D0]">
                        {d.format}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {(d.sizeKb / 1024).toFixed(1)} MB · {d.recordsCount} rows
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1E293B] font-space line-clamp-1">
                      {d.title}
                    </h4>

                    <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1">
                      {d.summary}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1.5 border-t border-slate-100">
                      <span className="truncate max-w-[170px]">{d.sourceAuthority.split(',')[0]}</span>
                      <span className="text-[#059669] font-semibold">{d.status.toUpperCase()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Dataset Inspection & Actions */}
          <div className="flex-1 flex flex-col bg-white overflow-y-auto p-4 sm:p-6 space-y-5">
            {selectedDataset ? (
              <>
                {/* Dataset Title Bar & Download CTAs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#059669] font-mono text-[10px] font-bold border border-emerald-300">
                        {selectedDataset.category.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px]">
                        Format: {selectedDataset.format}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">
                        Verified Govt / Open Source
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-space text-[#1E293B]">
                      {selectedDataset.title}
                    </h3>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadJson(selectedDataset)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-space text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Download JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCsv(selectedDataset)}
                      className="px-3 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-space text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">table_view</span>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Authority &amp; Publisher
                    </span>
                    <span className="text-xs font-semibold text-[#1E293B] block mt-1">
                      {selectedDataset.sourceAuthority}
                    </span>
                    <a
                      href={selectedDataset.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#059669] hover:underline flex items-center gap-1 mt-1 font-mono"
                    >
                      <span>Official Source Portal</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Coverage Period &amp; Retrieval
                    </span>
                    <span className="text-xs font-semibold text-[#1E293B] block mt-1">
                      {selectedDataset.coveragePeriod}
                    </span>
                    <span className="text-[11px] text-[#64748B] block mt-1 font-mono">
                      Retrieved: {selectedDataset.retrievalDate}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Resolution &amp; Measurement Units
                    </span>
                    <span className="text-xs font-semibold text-[#1E293B] block mt-1">
                      {selectedDataset.geographicResolution}
                    </span>
                    <span className="text-[11px] text-[#0D9488] block mt-1 font-mono">
                      Units: {selectedDataset.units}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Data Licensing
                    </span>
                    <span className="text-xs font-semibold text-[#1E293B] block mt-1">
                      {selectedDataset.licence}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Cache State &amp; Size
                    </span>
                    <span className="text-xs font-semibold text-[#059669] block mt-1">
                      Cached locally ({(selectedDataset.sizeKb / 1024).toFixed(2)} MB)
                    </span>
                    <span className="text-[11px] text-[#64748B] block font-mono">
                      {selectedDataset.recordsCount} validated records
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] block">
                      Direct API Endpoint
                    </span>
                    <span className="text-[11px] font-mono text-[#1E293B] block mt-1 truncate">
                      {selectedDataset.apiEndpoint || 'Integrated in RiskLens Cache'}
                    </span>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
                  <strong className="block font-space text-emerald-900">Catastrophe &amp; Spatial Intelligence Scope:</strong>
                  <p className="leading-relaxed">{selectedDataset.summary}</p>
                </div>

                {/* Preview Sample Rows Table */}
                {selectedDataset.sampleData && selectedDataset.sampleData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-space text-[#1E293B] uppercase tracking-wider">
                        Dataset Sample Records Preview
                      </h4>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Showing {selectedDataset.sampleData.length} records
                      </span>
                    </div>

                    <div className="border border-[#E2E8F0] rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                          <tr>
                            {Object.keys(selectedDataset.sampleData[0]).map((key) => (
                              <th key={key} className="p-2.5 font-bold capitalize">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {selectedDataset.sampleData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              {Object.values(row).map((val: any, cidx) => (
                                <td key={cidx} className="p-2.5 text-[#1E293B] whitespace-nowrap">
                                  {typeof val === 'boolean'
                                    ? val ? 'Yes' : 'No'
                                    : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Live Seismicity Integration (if seismic dataset selected) */}
                {selectedDataset.category === 'seismic' && liveSeismicData.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-space text-[#1E293B]">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Live USGS Regional Seismicity Feed (South India Corridor)</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64748B]">Real-Time Feed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveSeismicData.map((ev) => (
                        <div key={ev.id} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-amber-950 font-space">{ev.place}</strong>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] font-bold">
                              M {ev.magnitude.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-800 font-mono">
                            Depth: {ev.depthKm} km · {ev.lat.toFixed(2)}°N, {ev.lng.toFixed(2)}°E · {ev.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                Select a dataset from the catalogue to view source metadata and download.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#059669]">verified</span>
            <span>All 10 official Tamil Nadu catastrophe &amp; agricultural datasets verified and cached.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Data Hub
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-slate-900 text-white border border-emerald-500 rounded-2xl px-4 py-3 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#059669] text-[18px]">check_circle</span>
          <span>{downloadSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
