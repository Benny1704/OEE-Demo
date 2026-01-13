// src/App.tsx
import { useState, Suspense, lazy, useEffect } from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { useTheme } from './hooks/useTheme';
import { AlertsModal } from './components/shared/AlertsModal'; 
import { fetchPlantOverview } from './services/api';
import { mockStageData, mockEquipmentData } from './data/mockData';
import type { Stage, EquipmentSummary, Sensor } from './types';

// Lazy Load Views
const GoldView = lazy(() => import('./components/views/GoldView'));
const SilverView = lazy(() => import('./components/views/SilverView'));
const BronzeView = lazy(() => import('./components/views/BronzeView'));
const DataView = lazy(() => import('./components/views/DataView'));

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
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [activeAlertCount, setActiveAlertCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchPlantOverview();
        setActiveAlertCount(data.kpis.active_alerts);
      } catch (e) {
        console.error("Failed to fetch plant stats", e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
    setCurrentView("silver");
  };

  const handleEquipmentClick = (equipment: EquipmentSummary) => {
    setSelectedEquipment(equipment);
    setCurrentView("bronze");
  };

  const handleNavigateFromAlert = (equipId: string) => {
    const dummyEquip: EquipmentSummary = {
      equip_id: equipId,
      type_display: 'Unknown',
      status: 'yellow',
      health_score: 0,
      failure_probability: 0,
      risk_category: 'low',
      type: 'Unknown',
      stage: 'Unknown'
    };
    setSelectedEquipment(dummyEquip);
    setCurrentView("bronze");
    setIsAlertsOpen(false);
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
      
      <AlertsModal 
        isOpen={isAlertsOpen} 
        onClose={() => setIsAlertsOpen(false)} 
        onNavigate={handleNavigateFromAlert}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={currentView}
        handleViewChange={(view) => handleBreadcrumb(view)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="lg:hidden h-16 border-b border-[var(--color-border)] flex items-center justify-between px-4 bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--color-text-muted)]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-[var(--color-text-main)]">Dashboard</span>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             
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
                  
                  {/* ALERTS PILL - NOW VISIBLE IN ALL VIEWS */}
                  <button 
                    onClick={() => setIsAlertsOpen(true)}
                    className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm hover:border-rose-500/50 hover:bg-rose-500/5 transition-all cursor-pointer group"
                  >
                      <div className={`w-2 h-2 rounded-full ${activeAlertCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-sm font-bold text-[var(--color-text-main)] group-hover:text-rose-500 transition-colors">
                        {activeAlertCount} Alerts
                      </span>
                  </button>
               </div>
             </div>

             <Suspense fallback={<PageLoader />}>
                {currentView === 'gold' && (
                  <GoldView 
                    onStageClick={handleStageClick} 
                    onNavigateToAlert={handleNavigateFromAlert}
                  />
                )}
                {currentView === 'silver' && selectedStage && (
                  <SilverView stageId={selectedStage.stage_id} onEquipClick={handleEquipmentClick} />
                )}
                {currentView === 'bronze' && (
                  <BronzeView 
                    equipId={selectedEquipment?.equip_id || mockEquipmentData.equip_id} 
                    onSensorClick={handleSensorClick} 
                  />
                )}
                {currentView === 'data' && (
                  <DataView sensorId={selectedSensor?.sensor_id || 'TUNDISH-002-STEEL_TEMP_C'} />
                )}
             </Suspense>
             
          </div>
        </main>
      </div>
    </div>
  );
}