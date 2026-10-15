import { LocationData } from '../types';

export const TN_REFERENCE_LOCATIONS: LocationData[] = [
  {
    name: 'Velachery, Chennai',
    district: 'Chennai',
    lat: 12.9815,
    lng: 80.2180,
    elevationMeters: 6,
    distanceToCoastKm: 5.2,
    distanceToWaterbodyM: 800,
    seismicZone: 'Zone III (Moderate)',
  },
  {
    name: 'Mylapore / Santhome, Chennai',
    district: 'Chennai',
    lat: 13.0336,
    lng: 80.2785,
    elevationMeters: 9,
    distanceToCoastKm: 0.6,
    distanceToWaterbodyM: 500,
    seismicZone: 'Zone III (Moderate)',
  },
  {
    name: 'Tambaram, Chengalpattu',
    district: 'Chengalpattu',
    lat: 12.9249,
    lng: 80.1000,
    elevationMeters: 32,
    distanceToCoastKm: 16.0,
    distanceToWaterbodyM: 1400,
    seismicZone: 'Zone III (Moderate)',
  },
  {
    name: 'Cuddalore Old Town & Port',
    district: 'Cuddalore',
    lat: 11.7480,
    lng: 79.7714,
    elevationMeters: 4,
    distanceToCoastKm: 1.1,
    distanceToWaterbodyM: 350,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Nagapattinam Coastline',
    district: 'Nagapattinam',
    lat: 10.7656,
    lng: 79.8424,
    elevationMeters: 3,
    distanceToCoastKm: 0.8,
    distanceToWaterbodyM: 200,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Coimbatore Gandhipuram',
    district: 'Coimbatore',
    lat: 11.0168,
    lng: 76.9558,
    elevationMeters: 411,
    distanceToCoastKm: 168.0,
    distanceToWaterbodyM: 3200,
    seismicZone: 'Zone III (Moderate)',
  },
  {
    name: 'Madurai City Center',
    district: 'Madurai',
    lat: 9.9252,
    lng: 78.1198,
    elevationMeters: 136,
    distanceToCoastKm: 118.0,
    distanceToWaterbodyM: 650,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Tiruchirappalli Srirangam Basin',
    district: 'Tiruchirappalli',
    lat: 10.8622,
    lng: 78.6978,
    elevationMeters: 78,
    distanceToCoastKm: 124.0,
    distanceToWaterbodyM: 400,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Karur Amaravathi Riverbed',
    district: 'Karur',
    lat: 10.9601,
    lng: 78.0766,
    elevationMeters: 122,
    distanceToCoastKm: 175.0,
    distanceToWaterbodyM: 450,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Thoothukudi Harbor Front',
    district: 'Thoothukudi',
    lat: 8.7642,
    lng: 78.1348,
    elevationMeters: 4,
    distanceToCoastKm: 0.5,
    distanceToWaterbodyM: 300,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Salem Steel City',
    district: 'Salem',
    lat: 11.6643,
    lng: 78.1460,
    elevationMeters: 278,
    distanceToCoastKm: 210.0,
    distanceToWaterbodyM: 4100,
    seismicZone: 'Zone III (Moderate)',
  },
  {
    name: 'Kanyakumari Coastal Point',
    district: 'Kanyakumari',
    lat: 8.0883,
    lng: 77.5385,
    elevationMeters: 10,
    distanceToCoastKm: 0.3,
    distanceToWaterbodyM: 300,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Thanjavur Cauvery Delta Basin',
    district: 'Thanjavur',
    lat: 10.7870,
    lng: 79.1378,
    elevationMeters: 22,
    distanceToCoastKm: 65.0,
    distanceToWaterbodyM: 180,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Tiruvarur Paddy Canal Belt',
    district: 'Tiruvarur',
    lat: 10.7725,
    lng: 79.6365,
    elevationMeters: 8,
    distanceToCoastKm: 28.0,
    distanceToWaterbodyM: 120,
    seismicZone: 'Zone II (Low)',
  },
  {
    name: 'Erode Turmeric & Sugarcane Basin',
    district: 'Erode',
    lat: 11.3410,
    lng: 77.7172,
    elevationMeters: 183,
    distanceToCoastKm: 220.0,
    distanceToWaterbodyM: 250,
    seismicZone: 'Zone II (Low)',
  }
];

export const DATA_PROVIDERS = [
  {
    name: 'India Meteorological Department (IMD)',
    dataset: 'Gridded 0.25° Daily Precipitation & Cyclone Tracking Archive',
    coverage: 'Tamil Nadu & Bay of Bengal Basin',
    period: '1970 - 2025',
    reliability: 'Verified Governmental Record',
    notes: 'Used for extreme 24-hr rainfall events (e.g. 2015 Chennai floods, 2023 Cyclone Michaung) and maximum sustained wind gust records.'
  },
  {
    name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)',
    dataset: 'Vulnerability Atlas of Tamil Nadu & Ward Inundation Profiles',
    coverage: 'All 38 Districts of Tamil Nadu',
    period: 'Updated 2024',
    reliability: 'Verified State Authority Database',
    notes: 'Provides micro-basin flood catchment demarcations, Pallikaranai marshland buffer corridors, and coastal storm surge maps.'
  },
  {
    name: 'Department of Agriculture & Farmers Welfare, Govt of Tamil Nadu',
    dataset: 'Uzhavan Portal Agronomic Database & PMFBY Crop Loss Thresholds',
    coverage: 'Cauvery Delta & All 38 Agri Districts',
    period: '2024 - 2025 (Active)',
    reliability: 'Verified State Agricultural Registry',
    notes: 'Notified Scale of Finance, crop insurance subsidy allocations, and village-level yield assessment norms.'
  },
  {
    name: 'Survey of India & NRSC Bhuvan',
    dataset: 'Digital Elevation Model (DEM) & CartoDEM Terrain Meshes',
    coverage: 'Statewide 10m / 30m resolution',
    period: 'Current Topographic Grid',
    reliability: 'Verified Geodetic Measurement',
    notes: 'Provides mean sea level (MSL) elevation and natural terrain depression slopes.'
  },
  {
    name: 'Bureau of Indian Standards (BIS IS 1893: Part 1: 2016)',
    dataset: 'Criteria for Earthquake Resistant Design of Structures',
    coverage: 'National Seismic Zonation Map',
    period: '2016 Revision (Active)',
    reliability: 'Statutory National Standard',
    notes: 'Tamil Nadu sits predominantly within Zone II (Low) and Zone III (Moderate - Chennai, Coimbatore, Salem faults).'
  }
];

export const OFFICIAL_EMERGENCY_CONTACTS = [
  {
    service: 'State Disaster Management Control Room',
    number: '1070',
    type: 'Toll-Free 24x7 Emergency Help',
    authority: 'Government of Tamil Nadu'
  },
  {
    service: 'Kisan Call Center / Farmers Toll-Free Help',
    number: '1800-180-1551 / 1551',
    type: 'Crop Loss & Agri Emergency Support',
    authority: 'Dept of Agriculture, Govt of India & TN'
  },
  {
    service: 'PMFBY Crop Insurance Grievance Helpline',
    number: '14447',
    type: '72-Hour Disaster Loss Intimation',
    authority: 'Pradhan Mantri Fasal Bima Yojana'
  },
  {
    service: 'District Disaster Management Authority',
    number: '1077',
    type: 'District Collectorate Rapid Response',
    authority: 'TNSDMA District Units'
  },
  {
    service: 'Unified Emergency Services (Police / Fire / Ambulance)',
    number: '112',
    type: 'All-India National SOS Helpline',
    authority: 'Ministry of Home Affairs'
  },
  {
    service: 'Greater Chennai Corporation Flood Control',
    number: '1913',
    type: 'Waterlogging & De-watering Request',
    authority: 'GCC Control Center'
  }
];
