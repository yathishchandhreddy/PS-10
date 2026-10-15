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
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<LocationData[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Filter local reference locations first (instant response)
  const localSuggestions = TN_REFERENCE_LOCATIONS.filter((loc) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q)
    );
  });

  // Debounced Nominatim Geocoding for Tamil Nadu
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed + ', Tamil Nadu'
        )}&countrycodes=in&viewbox=76.0,13.6,80.5,8.0&bounded=0&limit=5`;

        const resp = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: LocationData[] = data.map((item: any) => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const distCoast = Math.max(0.5, Math.abs(lng - 80.25) * 111);

              return {
                name: item.display_name.split(',')[0] + ', ' + (item.display_name.split(',')[1]?.trim() || 'TN'),
                district: item.address?.state_district || item.address?.county || 'Tamil Nadu',
                lat,
                lng,
                elevationMeters: distCoast < 5 ? 7 : Math.round(distCoast * 1.8 + 10),
                distanceToCoastKm: distCoast,
                distanceToWaterbodyM: 850,
                seismicZone: lat > 11.0 ? 'Zone III (Moderate)' : 'Zone II (Low)',
                isUserLocation: false,
              };
            });
            setOnlineResults(mapped);
          } else {
            setOnlineResults([]);
          }
        }
      } catch (err) {
        console.warn('Online geocoding fallback.', err);
        setOnlineResults([]);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const combinedSuggestions = [...onlineResults, ...localSuggestions].filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          Math.abs(t.lat - item.lat) < 0.01 && Math.abs(t.lng - item.lng) < 0.01
      )
  );

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

        const isTamilNadu =
          latitude >= 7.8 && latitude <= 14.0 && longitude >= 76.0 && longitude <= 80.6;

        const newLoc: LocationData = {
          name: isTamilNadu
            ? `My Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`
            : `GPS Location (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`,
          district: isTamilNadu ? 'Tamil Nadu' : 'Outside TN Boundary',
          lat: latitude,
          lng: longitude,
          elevationMeters: 10,
          distanceToCoastKm: Math.abs(longitude - 80.25) * 111,
          distanceToWaterbodyM: 950,
          seismicZone: latitude > 11.0 ? 'Zone III (Moderate)' : 'Zone II (Low)',
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
            msg = 'Location permission was denied. Please select from the suggestions or enter coordinates on the map.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable from your device GPS.';
            break;
          case err.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Bar & Geolocation Button */}
      <div className="relative flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#059669]">
            {isSearchingOnline ? (
              <div className="w-4 h-4 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[22px]">search</span>
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search city, district, town, or pincode (e.g. Chennai, Coimbatore, Karur, 600042)..."
            className="w-full h-14 pl-12 pr-10 rounded-full bg-white border border-[#CBD5E1] focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 text-[#1E293B] text-sm placeholder-[#94A3B8] outline-none shadow-sm transition-all font-sans"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOnlineResults([]);
                setIsOpen(true);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#1E293B]"
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
          className="w-full sm:w-auto h-14 px-5 rounded-full bg-white border border-[#CBD5E1] hover:border-[#059669] hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          {geoLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[#0D9488] text-[20px]">my_location</span>
              <span>Use My Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation Alert Notice */}
      {geoError && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-start gap-2 text-xs text-[#DC2626]">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">location_off</span>
          <div className="flex-1">
            <strong>Location Notice:</strong> {geoError}
          </div>
          <button onClick={() => setGeoError(null)} className="text-[#DC2626] hover:text-[#991B1B]">✕</button>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          <div className="p-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>
              {isSearchingOnline ? 'QUERYING OSM NOMINATIM...' : `LOCATION SUGGESTIONS (${combinedSuggestions.length})`}
            </span>
            <span>Tamil Nadu GIS</span>
          </div>

          {combinedSuggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#64748B]">
              No matching locations found for "{query}". Try Chennai, Coimbatore, Madurai, Karur, Cuddalore, or click on the map.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {combinedSuggestions.map((loc, idx) => {
                const isSelected =
                  Math.abs(selectedLocation.lat - loc.lat) < 0.001 &&
                  Math.abs(selectedLocation.lng - loc.lng) < 0.001;
                return (
                  <button
                    key={`${loc.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      setQuery(loc.name);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#ECFDF5] text-[#059669]' : 'text-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#0D9488] flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-2">
                          <span className="truncate">{loc.name}</span>
                          {loc.elevationMeters <= 8 && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#FEE2E2] text-[#DC2626] font-medium flex-shrink-0">
                              Low MSL
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          {loc.district} · {loc.elevationMeters}m MSL · {loc.seismicZone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] text-[#059669] font-medium flex-shrink-0 ml-2">
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
