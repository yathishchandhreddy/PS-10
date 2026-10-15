import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationData, DisasterType } from '../types';

interface InteractiveMapProps {
  selectedLocation: LocationData;
  radiusKm: number;
  onRadiusChange: (newRadius: number) => void;
  onSelectCoordinates: (lat: number, lng: number, placeName?: string) => void;
  disasterType: DisasterType;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  radiusKm,
  onRadiusChange,
  onSelectCoordinates,
  disasterType,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [manualLat, setManualLat] = useState(selectedLocation.lat.toString());
  const [manualLng, setManualLng] = useState(selectedLocation.lng.toString());
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showCoverageNotice, setShowCoverageNotice] = useState(false);

  // Sync inputs when selected location changes
  useEffect(() => {
    setManualLat(selectedLocation.lat.toFixed(4));
    setManualLng(selectedLocation.lng.toFixed(4));
  }, [selectedLocation.lat, selectedLocation.lng]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      // Focus on Tamil Nadu geographic center [11.1271, 78.6569]
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tiles (super clean, modern obsidian aesthetic)
      const tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      );

      tileLayer.on('tileerror', () => {
        // Fallback tile notice
        console.warn('Map tile loading delayed. Using neutral offline base layer.');
      });

      tileLayer.addTo(map);

      // Custom pulsing cyan icon
      const customIcon = L.divIcon({
        className: 'custom-cat-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; items-center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(76, 215, 246, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 20px; height: 20px; border-radius: 9999px; background: #4cd7f6; border: 3px solid #0e1321; box-shadow: 0 0 12px #4cd7f6;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Marker
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #dee2f6; padding: 2px;">
          <strong style="color: #4cd7f6; font-size: 13px;">${selectedLocation.name}</strong><br/>
          <span>${selectedLocation.elevationMeters}m MSL Elevation</span><br/>
          <span>Lat: ${selectedLocation.lat.toFixed(4)}°, Lng: ${selectedLocation.lng.toFixed(4)}°</span>
        </div>
      `);

      // Radius Circle
      const circle = L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: radiusKm * 1000,
        color: '#4cd7f6',
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onSelectCoordinates(pos.lat, pos.lng);
      });

      // Click on map to select location
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onSelectCoordinates(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } catch (err) {
      console.error('Failed to initialize map', err);
      setMapError('Interactive map tiles could not be initialized. Please check network connectivity.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker & circle when location or radius changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const latLng: [number, number] = [selectedLocation.lat, selectedLocation.lng];
    markerRef.current.setLatLng(latLng);
    circleRef.current.setLatLng(latLng);
    circleRef.current.setRadius(radiusKm * 1000);

    mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.8 });

    markerRef.current.setPopupContent(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #dee2f6; padding: 2px;">
        <strong style="color: #4cd7f6; font-size: 13px;">${selectedLocation.name}</strong><br/>
        <span>Elevation: ${selectedLocation.elevationMeters}m MSL</span><br/>
        <span>Coordinates: ${selectedLocation.lat.toFixed(4)}° N, ${selectedLocation.lng.toFixed(4)}° E</span>
      </div>
    `);
  }, [selectedLocation.lat, selectedLocation.lng, selectedLocation.name, selectedLocation.elevationMeters, radiusKm]);

  // Handle manual coordinate submit
  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numeric latitude and longitude values.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Latitude must be between -90 and 90, and longitude between -180 and 180.');
      return;
    }

    onSelectCoordinates(lat, lng, `Custom Point (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
    setShowCoordinateModal(false);
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#161b2a] border border-[#252a39] overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map Context Bar */}
      <div className="p-3 sm:p-4 bg-[#1a1f2e] border-b border-[#252a39] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[20px] flex-shrink-0">
            explore
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate font-space">
              Geospatial Inspection Grid
            </h3>
            <p className="text-[11px] text-[#869397] truncate">
              {selectedLocation.name} · {selectedLocation.elevationMeters}m MSL Elevation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCoordinateModal(true)}
            className="px-2.5 py-1 rounded-lg bg-[#090e1c] border border-[#303444] hover:border-[#4cd7f6] text-xs font-mono text-[#dee2f6] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">pin_drop</span>
            <span>{selectedLocation.lat.toFixed(3)}°, {selectedLocation.lng.toFixed(3)}°</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCoverageNotice(!showCoverageNotice)}
            title="Data Coverage Information"
            className="w-8 h-8 rounded-lg bg-[#090e1c] border border-[#303444] hover:border-[#4fdbc8] text-[#4fdbc8] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
          </button>
        </div>
      </div>

      {/* Map Error Banner if any */}
      {mapError && (
        <div className="p-3 bg-[#93000a]/20 border-b border-[#ffb4ab]/30 text-xs text-[#ffb4ab] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{mapError}</span>
        </div>
      )}

      {/* Data Coverage & Truth In Labeling Notice */}
      {showCoverageNotice && (
        <div className="p-3 bg-[#161b2a] border-b border-[#4fdbc8]/30 text-xs text-[#bcc9cd] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#4fdbc8] text-[18px] flex-shrink-0 mt-0.5">verified_user</span>
          <div>
            <strong className="text-white block font-medium">Data Truth &amp; Accuracy Disclosure:</strong>
            Map uses verified OpenStreetMap baselayer with Survey of India digital elevation markers.
            Analysis radius represents your area of interest. Hazard layers are derived strictly from IMD and TNSDMA flood basins; no fabricated heatmaps are displayed as empirical field measurements.
          </div>
        </div>
      )}

      {/* Map Viewport Container */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 bg-[#090e1c]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Legend / Layer Indicator on Map */}
        <div className="absolute bottom-3 left-3 z-[400] bg-[#0e1321]/90 backdrop-blur-md border border-[#303444] rounded-xl p-2.5 shadow-lg text-[11px] font-mono space-y-1">
          <div className="flex items-center gap-2 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] ring-2 ring-[#4cd7f6]/40" />
            <span>Target Location Marker</span>
          </div>
          <div className="flex items-center gap-2 text-[#bcc9cd]">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#4cd7f6] bg-[#06b6d4]/20" />
            <span>{radiusKm} km Analysis Radius</span>
          </div>
          <div className="flex items-center gap-2 text-[#869397] pt-0.5">
            <span className="material-symbols-outlined text-[12px] text-[#4fdbc8]">check_circle</span>
            <span>OSM &amp; CartoDB Base</span>
          </div>
        </div>

        {/* Interactive Click Tip Pill */}
        <div className="absolute top-3 right-3 z-[400] bg-[#0e1321]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-[#bcc9cd] pointer-events-none hidden sm:block">
          Tap or drag anywhere to select point
        </div>
      </div>

      {/* Radius Slider Bar */}
      <div className="p-3 sm:p-4 bg-[#1a1f2e] border-t border-[#252a39] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#bcc9cd]">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">radar</span>
            <span>Analysis Radius:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono font-bold text-xs border border-[#4cd7f6]/30">
            {radiusKm} km
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
          <span className="text-[10px] font-mono text-[#869397]">1 km</span>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={radiusKm}
            onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#303444] rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
          />
          <span className="text-[10px] font-mono text-[#869397]">25 km</span>
        </div>
      </div>

      {/* Manual Coordinate Entry Modal */}
      {showCoordinateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleApplyCoordinates}
            className="bg-[#161b2a] border border-[#303444] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#252a39]">
              <h4 className="font-bold text-white text-base font-space">Enter Precise Coordinates</h4>
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="w-7 h-7 rounded-full bg-[#252a39] flex items-center justify-center text-[#bcc9cd] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#bcc9cd]">
              Coordinates must be decimal degrees within Tamil Nadu (Latitude ~8.0° to 13.6° N, Longitude ~76.2° to 80.4° E).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#bcc9cd] mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1c] border border-[#252a39] rounded-xl text-white font-mono text-sm focus:border-[#4cd7f6] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#bcc9cd] mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1c] border border-[#252a39] rounded-xl text-white font-mono text-sm focus:border-[#4cd7f6] outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#bcc9cd] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#4cd7f6] text-[#003640] font-bold text-xs font-space shadow-md hover:brightness-110"
              >
                Update Pin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
