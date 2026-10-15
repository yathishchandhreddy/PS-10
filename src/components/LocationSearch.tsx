import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '../types';
import { TN_REFERENCE_LOCATIONS } from '../services/dataSources';

interface LocationSearchProps {
  selectedLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedLocation,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter reference locations based on query (by name or district)
  const filteredSuggestions = TN_REFERENCE_LOCATIONS.filter((loc) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q)
    );
  });

  // Browser Geolocation API
  const handleUseCurrentLocation = () => {
    setGeoError(null);

    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const { latitude, longitude } = pos.coords;

        // Check if user is in Tamil Nadu bounds approximately
        const isTamilNadu =
          latitude >= 7.8 && latitude <= 14.0 && longitude >= 76.0 && longitude <= 80.6;

        const newLoc: LocationData = {
          name: isTamilNadu
            ? `Current GPS Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`
            : `GPS Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`,
          district: isTamilNadu ? 'Tamil Nadu' : 'Outside TN Boundary',
          lat: latitude,
          lng: longitude,
          elevationMeters: 12, // default ground estimate
          distanceToCoastKm: Math.abs(longitude - 80.2) * 111,
          distanceToWaterbodyM: 1000,
          seismicZone: 'Zone III (Moderate)',
          isUserLocation: true,
        };

        onSelectLocation(newLoc);
        setQuery(newLoc.name);
        setIsOpen(false);
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Unable to retrieve location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please select a Tamil Nadu location from the list or enter coordinates manually.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable from your device GPS.';
            break;
          case err.TIMEOUT:
            msg = 'Location request timed out. Please try again or select from the list.';
            break;
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Bar with pill styling from Stitch specification */}
      <div className="relative flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4cd7f6]">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search Tamil Nadu location (e.g. Velachery, Chennai, Coimbatore, Karur)..."
            className="w-full h-14 pl-12 pr-10 rounded-full bg-[#161b2a]/95 border border-[#303444] focus:border-[#4cd7f6] focus:ring-2 focus:ring-[#4cd7f6]/20 text-white text-sm placeholder-[#869397] outline-none shadow-xl transition-all"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(true);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#869397] hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Use My Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="w-full sm:w-auto h-14 px-5 rounded-full bg-[#1a1f2e] border border-[#303444] hover:border-[#4cd7f6] text-[#dee2f6] text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {geoLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#4cd7f6] border-t-transparent rounded-full animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">my_location</span>
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation Error Alert if permission denied */}
      {geoError && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#93000a]/30 border border-[#ffb4ab]/40 flex items-start gap-2 text-xs text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">location_off</span>
          <div className="flex-1">
            <strong>Location Notice:</strong> {geoError}
          </div>
          <button onClick={() => setGeoError(null)} className="text-[#ffb4ab] hover:text-white">✕</button>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#161b2a] border border-[#303444] rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          <div className="p-2.5 bg-[#0e1321] border-b border-[#252a39] flex items-center justify-between text-[11px] font-mono text-[#869397]">
            <span>VERIFIED TAMIL NADU REFERENCE SITES ({filteredSuggestions.length})</span>
            <span>Survey of India &amp; TNSDMA</span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#869397]">
              No exact match found for "{query}". Try Chennai, Coimbatore, Madurai, Karur, Cuddalore, or enter coordinates on the map.
            </div>
          ) : (
            <div className="divide-y divide-[#252a39]">
              {filteredSuggestions.map((loc) => {
                const isSelected = selectedLocation.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      setQuery(loc.name);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1a1f2e] transition-colors ${
                      isSelected ? 'bg-[#4cd7f6]/10 text-white' : 'text-[#dee2f6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#252a39] flex items-center justify-center text-[#4cd7f6] flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{loc.name}</span>
                          {loc.elevationMeters <= 8 && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#93000a]/40 text-[#ffb4ab]">
                              Low MSL
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#869397]">
                          {loc.district} District · {loc.elevationMeters}m MSL · {loc.seismicZone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] text-[#4fdbc8]">
                      {loc.lat.toFixed(3)}°N, {loc.lng.toFixed(3)}°E
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
