// src/App.tsx
import { useState, Suspense, lazy } from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { useTheme } from './hooks/useTheme';
// Note: We keep mock imports for fallbacks or non-integrated views (Bronze/Data)
import { mockPlantData, mockStageData, mockEquipmentData, mockSensorHistory } from './data/mockData';
import type { Stage, EquipmentSummary, Sensor } from './types';

// Lazy Load Views for Code Splitting
const GoldView = lazy(() => import('./components/views/GoldView'));
const SilverView = lazy(() => import('./components/views/SilverView'));
const BronzeView = lazy(() => import('./components/views/BronzeView'));
const DataView = lazy(() => import('./components/views/DataView'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <p className="text-sm font-medium animate-pulse">Loading View...</p>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<"gold" | "silver" | "bronze" | "data">("gold");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSummary | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation Handlers
  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
    setCurrentView("silver");
  };

  const handleEquipmentClick = (equipment: EquipmentSummary) => {
    setSelectedEquipment(equipment);
    setCurrentView("bronze");
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setCurrentView("data");
  };

  const handleBreadcrumb = (view: "gold" | "silver" | "bronze") => {
    if (view === "gold") {
      setCurrentView("gold");
      setSelectedStage(null);
      setSelectedEquipment(null);
      setSelectedSensor(null);
    } else if (view === "silver") {
      setCurrentView("silver");
      setSelectedEquipment(null);
      setSelectedSensor(null);
    } else if (view === "bronze") {
      setCurrentView("bronze");
      setSelectedSensor(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)] text-[var(--color-text-main)] font-sans custom-scrollbar transition-colors duration-300">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={currentView}
        handleViewChange={(view) => handleBreadcrumb(view)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar (Mobile Only) */}
        <div className="lg:hidden h-16 border-b border-[var(--color-border)] flex items-center justify-between px-4 bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--color-text-muted)]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-[var(--color-text-main)]">Dashboard</span>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             
             {/* Dynamic Breadcrumbs & Header */}
             <div className="mb-8 animate-fade-in">
               <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-4">
                 <button onClick={() => handleBreadcrumb('gold')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'gold' ? 'text-blue-500 font-bold' : ''}`}>Plant</button>
                 {currentView !== 'gold' && (
                    <>
                      <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                      <button onClick={() => handleBreadcrumb('silver')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'silver' ? 'text-blue-500 font-bold' : ''}`}>
                         {selectedStage ? selectedStage.name : mockStageData.name}
                      </button>
                    </>
                 )}
                 {(currentView === 'bronze' || currentView === 'data') && (
                    <>
                      <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                      <button onClick={() => handleBreadcrumb('bronze')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'bronze' ? 'text-blue-500 font-bold' : ''}`}>
                         {selectedEquipment ? selectedEquipment.equip_id : mockEquipmentData.equip_id}
                      </button>
                    </>
                 )}
                 {currentView === 'data' && (
                    <>
                       <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                       <span className="text-blue-500 font-bold">{selectedSensor?.name}</span>
                    </>
                 )}
               </nav>

               <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-bold text-[var(--color-text-main)] tracking-tight">
                       {currentView === 'gold' && "Production Overview"}
                       {currentView === 'silver' && (selectedStage ? selectedStage.name : mockStageData.name)}
                       {currentView === 'bronze' && (selectedEquipment ? selectedEquipment.equip_id : mockEquipmentData.equip_id)}
                       {currentView === 'data' && (selectedSensor ? selectedSensor.name : "Sensor Data")}
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-2 font-medium">
                       {currentView === 'gold' && "Real-time plant monitoring and critical alerts"}
                       {currentView === 'silver' && "Stage-level equipment status and risk assessment"}
                       {currentView === 'bronze' && "Diagnostic telemetry and health analysis"}
                       {currentView === 'data' && "Historical time-series analysis"}
                    </p>
                  </div>
                  {currentView === 'gold' && (
                    <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-sm font-bold text-[var(--color-text-main)]">{mockPlantData.kpis.active_alerts} Alerts</span>
                    </div>
                  )}
               </div>
             </div>

             {/* Content Views with Suspense */}
             <Suspense fallback={<PageLoader />}>
                {currentView === 'gold' && (
                  <GoldView onStageClick={handleStageClick} />
                )}
                
                {/* Updated SilverView integration */}
                {currentView === 'silver' && selectedStage && (
                  <SilverView 
                    stageId={selectedStage.stage_id} 
                    onEquipClick={handleEquipmentClick} 
                  />
                )}
                
                {currentView === 'bronze' && (
                  <BronzeView 
                      // Use the selectedEquipment ID if available, otherwise fallback to mock ID for dev
                      equipId={selectedEquipment?.equip_id || mockEquipmentData.equip_id} 
                      onSensorClick={handleSensorClick} 
                  />
                )}
                
                {currentView === 'data' && (
                  <DataView sensor={mockSensorHistory} />
                )}
             </Suspense>
             
          </div>
        </main>
      </div>
    </div>
  );
}