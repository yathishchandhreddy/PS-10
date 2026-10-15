import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { LocationData, DisasterType } from '../types';

interface InteractiveMapProps {
  selectedLocation: LocationData;
  radiusKm: number;
  onRadiusChange: (newRadius: number) => void;
  onSelectCoordinates: (lat: number, lng: number, placeName?: string) => void;
  disasterType: DisasterType;
  userRole?: string;
}

type BaseMapType = 'osm' | 'topographic' | 'satellite';

export interface CadastralBuilding {
  id: string;
  name: string;
  type: string;
  tier: 'high' | 'moderate' | 'low';
  color: string;
  floors: number;
  plinthCm: number;
  inundationExposureM: number;
  coordinates: [number, number][];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  radiusKm,
  onRadiusChange,
  onSelectCoordinates,
  disasterType,
  userRole = 'Admin / Analyst',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const buildingLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // GIS Layer Control Panel state
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapType>('osm');
  const [layerRadiusEnabled, setLayerRadiusEnabled] = useState(true);

  // Building Colors (Admin Dashboard) state
  const [layerBuildingsEnabled, setLayerBuildingsEnabled] = useState(true);
  const [buildingColorFilter, setBuildingColorFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<CadastralBuilding | null>(null);

  // Tile error tracking
  const [tileErrorCount, setTileErrorCount] = useState<number>(0);
  const [mapError, setMapError] = useState<string | null>(null);

  const [manualLat, setManualLat] = useState(selectedLocation.lat.toString());
  const [manualLng, setManualLng] = useState(selectedLocation.lng.toString());
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);

  // Opening animation states
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<string>('ACQUIRING GEODETIC LOCK');

  useEffect(() => {
    setIsScanning(true);
    setScanStatus(`CALIBRATING ${selectedLocation.name.toUpperCase()}`);

    const t1 = setTimeout(() => {
      setScanStatus('ANALYZING BASIN ELEVATION & RUNOFF');
    }, 1000);

    const t2 = setTimeout(() => {
      setScanStatus('TARGET LOCKED');
    }, 2000);

    const t3 = setTimeout(() => {
      setIsScanning(false);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const triggerManualScan = () => {
    setIsScanning(true);
    setScanStatus(`SCANNING ${selectedLocation.name.toUpperCase()}`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 12, {
        duration: 1.5,
      });
    }
    setTimeout(() => {
      setScanStatus('TARGET LOCKED');
    }, 1600);
    setTimeout(() => {
      setIsScanning(false);
    }, 2400);
  };

  const handleResetToTamilNadu = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([11.1271, 78.6569], 7.5, { duration: 1.2 });
    }
  };

  useEffect(() => {
    setManualLat(selectedLocation.lat.toFixed(4));
    setManualLng(selectedLocation.lng.toFixed(4));
  }, [selectedLocation.lat, selectedLocation.lng]);

  // Generate cadastral building footprints around active location with risk color coding
  const buildings: CadastralBuilding[] = useMemo(() => {
    const lat = selectedLocation.lat;
    const lng = selectedLocation.lng;

    // Building definitions around center coordinate
    const template = [
      // 4 High Risk Buildings (RED: #DC2626)
      {
        id: 'BLD-101',
        name: 'Plot #101 Commercial Annex',
        type: 'Commercial Ground Floor',
        tier: 'high' as const,
        color: '#DC2626',
        floors: 1,
        plinthCm: 15,
        inundationExposureM: 0.95,
        dLat: 0.0014,
        dLng: 0.0016,
        w: 0.00045,
        h: 0.00035,
      },
      {
        id: 'BLD-102',
        name: 'Plot #104 Semi-Pucca Row',
        type: 'Semi-Pucca Brick',
        tier: 'high' as const,
        color: '#DC2626',
        floors: 1,
        plinthCm: 20,
        inundationExposureM: 0.88,
        dLat: 0.0009,
        dLng: -0.0018,
        w: 0.0004,
        h: 0.0003,
      },
      {
        id: 'BLD-103',
        name: 'Plot #108 Low-Plinth Residential',
        type: 'Residential Ground Floor',
        tier: 'high' as const,
        color: '#DC2626',
        floors: 1,
        plinthCm: 10,
        inundationExposureM: 1.05,
        dLat: -0.0012,
        dLng: 0.0019,
        w: 0.00042,
        h: 0.00032,
      },
      {
        id: 'BLD-104',
        name: 'Plot #112 Logistics Warehouse',
        type: 'Industrial Metal Shed',
        tier: 'high' as const,
        color: '#DC2626',
        floors: 1,
        plinthCm: 25,
        inundationExposureM: 0.82,
        dLat: 0.0022,
        dLng: -0.0009,
        w: 0.0005,
        h: 0.00038,
      },

      // 5 Moderate Risk Buildings (AMBER: #D97706)
      {
        id: 'BLD-201',
        name: 'Plot #201 Residential Apartments',
        type: 'Residential RCC (G+2)',
        tier: 'moderate' as const,
        color: '#D97706',
        floors: 3,
        plinthCm: 35,
        inundationExposureM: 0.45,
        dLat: 0.0005,
        dLng: 0.0024,
        w: 0.00048,
        h: 0.00035,
      },
      {
        id: 'BLD-202',
        name: 'Plot #205 Standalone Villa',
        type: 'Independent Villa',
        tier: 'moderate' as const,
        color: '#D97706',
        floors: 2,
        plinthCm: 40,
        inundationExposureM: 0.38,
        dLat: -0.0008,
        dLng: 0.0011,
        w: 0.00038,
        h: 0.0003,
      },
      {
        id: 'BLD-203',
        name: 'Plot #209 Community Health Center',
        type: 'Civic Healthcare Facility',
        tier: 'moderate' as const,
        color: '#D97706',
        floors: 2,
        plinthCm: 42,
        inundationExposureM: 0.35,
        dLat: 0.0019,
        dLng: -0.0022,
        w: 0.00045,
        h: 0.00032,
      },
      {
        id: 'BLD-204',
        name: 'Plot #214 Branch Commercial Bank',
        type: 'Commercial RCC',
        tier: 'moderate' as const,
        color: '#D97706',
        floors: 2,
        plinthCm: 38,
        inundationExposureM: 0.42,
        dLat: -0.0019,
        dLng: -0.0015,
        w: 0.00042,
        h: 0.0003,
      },
      {
        id: 'BLD-205',
        name: 'Plot #218 Multi-Unit Housing',
        type: 'Residential RCC',
        tier: 'moderate' as const,
        color: '#D97706',
        floors: 2,
        plinthCm: 45,
        inundationExposureM: 0.32,
        dLat: -0.0009,
        dLng: -0.0028,
        w: 0.0004,
        h: 0.0003,
      },

      // 4 Resilient / Low Risk Buildings (GREEN: #059669)
      {
        id: 'BLD-301',
        name: 'Plot #301 Elevated RCC Residence',
        type: 'Engineered Pucca (60cm Plinth)',
        tier: 'low' as const,
        color: '#059669',
        floors: 3,
        plinthCm: 60,
        inundationExposureM: 0.12,
        dLat: -0.0021,
        dLng: 0.0004,
        w: 0.00048,
        h: 0.00036,
      },
      {
        id: 'BLD-302',
        name: 'Plot #305 Tech Office Substation',
        type: 'Engineered Infrastructure',
        tier: 'low' as const,
        color: '#059669',
        floors: 4,
        plinthCm: 75,
        inundationExposureM: 0.08,
        dLat: 0.0028,
        dLng: 0.0021,
        w: 0.00052,
        h: 0.0004,
      },
      {
        id: 'BLD-303',
        name: 'Plot #310 Municipal Disaster Shelter',
        type: 'Certified Cyclone/Flood Shelter',
        tier: 'low' as const,
        color: '#059669',
        floors: 3,
        plinthCm: 80,
        inundationExposureM: 0.05,
        dLat: -0.0006,
        dLng: -0.0009,
        w: 0.00045,
        h: 0.00035,
      },
      {
        id: 'BLD-304',
        name: 'Plot #315 Certified Resilient Home',
        type: 'RCC with Sump Non-Return Valve',
        tier: 'low' as const,
        color: '#059669',
        floors: 2,
        plinthCm: 65,
        inundationExposureM: 0.1,
        dLat: 0.0016,
        dLng: -0.0008,
        w: 0.0004,
        h: 0.00032,
      },
    ];

    return template.map((t) => {
      const bLat = lat + t.dLat;
      const bLng = lng + t.dLng;
      // 4 rectangle corner coordinates
      const coords: [number, number][] = [
        [bLat, bLng],
        [bLat, bLng + t.w],
        [bLat + t.h, bLng + t.w],
        [bLat + t.h, bLng],
      ];

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        tier: t.tier,
        color: t.color,
        floors: t.floors,
        plinthCm: t.plinthCm,
        inundationExposureM: t.inundationExposureM,
        coordinates: coords,
      };
    });
  }, [selectedLocation.lat, selectedLocation.lng]);

  const buildingCounts = useMemo(() => {
    return {
      total: buildings.length,
      high: buildings.filter((b) => b.tier === 'high').length,
      moderate: buildings.filter((b) => b.tier === 'moderate').length,
      low: buildings.filter((b) => b.tier === 'low').length,
    };
  }, [buildings]);

  // Base Map Configurations
  const getTileConfig = (type: BaseMapType) => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics | RiskLens TN',
          maxZoom: 18,
          subdomains: [] as string[],
        };
      case 'topographic':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style &copy; OpenTopoMap',
          maxZoom: 17,
          subdomains: ['a', 'b', 'c'],
        };
      case 'osm':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: [] as string[],
        };
    }
  };

  const createTileLayer = useCallback((type: BaseMapType): L.TileLayer => {
    const config = getTileConfig(type);
    const options: L.TileLayerOptions = {
      maxZoom: config.maxZoom,
      attribution: config.attribution,
    };
    if (config.subdomains.length > 0) {
      options.subdomains = config.subdomains;
    }

    const layer = L.tileLayer(config.url, options);

    layer.on('tileerror', (error) => {
      console.warn('Map tile failed to load:', error);
      setTileErrorCount((prev) => prev + 1);
    });

    layer.on('load', () => {
      setTileErrorCount(0);
      setMapError(null);
    });

    return layer;
  }, []);

  const handleRetryTiles = () => {
    setTileErrorCount(0);
    setMapError(null);
    if (tileLayerRef.current) {
      tileLayerRef.current.redraw();
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocation.lat || 11.1271, selectedLocation.lng || 78.6569],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.attribution({ position: 'bottomright' }).addTo(map);

      // Base tile layer
      const initialTileLayer = createTileLayer(activeBaseMap);
      initialTileLayer.addTo(map);
      tileLayerRef.current = initialTileLayer;

      // Cadastral Building Colors LayerGroup
      const bldGroup = L.layerGroup().addTo(map);
      buildingLayerGroupRef.current = bldGroup;

      // Cyan Target Location Pin
      const customIcon = L.divIcon({
        className: 'custom-cat-pin',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(14, 165, 233, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid rgba(13, 148, 136, 0.8); animation: pulse 1.5s ease-in-out infinite;"></div>
            <div style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background: #0EA5E9; border: 3px solid #FFFFFF; box-shadow: 0 2px 10px rgba(14, 165, 233, 0.5);"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #1E293B; padding: 2px; min-width: 170px;">
          <strong style="color: #059669; font-size: 13px; display: block; margin-bottom: 2px;">${selectedLocation.name}</strong>
          <span style="color: #64748B; display: block;">Elevation: ${selectedLocation.elevationMeters}m MSL</span>
          <span style="color: #64748B; font-family: monospace; font-size: 11px; display: block; margin-top: 2px;">${selectedLocation.lat.toFixed(4)}° N, ${selectedLocation.lng.toFixed(4)}° E</span>
          <span style="color: #0EA5E9; font-size: 10px; display: block; margin-top: 4px; font-weight: 600;">Drag pin to update location</span>
        </div>
      `);

      // Selected Analysis Radius Circle
      const circle = L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: radiusKm * 1000,
        color: '#0EA5E9',
        fillColor: '#0EA5E9',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '5, 5',
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onSelectCoordinates(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onSelectCoordinates(lat, lng);
      });

      setTimeout(() => {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }, 200);

      map.invalidateSize();
      const tResize = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      const handleWindowResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleWindowResize);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      return () => {
        clearTimeout(tResize);
        window.removeEventListener('resize', handleWindowResize);
      };
    } catch (err) {
      console.error('Failed to initialize map', err);
      setMapError('Interactive map tiles could not be initialized.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Building Colors Footprints on the Map
  useEffect(() => {
    if (!mapInstanceRef.current || !buildingLayerGroupRef.current) return;

    buildingLayerGroupRef.current.clearLayers();

    if (!layerBuildingsEnabled) return;

    const filtered =
      buildingColorFilter === 'all'
        ? buildings
        : buildings.filter((b) => b.tier === buildingColorFilter);

    filtered.forEach((bld) => {
      const polygon = L.polygon(bld.coordinates, {
        color: bld.color,
        fillColor: bld.color,
        fillOpacity: 0.55,
        weight: 2,
      });

      // Hover interaction
      polygon.on('mouseover', () => {
        polygon.setStyle({
          fillOpacity: 0.85,
          weight: 3,
        });
      });

      polygon.on('mouseout', () => {
        polygon.setStyle({
          fillOpacity: 0.55,
          weight: 2,
        });
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedBuilding(bld);
      });

      polygon.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #1E293B; min-width: 190px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #1E293B; font-size: 13px;">${bld.name}</strong>
            <span style="background: ${bld.color}15; color: ${bld.color}; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; border: 1px solid ${bld.color}40;">
              ${bld.tier.toUpperCase()} RISK
            </span>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Structure: <strong>${bld.type}</strong> (${bld.floors} Floors)</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 2px;">Plinth Elevation: <strong>${bld.plinthCm} cm</strong></div>
          <div style="font-size: 11px; color: ${bld.tier === 'high' ? '#DC2626' : bld.tier === 'moderate' ? '#D97706' : '#059669'}; font-weight: 600;">
            Estimated Inundation: ${bld.inundationExposureM}m
          </div>
        </div>
      `);

      buildingLayerGroupRef.current?.addLayer(polygon);
    });
  }, [buildings, layerBuildingsEnabled, buildingColorFilter]);

  // Update base tile layer on switcher change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = createTileLayer(activeBaseMap);
    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
    mapInstanceRef.current.invalidateSize();
  }, [activeBaseMap, createTileLayer]);

  // Update Analysis Radius Circle Visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !circleRef.current) return;

    if (layerRadiusEnabled) {
      if (!mapInstanceRef.current.hasLayer(circleRef.current)) {
        mapInstanceRef.current.addLayer(circleRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(circleRef.current)) {
        mapInstanceRef.current.removeLayer(circleRef.current);
      }
    }
  }, [layerRadiusEnabled]);

  // Update marker & circle when location or radius changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const latLng: [number, number] = [selectedLocation.lat, selectedLocation.lng];
    markerRef.current.setLatLng(latLng);
    circleRef.current.setLatLng(latLng);
    circleRef.current.setRadius(radiusKm * 1000);

    mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.8 });

    markerRef.current.setPopupContent(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #1E293B; padding: 2px; min-width: 170px;">
        <strong style="color: #059669; font-size: 13px; display: block; margin-bottom: 2px;">${selectedLocation.name}</strong>
        <span style="color: #64748B; display: block;">Elevation: ${selectedLocation.elevationMeters}m MSL</span>
        <span style="color: #64748B; font-family: monospace; font-size: 11px; display: block; margin-top: 2px;">${selectedLocation.lat.toFixed(4)}° N, ${selectedLocation.lng.toFixed(4)}° E</span>
        <span style="color: #0EA5E9; font-size: 10px; display: block; margin-top: 4px; font-weight: 600;">Drag pin to update location</span>
      </div>
    `);
  }, [selectedLocation.lat, selectedLocation.lng, selectedLocation.name, selectedLocation.elevationMeters, radiusKm]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numeric coordinates.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Latitude must be between -90 and 90, and longitude between -180 and 180.');
      return;
    }

    onSelectCoordinates(lat, lng, `Custom Coordinate (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
    setShowCoordinateModal(false);
  };

  return (
    <div className="relative w-full rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm flex flex-col">
      {/* ======================================================== */}
      {/* 1. ADMIN CADASTRAL BUILDING VULNERABILITY COLORS TOOLBAR */}
      {/* ======================================================== */}
      <div className="p-3 bg-[#F1F5F9] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#059669] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">domain</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1E293B] font-space uppercase tracking-wider">
                Admin Dashboard: Building Risk Colors
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[#059669] border border-[#CBD5E1] text-[10px] font-mono font-bold">
                {buildings.length} Cadastral Plots
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              Color-coded structural vulnerability analysis for {selectedLocation.name}
            </p>
          </div>
        </div>

        {/* Building Color Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Layer Toggle Button */}
          <button
            type="button"
            onClick={() => setLayerBuildingsEnabled(!layerBuildingsEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border ${
              layerBuildingsEnabled
                ? 'bg-[#059669] text-white border-[#059669] font-bold shadow-xs'
                : 'bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#1E293B]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {layerBuildingsEnabled ? 'visibility' : 'visibility_off'}
            </span>
            <span>{layerBuildingsEnabled ? 'Buildings: ON' : 'Buildings: OFF'}</span>
          </button>

          {/* All */}
          <button
            type="button"
            onClick={() => setBuildingColorFilter('all')}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              buildingColorFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-slate-100'
            }`}
          >
            All ({buildingCounts.total})
          </button>

          {/* 🔴 High Risk (Red) */}
          <button
            type="button"
            onClick={() => setBuildingColorFilter('high')}
            title="Show High Risk Structures"
            className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border ${
              buildingColorFilter === 'high'
                ? 'bg-[#DC2626] text-white font-bold shadow-xs border-[#DC2626]'
                : 'bg-white text-[#DC2626] border-[#FECACA] hover:bg-red-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span>Red: High ({buildingCounts.high})</span>
          </button>

          {/* 🟠 Moderate Risk (Amber) */}
          <button
            type="button"
            onClick={() => setBuildingColorFilter('moderate')}
            title="Show Moderate Risk Structures"
            className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border ${
              buildingColorFilter === 'moderate'
                ? 'bg-[#D97706] text-white font-bold shadow-xs border-[#D97706]'
                : 'bg-white text-[#D97706] border-[#FDE68A] hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>Amber: Moderate ({buildingCounts.moderate})</span>
          </button>

          {/* 🟢 Resilient (Green) */}
          <button
            type="button"
            onClick={() => setBuildingColorFilter('low')}
            title="Show Low Risk Resilient Structures"
            className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border ${
              buildingColorFilter === 'low'
                ? 'bg-[#059669] text-white font-bold shadow-xs border-[#059669]'
                : 'bg-white text-[#059669] border-[#A7F3D0] hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>Green: Resilient ({buildingCounts.low})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP MAP CONTEXT BAR                                    */}
      {/* ======================================================== */}
      <div className="p-3 sm:p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#0D9488] text-[20px] flex-shrink-0">
            public
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1E293B] truncate font-space flex items-center gap-2">
              <span>Tamil Nadu GIS Spatial Viewer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                OSM + Cadastral
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] truncate">
              {selectedLocation.name} · {selectedLocation.elevationMeters}m MSL Elevation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TNGIS GIS Layer Panel Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
              isLayerPanelOpen
                ? 'bg-[#059669] text-white border-[#059669] font-bold shadow-sm'
                : 'bg-white border-[#CBD5E1] text-[#1E293B] hover:border-[#059669]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>GIS Layers</span>
          </button>

          {/* Reset Extent to Tamil Nadu */}
          <button
            type="button"
            onClick={handleResetToTamilNadu}
            title="Reset Map to Tamil Nadu Overview"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#059669] text-xs font-mono text-[#1E293B] flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-[#059669]">restart_alt</span>
            <span className="hidden sm:inline">TN View</span>
          </button>

          {/* Radar Scan Animation Trigger */}
          <button
            type="button"
            onClick={triggerManualScan}
            title="Scan Geographic Basin"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D9488] text-xs font-mono text-[#0D9488] flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">radar</span>
            <span className="hidden sm:inline">Scan</span>
          </button>

          {/* Coordinate Readout */}
          <button
            type="button"
            onClick={() => setShowCoordinateModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D9488] text-xs font-mono text-[#1E293B] flex items-center gap-1 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px] text-[#0EA5E9]">pin_drop</span>
            <span>{selectedLocation.lat.toFixed(3)}°, {selectedLocation.lng.toFixed(3)}°</span>
          </button>
        </div>
      </div>

      {/* Map Error Banner */}
      {(mapError || tileErrorCount > 4) && (
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 z-30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">cloud_off</span>
            <div>
              <span className="font-semibold">Map Tile Service Notice: </span>
              <span>
                {mapError || 'Map tiles are taking longer to load. Real geographic tiles will resume once server responds.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetryTiles}
            className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer shadow-xs shrink-0"
          >
            Retry Tiles
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAP VIEWPORT CONTAINER                                 */}
      {/* ======================================================== */}
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-[#F1F5F9] overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[400px]"
          style={{ width: '100%', height: '100%' }}
        />

        {/* --- MAP OPENING ANIMATIONS --- */}
        {isScanning && (
          <div className="absolute inset-x-0 h-16 pointer-events-none z-[450] animate-map-scanline bg-gradient-to-b from-transparent via-[#0EA5E9]/20 to-transparent border-b border-[#0EA5E9]/50 shadow-[0_4px_16px_rgba(14,165,233,0.3)]" />
        )}

        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[440]">
            <div className="w-24 h-24 rounded-full border border-[#0EA5E9] animate-sonar-1" />
            <div className="absolute w-24 h-24 rounded-full border border-[#059669] animate-sonar-2" />
            <div className="absolute w-24 h-24 rounded-full border border-[#0D9488] animate-sonar-3" />
            <div
              className="absolute w-64 h-64 rounded-full pointer-events-none animate-radar-sweep opacity-30"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(14, 165, 233, 0.4) 0deg, transparent 65deg, transparent 360deg)',
              }}
            />
          </div>
        )}

        {isScanning && (
          <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-[460] transition-opacity duration-500">
            <div className="px-3.5 py-1 rounded-full bg-white/95 border border-[#0EA5E9] shadow-md backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
              <span className="text-[11px] font-mono font-bold text-[#1E293B] tracking-wider">
                {scanStatus}
              </span>
            </div>
          </div>
        )}

        {/* Custom On-Map Zoom Controls */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#059669] text-[#1E293B] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#059669] text-[#1E293B] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
        </div>

        {/* Tamil Nilam GIS Layer Control Drawer (Floating Right) */}
        {isLayerPanelOpen && (
          <div className="absolute top-3 right-3 bottom-12 w-72 sm:w-80 z-[420] bg-white/95 border border-[#CBD5E1] rounded-2xl shadow-xl backdrop-blur-xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#059669]">
                <span className="material-symbols-outlined text-[16px]">layers</span>
                <span>GIS LAYER CONTROLLER</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLayerPanelOpen(false)}
                className="w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-mono">
              {/* Base Map Switcher */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  1. Base Geographic Map
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'osm' as BaseMapType, label: 'Standard' },
                    { id: 'topographic' as BaseMapType, label: 'Topo' },
                    { id: 'satellite' as BaseMapType, label: 'Satellite' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBaseMap(b.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        activeBaseMap === b.id
                          ? 'bg-[#ECFDF5] border-[#059669] text-[#059669] font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cadastral Building Colors Toggle */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  2. Admin Cadastral Layers
                </span>

                <label className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-gradient-to-r from-[#DC2626] via-[#D97706] to-[#059669]" />
                    <span className="text-[#1E293B] text-[11px]">Building Risk Colors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerBuildingsEnabled}
                    onChange={(e) => setLayerBuildingsEnabled(e.target.checked)}
                    className="accent-[#059669]"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-dashed border-[#0EA5E9] bg-[#0EA5E9]/20" />
                    <span className="text-[#1E293B] text-[11px]">Analysis Radius ({radiusKm} km)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRadiusEnabled}
                    onChange={(e) => setLayerRadiusEnabled(e.target.checked)}
                    className="accent-[#059669]"
                  />
                </label>
              </div>

              {/* Data notices */}
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] text-[#059669] space-y-1">
                <strong>Admin Cadastral Intelligence:</strong>
                <p>
                  Structures around target coordinates are classified by ground elevation, building material, and return-period depth.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-[10px] text-[#64748B] font-mono text-center">
              TNGIS Spatial Framework · Survey of India Cadastre
            </div>
          </div>
        )}

        {/* Floating Active Layer Legend with Building Colors (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-xl p-2.5 shadow-md text-[11px] font-mono space-y-1.5 max-w-[240px]">
          <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider border-b border-[#E2E8F0] pb-1">
            Admin Map Legend
          </div>

          <div className="flex items-center gap-2 text-[#1E293B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] ring-2 ring-[#0EA5E9]/30" />
            <span>Target Location Pin</span>
          </div>

          {layerBuildingsEnabled && (
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" />
                <span>Red: High Risk Building</span>
              </div>
              <div className="flex items-center gap-2 text-[#D97706]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]" />
                <span>Amber: Moderate Risk</span>
              </div>
              <div className="flex items-center gap-2 text-[#059669]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]" />
                <span>Green: Resilient Pucca</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Building Detail Floating Callout (if clicked) */}
        {selectedBuilding && (
          <div className="absolute top-3 right-3 z-[410] bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xl max-w-xs animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="font-bold text-[#1E293B] font-space">{selectedBuilding.name}</span>
              <button
                type="button"
                onClick={() => setSelectedBuilding(null)}
                className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 pt-2 text-[#64748B]">
              <div className="flex justify-between">
                <span>Vulnerability Tier:</span>
                <strong style={{ color: selectedBuilding.color }}>
                  {selectedBuilding.tier.toUpperCase()} RISK
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Structure Type:</span>
                <span className="text-[#1E293B] font-medium">{selectedBuilding.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Plinth Elevation:</span>
                <span className="text-[#1E293B] font-mono">{selectedBuilding.plinthCm} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Inundation:</span>
                <span className="text-[#DC2626] font-mono font-bold">
                  {selectedBuilding.inundationExposureM}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Click Tip */}
        <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#CBD5E1] text-[10px] text-[#64748B] pointer-events-none hidden sm:block shadow-sm">
          Click map or building polygon to inspect
        </div>
      </div>

      {/* Analysis Radius Slider Bar */}
      <div className="p-3 sm:p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="material-symbols-outlined text-[#059669] text-[18px]">radar</span>
              <span className="font-semibold text-[#1E293B]">Analysis Radius:</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono font-bold text-xs border border-[#A7F3D0]">
              {radiusKm} km
            </span>
          </div>
          <span className="text-[10px] text-[#64748B] mt-0.5">
            Cadastral structures analyzed within {radiusKm} km buffer zone.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          {[1, 5, 10, 25].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onRadiusChange(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                radiusKm === preset
                  ? 'bg-[#059669] text-white font-bold shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#CBD5E1] hover:text-[#1E293B]'
              }`}
            >
              {preset}km
            </button>
          ))}
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={radiusKm}
            onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#059669]"
          />
        </div>
      </div>

      {/* Manual Coordinate Entry Modal */}
      {showCoordinateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleApplyCoordinates}
            className="bg-white border border-[#E2E8F0] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h4 className="font-bold text-[#1E293B] text-base font-space">Enter Precise Coordinates</h4>
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Coordinates must be decimal degrees within Tamil Nadu (Latitude ~8.0° to 13.6° N, Longitude ~76.2° to 80.4° E).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#64748B] mb-1 font-semibold">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] font-mono text-sm focus:border-[#059669] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#64748B] mb-1 font-semibold">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] font-mono text-sm focus:border-[#059669] outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCoordinateModal(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#64748B] hover:text-[#1E293B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#059669] text-white font-bold text-xs font-space shadow-sm hover:bg-[#047857] cursor-pointer"
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
