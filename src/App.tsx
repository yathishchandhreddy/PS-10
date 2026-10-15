import React, { useState, useMemo } from 'react';
import { LocationData, DisasterType, PropertyDetails } from './types';
import { TN_REFERENCE_LOCATIONS } from './services/dataSources';
import { computeCatastropheRisk } from './services/riskEngine';
import { calculatePropertyLoss } from './services/propertyLossEngine';
import { computeIndicativeInsurance } from './services/insuranceEngine';
import { generateRiskAssessmentPDF, generateInsurancePricingPDF } from './services/pdfGenerator';

import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { LocationSearch } from './components/LocationSearch';
import { InteractiveMap } from './components/InteractiveMap';
import { DisasterSelector } from './components/DisasterSelector';
import { RiskSummaryView } from './components/RiskSummaryView';
import { SimulationViewer } from './components/SimulationViewer';
import { PropertyLossCalculator } from './components/PropertyLossCalculator';
import { InsurancePricingView } from './components/InsurancePricingView';
import { RecommendationsView } from './components/RecommendationsView';

export default function App() {
  // Authentication & Perspective state (starring the 4-image animated login requested by user)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{ name: string; role: string }>({
    name: 'Chennai Resident',
    role: 'Resident / Property Owner',
  });

  // Step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Location (Defaults to Velachery, Chennai to immediately match the exported Stitch UI)
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(
    TN_REFERENCE_LOCATIONS[0] // Velachery, Chennai
  );

  // Analysis radius in km (default 5 km)
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Selected disaster peril (flood, cyclone, earthquake)
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('flood');

  // Property Details
  const [property, setProperty] = useState<PropertyDetails>({
    propertyValue: 7500000, // ₹75 Lakhs
    contentsValue: 1500000, // ₹15 Lakhs
    propertyType: 'Residential RCC',
    builtYear: 2016,
    plinthElevationCm: 45,
    floorsCount: 2,
  });

  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute risk deterministically using the separate riskEngine service
  const riskResult = useMemo(() => {
    return computeCatastropheRisk({
      location: selectedLocation,
      disasterType: selectedDisaster,
      radiusKm,
    });
  }, [selectedLocation, selectedDisaster, radiusKm]);

  // Compute property loss
  const lossResult = useMemo(() => {
    return calculatePropertyLoss(property, selectedDisaster, riskResult);
  }, [property, selectedDisaster, riskResult]);

  // Compute insurance pricing
  const insuranceResult = useMemo(() => {
    const totalSum = property.propertyValue + property.contentsValue;
    return computeIndicativeInsurance({
      propertyValue: property.propertyValue,
      insuredAmount: totalSum,
      propertyType: property.propertyType,
      disasterScenario: selectedDisaster,
      riskResult,
      deductiblePercent: 5,
    });
  }, [property, selectedDisaster, riskResult]);

  // Handlers
  const handleLogin = (name: string, role: string) => {
    setUserProfile({ name, role });
    setIsAuthenticated(true);
  };

  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    showToast(`Updated location: ${loc.name}`);
  };

  const handleSelectCoordinates = (lat: number, lng: number, placeName?: string) => {
    const updated: LocationData = {
      name: placeName || `Point (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
      district: 'Selected Grid Area',
      lat,
      lng,
      elevationMeters: 8,
      distanceToCoastKm: Math.abs(lng - 80.25) * 111,
      distanceToWaterbodyM: 900,
      seismicZone: 'Zone III (Moderate)',
    };
    setSelectedLocation(updated);
    showToast(`Location set to Lat ${lat.toFixed(3)}°, Lng ${lng.toFixed(3)}°`);
  };

  const handleDownloadRiskPdf = () => {
    try {
      generateRiskAssessmentPDF(riskResult);
      showToast('Risk Assessment PDF generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadInsurancePdf = () => {
    try {
      generateInsurancePricingPDF(riskResult, property, insuranceResult, lossResult);
      showToast('Insurance Pricing PDF generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // If not authenticated, show the animated login page with the 4 background views
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const stepTitles = [
    'Location & Scope',
    'Catastrophe Peril',
    'Risk Summary & Simulation',
    'Loss Calculator',
    'Insurance Pricing',
    'Prevention & Safety',
  ];

  return (
    <div className="min-h-screen bg-[#0e1321] text-[#dee2f6] flex flex-col font-sans selection:bg-[#4cd7f6] selection:text-[#003640]">
      {/* Top Navigation Bar */}
      <Header
        currentStep={currentStep}
        totalSteps={6}
        stepTitle={stepTitles[currentStep - 1]}
        onGoBack={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
        onNavigateStep={(step) => setCurrentStep(step)}
        userRole={userProfile.role}
        onSwitchUser={() => setIsAuthenticated(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 flex flex-col space-y-6">
        {/* Step Progress Tracker Pill (Mobile view) */}
        <div className="flex md:hidden items-center justify-between bg-[#161b2a] border border-[#252a39] p-3 rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold border border-[#4cd7f6]/20">
              Step {currentStep} of 6
            </span>
            <span className="text-xs text-[#bcc9cd] font-medium truncate max-w-[170px]">
              {stepTitles[currentStep - 1]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="w-7 h-7 rounded-full bg-[#252a39] flex items-center justify-center text-[#dee2f6]"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            )}
            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="w-7 h-7 rounded-full bg-[#4cd7f6] flex items-center justify-center text-[#003640]"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Search & Interactive Leaflet Map */}
        {currentStep === 1 && (
          <div className="flex flex-col space-y-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#4cd7f6]/20">
                Step 1 of 6
              </span>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
                Select Your Tamil Nadu Location
              </h2>
              <p className="text-xs sm:text-sm text-[#bcc9cd]">
                Search for your city, town, or district in Tamil Nadu, or use your GPS location.
              </p>
            </div>

            {/* Location Search Input */}
            <LocationSearch
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
            />

            {/* Interactive Leaflet Map with Radius Slider */}
            <InteractiveMap
              selectedLocation={selectedLocation}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onSelectCoordinates={handleSelectCoordinates}
              disasterType={selectedDisaster}
            />

            {/* Proceed Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full h-14 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#04b4a2] hover:brightness-110 text-[#003640] font-space font-bold text-base flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>Confirm Location &amp; Choose Disaster (Step 2)</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Disaster Peril Selection */}
        {currentStep === 2 && (
          <div className="flex flex-col space-y-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#4cd7f6]/20">
                Step 2 of 6
              </span>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
                Choose Catastrophe Peril
              </h2>
              <p className="text-xs sm:text-sm text-[#bcc9cd]">
                Select which hazard scenario to model for {selectedLocation.name}.
              </p>
            </div>

            {/* Selected Location Pill */}
            <div className="bg-[#161b2a] border border-[#252a39] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[22px]">location_on</span>
                <div>
                  <div className="font-bold text-sm text-white">{selectedLocation.name}</div>
                  <div className="text-xs text-[#869397]">
                    {selectedLocation.district} District · {selectedLocation.elevationMeters}m MSL Elevation
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-mono text-[#4cd7f6] hover:underline"
              >
                Change
              </button>
            </div>

            {/* Disaster Peril Selector */}
            <DisasterSelector
              selectedDisaster={selectedDisaster}
              onSelectDisaster={setSelectedDisaster}
            />

            {/* Proceed Action */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-14 px-6 rounded-full bg-[#161b2a] text-[#dee2f6] font-space font-medium text-sm flex items-center justify-center border border-[#303444]"
              >
                Back to Location
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 h-14 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#04b4a2] hover:brightness-110 text-[#003640] font-space font-bold text-base flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>Compute Risk &amp; View Incident (Step 3)</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Risk Summary & 10-Second Simulation Viewer (The exported Stitch UI!) */}
        {currentStep === 3 && (
          <div className="flex flex-col space-y-8">
            {/* The exported Stitch UI Risk Summary View */}
            <RiskSummaryView
              riskResult={riskResult}
              onEstimateLoss={() => setCurrentStep(4)}
              onExploreInsurance={() => setCurrentStep(5)}
              onDownloadPdf={handleDownloadRiskPdf}
            />

            {/* The 10-second interactive scenario simulation viewer */}
            <div className="pt-4 border-t border-[#252a39]">
              <SimulationViewer
                location={selectedLocation}
                disasterType={selectedDisaster}
                riskResult={riskResult}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Property Loss Calculator */}
        {currentStep === 4 && (
          <PropertyLossCalculator
            property={property}
            onChangeProperty={setProperty}
            disasterType={selectedDisaster}
            riskResult={riskResult}
            onProceedToInsurance={() => setCurrentStep(5)}
          />
        )}

        {/* STEP 5: Insurance Pricing Engine */}
        {currentStep === 5 && (
          <InsurancePricingView
            property={property}
            disasterType={selectedDisaster}
            riskResult={riskResult}
            lossResult={lossResult}
            onExploreRecommendations={() => setCurrentStep(6)}
            onDownloadReport={handleDownloadInsurancePdf}
          />
        )}

        {/* STEP 6: Prevention Recommendations, Emergency SOS & PDF Hub */}
        {currentStep === 6 && (
          <RecommendationsView
            disasterType={selectedDisaster}
            riskResult={riskResult}
            onDownloadRiskPdf={handleDownloadRiskPdf}
            onDownloadInsurancePdf={handleDownloadInsurancePdf}
            onStartNewSearch={() => setCurrentStep(1)}
          />
        )}
      </main>

      {/* Floating Bottom Quick Action Bar for Desktop / Tablet */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0e1321]/90 backdrop-blur-xl border-t border-[#252a39] py-3 px-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-[#bcc9cd] truncate">
            <span className="text-[#4cd7f6] font-bold">RiskLens TN:</span>
            <span className="text-white font-medium truncate">{selectedLocation.name}</span>
            <span>·</span>
            <span className="capitalize text-[#4fdbc8]">{selectedDisaster}</span>
            <span>·</span>
            <span>Score: <strong className="text-white">{riskResult.vulnerabilityIndex}/100</strong></span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleDownloadRiskPdf}
              title="Download Risk PDF"
              className="px-3 py-1.5 rounded-full bg-[#1a1f2e] border border-[#303444] hover:border-[#4cd7f6] text-xs font-mono text-[#dee2f6] flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">picture_as_pdf</span>
              <span className="hidden sm:inline">Risk PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadInsurancePdf}
              title="Download Pricing PDF"
              className="px-3 py-1.5 rounded-full bg-[#1a1f2e] border border-[#303444] hover:border-[#4fdbc8] text-xs font-mono text-[#dee2f6] flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#4fdbc8]">receipt_long</span>
              <span className="hidden sm:inline">Pricing PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-[#161b2a] border border-[#4cd7f6] rounded-2xl px-4 py-3 text-xs font-mono text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
