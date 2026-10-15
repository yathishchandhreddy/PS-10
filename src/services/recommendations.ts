import { DisasterType, RiskAnalysisResult } from '../types';

export interface ActionableRecommendation {
  category: 'Structural Protection' | 'Emergency Preparedness' | 'Vital Documents' | 'Insurance Underwriting Checklist';
  title: string;
  action: string;
  isLocationSpecific: boolean;
  priority: 'Immediate' | 'Pre-Monsoon' | 'General';
}

export function getDisasterRecommendations(
  disasterType: DisasterType,
  riskResult: RiskAnalysisResult
): {
  recommendations: ActionableRecommendation[];
  emergencyContacts: { name: string; number: string; role: string }[];
  shelterNotice: string;
  officialPortals: { name: string; url: string }[];
} {
  const isHighRisk = riskResult.vulnerabilityIndex >= 70;
  const locName = riskResult.location.name;

  let recommendations: ActionableRecommendation[] = [];

  if (disasterType === 'flood') {
    recommendations = [
      {
        category: 'Structural Protection',
        title: 'Install Aluminum Flood Barriers & Non-Return Sump Valves',
        action: `For ${locName} (elevation ${riskResult.location.elevationMeters}m MSL), install 3-foot modular flood barriers at gate entries and fit non-return flap valves on domestic sewer outlets to stop municipal stormwater backflow.`,
        isLocationSpecific: true,
        priority: isHighRisk ? 'Immediate' : 'Pre-Monsoon',
      },
      {
        category: 'Structural Protection',
        title: 'Elevate Ground-Floor Electrical & Generator Systems',
        action: 'Raise distribution boards, inverter battery banks, and backup diesel generator sets at least 1.2m above finished ground level.',
        isLocationSpecific: true,
        priority: 'Pre-Monsoon',
      },
      {
        category: 'Vital Documents',
        title: 'Waterproof Pouch & Digilocker Cloud Storage',
        action: 'Seal Aadhaar cards, property patta/chitta deeds, insurance certificates, and sale agreements in airtight waterproof dry bags. Ensure digital synchronization with DigiLocker.',
        isLocationSpecific: false,
        priority: 'Immediate',
      },
      {
        category: 'Emergency Preparedness',
        title: '72-Hour Sustained Survival Kit',
        action: 'Store 10 liters of bottled water per person, dry rations (flattened rice, biscuits), LED emergency lights, waterproof torches, power banks, and essential prescription medications.',
        isLocationSpecific: false,
        priority: 'Pre-Monsoon',
      },
      {
        category: 'Insurance Underwriting Checklist',
        title: 'Verify Bharat Griha Raksha STFI Cover & Deductible',
        action: 'Ensure your property policy includes Storm, Tempest, Flood and Inundation (STFI) endorsement. Check if basement storage and boundary walls are explicitly covered.',
        isLocationSpecific: false,
        priority: 'General',
      },
    ];
  } else if (disasterType === 'cyclone') {
    recommendations = [
      {
        category: 'Structural Protection',
        title: 'Reinforce Rooftop Water Tanks & Solar Panel Clamps',
        action: `Given proximity to Bay of Bengal winds in ${locName}, anchor PV solar panel racks with high-tensile galvanised turnbuckles and keep overhead water storage tanks 100% filled to resist wind uplift.`,
        isLocationSpecific: true,
        priority: 'Immediate',
      },
      {
        category: 'Structural Protection',
        title: 'Tree Canopy & Hazard Pruning',
        action: 'Prune weak tree branches overhanging power lines and car porches before the onset of the October-December cyclone season.',
        isLocationSpecific: false,
        priority: 'Pre-Monsoon',
      },
      {
        category: 'Emergency Preparedness',
        title: 'Storm Shuttering & Window Cross-Taping',
        action: 'Secure large glass balcony windows with hurricane film or reinforced diagonal masking tape to prevent dangerous glass shatter under 140 km/h gusts.',
        isLocationSpecific: false,
        priority: 'Immediate',
      },
      {
        category: 'Vital Documents',
        title: 'Physical & Digital Policy Duplicate',
        action: 'Keep insurer toll-free emergency claim intimation numbers pre-saved offline in phone contacts along with your vehicle and home policy numbers.',
        isLocationSpecific: false,
        priority: 'General',
      },
    ];
  } else {
    // Earthquake
    recommendations = [
      {
        category: 'Structural Protection',
        title: 'Anchor Heavy Bookshelves & Geysers',
        action: 'Fasten tall storage cabinets, heavy wall-hung mirrors, and electrical water geysers to structural RCC masonry with seismic brackets.',
        isLocationSpecific: false,
        priority: 'Pre-Monsoon',
      },
      {
        category: 'Emergency Preparedness',
        title: 'Designate Drop, Cover, and Hold Zones',
        action: 'Identify sturdy load-bearing tables or interior doorways away from overhead ceiling glass panels and heavy chandeliers.',
        isLocationSpecific: false,
        priority: 'General',
      },
      {
        category: 'Insurance Underwriting Checklist',
        title: 'Confirm Zone II/III Earthquake Endorsement',
        action: `Confirm that property policy includes standard earthquake (fire and shock) clause as per BIS IS 1893 seismic zonation.`,
        isLocationSpecific: false,
        priority: 'General',
      },
    ];
  }

  return {
    recommendations,
    emergencyContacts: [
      { name: 'Unified Emergency Police / Fire / Medical', number: '112', role: 'National 24/7 SOS' },
      { name: 'Tamil Nadu State Emergency Operations (SEOC)', number: '1070', role: 'State Disaster Control Room' },
      { name: 'District Emergency Operations Center (DEOC)', number: '1077', role: 'District Collectorate Line' },
      { name: 'Greater Chennai Flood & Storm Helpline', number: '1913', role: 'Chennai Municipal Corp.' },
    ],
    shelterNotice: 'NOTICE ON SHELTERS: Verified government relief shelters are activated dynamically by the Tamil Nadu Revenue Administration and TNSDMA during declared emergency phases. RiskLens TN does NOT invent unverified shelter locations. In the event of an active disaster evacuation warning, follow official announcements via SMS alerts and local Tahsildar / Corporation relief officers.',
    officialPortals: [
      { name: 'TNSDMA Official Portal', url: 'https://tnsdma.tn.gov.in' },
      { name: 'IMD Chennai Regional Meteorological Centre', url: 'https://mausam.imd.gov.in/chennai' },
      { name: 'Greater Chennai Corporation Disaster Control', url: 'https://chennaicorporation.gov.in' }
    ]
  };
}
