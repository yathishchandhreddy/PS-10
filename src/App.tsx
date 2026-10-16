import React, { useState, useMemo } from 'react';
import { LocationData, DisasterType, PropertyDetails } from './types';
import { TN_REFERENCE_LOCATIONS, lookupTamilNaduGeodetics } from './services/dataSources';
import { computeCatastropheRisk } from './services/riskEngine';
import { calculatePropertyLoss } from './services/propertyLossEngine';
import { computeIndicativeInsurance } from './services/insuranceEngine';
import { generateRiskAssessmentPDF, generateInsurancePricingPDF } from './services/pdfGenerator';

import { Header } from './components/Header';
import { CinematicIntro } from './components/CinematicIntro';
import { LoginScreen } from './components/LoginScreen';
import { DashboardLoader } from './components/DashboardLoader';
import { LocationSearch } from './components/LocationSearch';
import { InteractiveMap } from './components/InteractiveMap';
import { DisasterSelector } from './components/DisasterSelector';
import { RiskSummaryView } from './components/RiskSummaryView';
import { SimulationViewer } from './components/SimulationViewer';
import { PropertyLossCalculator } from './components/PropertyLossCalculator';
import { InsurancePricingView } from './components/InsurancePricingView';
import { RecommendationsView } from './components/RecommendationsView';
import { FarmerModule } from './components/FarmerModule';
import { DatasetHub } from './components/DatasetHub';

type AppStage = 'intro' | 'login' | 'loading' | 'dashboard';

export default function App() {
  // App Stage: 1. intro -> 2. login -> 3. loading -> 4. dashboard
  const [appStage, setAppStage] = useState<AppStage>(() => {
    try {
      const introCompleted = sessionStorage.getItem('risklens_intro_completed');
      if (introCompleted === 'true') {
        return 'login';
      }
    } catch {
      // Ignore
    }
    return 'intro';
  });

  // Authentication & Perspective state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{ name: string; role: string }>({
    name: 'Chennai Resident',
    role: 'Property Owner',
  });

  // Step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Farmer module GIS map toggle
  const [showFarmerMap, setShowFarmerMap] = useState<boolean>(false);

  // Autonomous Data Discovery & Datasets Hub modal
  const [showDataHub, setShowDataHub] = useState<boolean>(false);

  // Selected Location (Defaults to Velachery, Chennai)
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(
    TN_REFERENCE_LOCATIONS[0]
  );

  // Analysis radius in km (default 5 km)
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Selected disaster peril (flood, cyclone, earthquake)
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('flood');

  // Property Details
  const [property, setProperty] = useState<PropertyDetails>({
    propertyValue: 7500000,
    contentsValue: 1500000,
    propertyType: 'Residential RCC',
    builtYear: 2016,
    plinthElevationCm: 45,
    floorsCount: 2,
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const riskResult = useMemo(() => {
    return computeCatastropheRisk({
      location: selectedLocation,
      disasterType: selectedDisaster,
      radiusKm,
    });
  }, [selectedLocation, selectedDisaster, radiusKm]);

  const lossResult = useMemo(() => {
    return calculatePropertyLoss(property, selectedDisaster, riskResult);
  }, [property, selectedDisaster, riskResult]);

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

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('risklens_intro_completed', 'true');
    } catch {
      // Ignore
    }
    setAppStage('login');
  };

  const handleLogin = (name: string, role: string) => {
    setUserProfile({ name, role });
    setShowFarmerMap(false);
    setAppStage('loading');
  };

  const handleDashboardLoaded = () => {
    setIsAuthenticated(true);
    setAppStage('dashboard');
  };

  const handleReplayIntro = () => {
    setAppStage('intro');
  };

  const handleSwitchUser = () => {
    setIsAuthenticated(false);
    setAppStage('login');
  };

  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    showToast(`Updated location: ${loc.name}`);
  };

  const handleSelectCoordinates = (lat: number, lng: number, placeName?: string) => {
    const updated = lookupTamilNaduGeodetics(lat, lng, placeName);
    setSelectedLocation(updated);
    if (!updated.isWithinTamilNadu) {
      showToast(`Notice: Coordinates lie outside Tamil Nadu boundary.`);
    } else {
      showToast(`Location set: ${updated.district} (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
    }
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

  // Stage 1: Cinematic Intro Animation
  if (appStage === 'intro') {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  // Stage 2: Login / Role Selection Screen
  if (appStage === 'login' || !isAuthenticated && appStage !== 'loading') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onReplayIntro={handleReplayIntro}
      />
    );
  }

  // Stage 3: Dashboard Loading Transition
  if (appStage === 'loading') {
    return (
      <DashboardLoader
        userName={userProfile.name}
        userRole={userProfile.role}
        onLoaded={handleDashboardLoaded}
      />
    );
  }

  // Stage 4: Main Dashboard
  const stepTitles = [
    'GIS Map & Hazard Selection',
    'Catastrophe Peril',
    'Risk Summary & Simulation',
    'Loss Calculator',
    'Insurance Pricing',
    'Prevention & Safety',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-[#059669]/20 selection:text-[#059669]">
      {/* Top Navigation Bar */}
      <Header
        currentStep={currentStep}
        totalSteps={6}
        stepTitle={stepTitles[currentStep - 1]}
        onGoBack={() => {
          if (userProfile.role === 'Farmer' && showFarmerMap) {
            setShowFarmerMap(false);
          } else {
            setCurrentStep((prev) => (prev === 3 ? 1 : Math.max(1, prev - 1)));
          }
        }}
        onNavigateStep={(step) => {
          setShowFarmerMap(false);
          setCurrentStep(step);
        }}
        userRole={userProfile.role}
        onSwitchUser={handleSwitchUser}
        onSelectRole={(role) => {
          setUserProfile((prev) => ({ ...prev, role }));
          setShowFarmerMap(false);
          showToast(`Switched perspective to ${role}`);
        }}
        onReplayIntro={handleReplayIntro}
        onOpenDataHub={() => setShowDataHub(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-24 flex flex-col space-y-6">
        {/* Dedicated Farmer Perspective Module */}
        {userProfile.role === 'Farmer' && !showFarmerMap ? (
          <FarmerModule
            currentLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onOpenMap={() => {
              setCurrentStep(1);
              setShowFarmerMap(true);
            }}
            onSwitchRole={handleSwitchUser}
            farmerName={userProfile.name}
          />
        ) : (
          <>
            {userProfile.role === 'Farmer' && showFarmerMap && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[18px]">agriculture</span>
                  </span>
                  <div>
                    <strong className="block font-space text-emerald-950">
                      Farmer GIS Cadastral Mode
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      Pinpoint your agricultural parcel or inspect waterbody proximity in {selectedLocation.name}.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFarmerMap(false)}
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Return to Farmer Dashboard</span>
                </button>
              </div>
            )}

            {/* Step Progress Tracker (Mobile view) */}
        <div className="flex md:hidden items-center justify-between bg-white border border-[#E2E8F0] p-3 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold border border-[#A7F3D0]">
              Step {currentStep} of 6
            </span>
            <span className="text-xs text-[#64748B] font-medium truncate max-w-[170px]">
              {stepTitles[currentStep - 1]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev === 3 ? 1 : prev - 1))}
                className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#1E293B]"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            )}
            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev === 1 ? 3 : prev + 1))}
                className="w-7 h-7 rounded-full bg-[#059669] flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Fully Integrated Tamil Nilam GIS Map & Risk Selection Flow */}
        {currentStep === 1 && (
          <div className="flex flex-col space-y-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
                Step 1 of 6
              </span>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[#1E293B]">
                Tamil Nadu Catastrophe GIS Explorer
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Search for a location, inspect terrain layers, adjust the analysis radius, and analyze catastrophe risk.
              </p>
            </div>

            {/* Stakeholder Persona & Role Switcher Bar (Ensures Zero Map Overlap) */}
            <div className="bg-white border border-[#E2E8F0] p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-2xs ${
                  userProfile.role === 'Farmer' ? 'bg-[#059669]' : 'bg-[#059669]'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {userProfile.role === 'Farmer' ? 'agriculture' : 'person'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                      Stakeholder Role:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[10px] font-bold border border-[#A7F3D0]">
                      {userProfile.role}
                    </span>
                  </div>
                  <strong className="text-xs sm:text-sm font-space text-[#1E293B]">
                    {userProfile.name}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDataHub(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#059669] text-xs font-mono text-[#1E293B] hover:text-[#059669] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Explore IMD, ISRO, and PMFBY official datasets"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#059669]">dataset</span>
                  <span>Official Datasets</span>
                </button>

                <button
                  type="button"
                  onClick={handleSwitchUser}
                  className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-space font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Switch between Property Owner, Farmer, Insurance, Government, and Analyst roles"
                >
                  <span className="material-symbols-outlined text-[16px]">switch_account</span>
                  <span>Switch Role</span>
                </button>
              </div>
            </div>

            {/* 1. Location Search Field */}
            <LocationSearch
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
            />

            {/* Admin Dashboard: Cadastral Building Colors Summary Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                  </span>
                  <div>
                    <h3 className="font-space font-bold text-sm sm:text-base text-[#1E293B] flex items-center gap-2">
                      <span>Admin Cadastral Building Risk Analysis</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-bold border border-[#A7F3D0]">
                        {userProfile.role}
                      </span>
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Cadastral building footprints color-coded by flood runoff &amp; structural vulnerability tier.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#64748B]">Spatial Accuracy:</span>
                  <span className="font-bold text-[#059669]">WGS-84 Cadastre</span>
                </div>
              </div>

              {/* Building Color Metric Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 🔴 Red: High Risk */}
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-[#DC2626] shadow-xs" />
                    <div>
                      <div className="text-xs font-bold text-red-950 font-space">Red: High Risk</div>
                      <div className="text-[11px] text-red-700">Low plinth (&lt;25cm), direct runoff</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#DC2626]">31%</span>
                    <span className="text-[10px] text-red-600 block">4 Structures</span>
                  </div>
                </div>

                {/* 🟠 Amber: Moderate Risk */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-[#D97706] shadow-xs" />
                    <div>
                      <div className="text-xs font-bold text-amber-950 font-space">Amber: Moderate</div>
                      <div className="text-[11px] text-amber-700">Standard plinth, partial drainage</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#D97706]">38%</span>
                    <span className="text-[10px] text-amber-600 block">5 Structures</span>
                  </div>
                </div>

                {/* 🟢 Green: Resilient / Low Risk */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-[#059669] shadow-xs" />
                    <div>
                      <div className="text-xs font-bold text-emerald-950 font-space">Green: Resilient</div>
                      <div className="text-[11px] text-emerald-700">High plinth (&ge;60cm), sump valves</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#059669]">31%</span>
                    <span className="text-[10px] text-emerald-600 block">4 Structures</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Interactive GIS Leaflet Map with Tamil Nilam Layer Control Panel & Radius Slider */}
            <InteractiveMap
              selectedLocation={selectedLocation}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onSelectCoordinates={handleSelectCoordinates}
              disasterType={selectedDisaster}
              userRole={userProfile.role}
            />

            {/* 3. Catastrophe Peril Selection */}
            <DisasterSelector
              selectedDisaster={selectedDisaster}
              onSelectDisaster={setSelectedDisaster}
            />

            {/* 4. Primary "Analyze Risk" CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full h-14 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-extrabold text-base flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Analyze Risk for {selectedLocation.name.split(',')[0]}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Peril Details */}
        {currentStep === 2 && (
          <div className="flex flex-col space-y-6">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-mono text-[11px] font-semibold uppercase tracking-wider border border-[#A7F3D0]">
                Step 2 of 6
              </span>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[#1E293B]">
                Selected Hazard Peril
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Review the modeled catastrophe scenario for {selectedLocation.name}.
              </p>
            </div>

            <DisasterSelector
              selectedDisaster={selectedDisaster}
              onSelectDisaster={setSelectedDisaster}
            />

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-14 px-6 rounded-full bg-white text-[#1E293B] font-space font-medium text-sm flex items-center justify-center border border-[#CBD5E1] hover:bg-[#F8FAFC]"
              >
                Back to Map
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 h-14 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-space font-bold text-base flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Compute Risk &amp; View Incident (Step 3)</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Risk Summary & 10-Second Simulation Viewer */}
        {currentStep === 3 && (
          <div className="flex flex-col space-y-8">
            <RiskSummaryView
              riskResult={riskResult}
              onEstimateLoss={() => setCurrentStep(4)}
              onExploreInsurance={() => setCurrentStep(5)}
              onDownloadPdf={handleDownloadRiskPdf}
            />

            <div className="pt-4 border-t border-[#E2E8F0]">
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
          </>
        )}
      </main>

      {/* Floating Bottom Quick Action Bar for Desktop / Tablet */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] py-3 px-4 z-40 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-[#64748B] truncate">
            <span className="text-[#059669] font-bold">RiskLens TN:</span>
            <span className="text-[#1E293B] font-medium truncate">{selectedLocation.name}</span>
            <span>·</span>
            <span className="capitalize text-[#0D9488] font-medium">{selectedDisaster}</span>
            <span>·</span>
            <span>Score: <strong className="text-[#1E293B]">{riskResult.vulnerabilityIndex}/100</strong></span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleDownloadRiskPdf}
              title="Download Risk PDF"
              className="px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#059669] text-xs font-mono text-[#1E293B] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#059669]">picture_as_pdf</span>
              <span className="hidden sm:inline">Risk PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadInsurancePdf}
              title="Download Pricing PDF"
              className="px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#0D9488] text-xs font-mono text-[#1E293B] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0D9488]">receipt_long</span>
              <span className="hidden sm:inline">Pricing PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Autonomous Data Discovery & Datasets Hub Modal */}
      <DatasetHub
        isOpen={showDataHub}
        onClose={() => setShowDataHub(false)}
        selectedLocation={selectedLocation}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-[#059669] rounded-2xl px-4 py-3 text-xs font-mono text-[#1E293B] shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#059669] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
