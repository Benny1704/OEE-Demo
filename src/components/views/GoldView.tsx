// src/components/views/GoldView.tsx
import React, { useEffect, useState } from 'react';
import { 
  Activity, Zap, CheckCircle2, Factory, AlertTriangle, 
  Cpu, Server, Wifi, ClipboardList, 
  Layers, ArrowRight, Timer, AlertOctagon
} from 'lucide-react';
import { type Stage } from '../../types';
import { fetchSystemHealth, fetchPlantOverview, fetchStages, fetchMaintenanceQueue } from '../../services/api';
import type { SystemHealth, PlantOverviewResponse, StageDetailAPI, MaintenanceTask } from '../../types/api';

interface GoldViewProps {
  onStageClick: (stage: Stage) => void;
  onNavigateToAlert?: (equipId: string) => void;
}

const GoldView: React.FC<GoldViewProps> = ({ onStageClick }) => {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [plantData, setPlantData] = useState<PlantOverviewResponse | null>(null);
  const [stagesData, setStagesData] = useState<StageDetailAPI[]>([]);
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceTask[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, overview, stagesRes, maintenanceRes] = await Promise.all([
          fetchSystemHealth(),
          fetchPlantOverview(),
          fetchStages(),
          fetchMaintenanceQueue()
        ]);
        setHealthData(health);
        setPlantData(overview);
        setStagesData(stagesRes.stages.sort((a, b) => a.order - b.order));
        setMaintenanceQueue(maintenanceRes.queue);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper for Bento Card Styles
  const bentoCardClass = "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300";

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* --- ROW 1: KPI BENTO GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: OEE */}
        <div className={`${bentoCardClass} p-6 relative group`}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                 <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg">OEE</span>
           </div>
           <div>
              <div className="text-3xl font-black text-[var(--color-text-main)] tracking-tight mb-1">
                 {plantData?.kpis.oee ?? 0}<span className="text-lg text-[var(--color-text-muted)] ml-1">%</span>
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Overall Efficiency</div>
           </div>
        </div>

        {/* KPI 2: Yield */}
        <div className={`${bentoCardClass} p-6 relative group`}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg">Yield</span>
           </div>
           <div>
              <div className="text-3xl font-black text-[var(--color-text-main)] tracking-tight mb-1">
                 {plantData?.kpis.yield_pct ?? 0}<span className="text-lg text-[var(--color-text-muted)] ml-1">%</span>
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Quality Rate</div>
           </div>
        </div>

        {/* KPI 3: Production */}
        <div className={`${bentoCardClass} p-6 relative group`}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                 <Factory className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg">Output</span>
           </div>
           <div>
              <div className="text-3xl font-black text-[var(--color-text-main)] tracking-tight mb-1">
                 {plantData?.kpis.production_rate_tons_hr ?? 0}<span className="text-lg text-[var(--color-text-muted)] ml-1">t/h</span>
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Production Rate</div>
           </div>
        </div>

        {/* KPI 4: Risk */}
        <div className={`${bentoCardClass} p-6 relative group`}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                 <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg">Risk</span>
           </div>
           <div>
              <div className="text-3xl font-black text-[var(--color-text-main)] tracking-tight mb-1">
                 {plantData?.kpis.high_risk_equipment ?? 0}<span className="text-lg text-[var(--color-text-muted)] ml-1">Qty</span>
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">High Risk Assets</div>
           </div>
        </div>
      </div>

      {/* --- ROW 2: PRODUCTION PIPELINE (BIG BENTO) --- */}
      <div className={`${bentoCardClass} p-8 min-h-[320px] flex flex-col justify-center relative`}>
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

         <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
               <h3 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Production Pipeline
               </h3>
               <p className="text-sm text-[var(--color-text-muted)] mt-1">Real-time stage monitoring and health status</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> OK</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
            </div>
         </div>

         {/* Grid Layout for Stages (No Scrollbar) */}
         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 relative z-10">
            {stagesData.map((stage, index) => {
               const statusConfig = {
                  green: { 
                     bg: 'bg-emerald-500/5 hover:bg-emerald-500/10', 
                     border: 'border-emerald-500/20 hover:border-emerald-500/40', 
                     text: 'text-emerald-500', 
                     indicator: 'bg-emerald-500'
                  },
                  yellow: { 
                     bg: 'bg-amber-500/5 hover:bg-amber-500/10', 
                     border: 'border-amber-500/20 hover:border-amber-500/40', 
                     text: 'text-amber-500', 
                     indicator: 'bg-amber-500'
                  },
                  red: { 
                     bg: 'bg-rose-500/5 hover:bg-rose-500/10', 
                     border: 'border-rose-500/20 hover:border-rose-500/40', 
                     text: 'text-rose-500', 
                     indicator: 'bg-rose-500 animate-pulse'
                  },
               }[stage.status] || { bg: 'bg-[var(--color-surface)]', border: 'border-[var(--color-border)]', text: 'text-[var(--color-text-muted)]', indicator: 'bg-gray-500' };

               return (
                  <div 
                     key={stage.stage_id}
                     onClick={() => onStageClick(stage as unknown as Stage)}
                     className={`
                        group relative flex flex-col justify-between
                        h-40 rounded-2xl border cursor-pointer transition-all duration-300
                        ${statusConfig.bg} ${statusConfig.border}
                     `}
                  >
                     {/* Connector Line (Visual only, hidden on mobile/grid wrap) */}
                     {index < stagesData.length - 1 && (
                        <div className="hidden xl:block absolute -right-5 top-1/2 w-6 h-0.5 bg-[var(--color-border)] z-0" />
                     )}

                     <div className="p-4 relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-auto">
                           <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider opacity-60">
                              0{index + 1}
                           </span>
                           <div className={`w-2 h-2 rounded-full ${statusConfig.indicator}`} />
                        </div>

                        <div className="mb-4">
                           <h4 className="font-bold text-[var(--color-text-main)] text-sm leading-tight">
                              {stage.name}
                           </h4>
                           <span className={`text-[10px] font-bold uppercase ${statusConfig.text} mt-1 block`}>
                              {stage.status === 'green' ? 'Normal' : stage.status === 'yellow' ? 'Warning' : 'Critical'}
                           </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-3 mt-auto">
                           <div className="flex flex-col">
                              <span className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold">Risk</span>
                              <span className={`text-xs font-mono font-bold ${stage.high_risk_count > 0 ? 'text-rose-500' : 'text-[var(--color-text-main)]'}`}>
                                 {stage.high_risk_count}
                              </span>
                           </div>
                           <div className="p-1.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)] group-hover:bg-blue-500 group-hover:text-white transition-colors">
                              <ArrowRight className="w-3 h-3" />
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* --- ROW 3: MAINTENANCE & HEALTH (SPLIT BENTO) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
         
         {/* COL 1: MAINTENANCE QUEUE (2/3 Width) */}
         <div className={`${bentoCardClass} lg:col-span-2 flex flex-col`}>
             <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-hover)]">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/10 rounded-xl">
                      <ClipboardList className="w-5 h-5 text-blue-500" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-main)]">Action Queue</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Prioritized maintenance tasks</p>
                   </div>
                </div>
                {maintenanceQueue.length > 0 && (
                   <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm shadow-blue-500/20">
                      {maintenanceQueue.length} Tasks
                   </span>
                )}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {maintenanceQueue.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50">
                      <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500" />
                      <p className="text-lg font-bold">All Systems Clear</p>
                      <p className="text-sm">No pending maintenance</p>
                   </div>
                ) : (
                   maintenanceQueue.map((task, i) => (
                      <div 
                         key={i} 
                         className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30 hover:shadow-sm transition-all group"
                      >
                         {/* Priority Box */}
                         <div className={`
                            w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border
                            ${task.priority <= 3 
                               ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' 
                               : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}
                         `}>
                            <span className="text-[10px] font-bold uppercase">Pri</span>
                            <span className="text-lg font-black leading-none">{task.priority}</span>
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                               <h4 className="text-sm font-bold text-[var(--color-text-main)] truncate">{task.equipment_name}</h4>
                               <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  task.urgency === 'immediate' || task.urgency === 'next_shift' 
                                  ? 'bg-amber-500/10 text-amber-500' 
                                  : 'bg-blue-500/10 text-blue-500'
                               }`}>
                                  {task.urgency.replace('_', ' ')}
                               </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-text-main)] transition-colors line-clamp-1">
                               {task.action}
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                               <span className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)]">
                                  <Layers className="w-3 h-3" /> {task.stage_name}
                               </span>
                               <span className="flex items-center gap-1.5">
                                  <Timer className="w-3 h-3" /> {task.estimated_downtime_mins}m est.
                               </span>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
         </div>

         {/* COL 2: SYSTEM HEALTH (1/3 Width) */}
         <div className={`${bentoCardClass} p-6 flex flex-col justify-between`}>
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Cpu className="w-5 h-5 text-emerald-500" />
                   </div>
                   <h3 className="text-lg font-bold text-[var(--color-text-main)]">System Health</h3>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                         </span>
                         <span className="text-sm font-bold text-[var(--color-text-muted)]">Status</span>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-text-main)] uppercase tracking-wider">{healthData?.status || 'OK'}</span>
                   </div>

                   <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                         <Server className="w-4 h-4 text-blue-500" />
                         <span className="text-sm font-bold text-[var(--color-text-muted)]">Equipment</span>
                      </div>
                      <span className="text-xl font-mono font-bold text-[var(--color-text-main)]">{healthData?.equipment_count ?? '--'}</span>
                   </div>

                   <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                         <Wifi className="w-4 h-4 text-purple-500" />
                         <span className="text-sm font-bold text-[var(--color-text-muted)]">Sensors</span>
                      </div>
                      <span className="text-xl font-mono font-bold text-[var(--color-text-main)]">{healthData?.sensor_count ?? '--'}</span>
                   </div>
                </div>
             </div>

             <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                   <span className="font-bold uppercase tracking-wider">Last Sync</span>
                   <span className="font-mono">
                      {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : '...'}
                   </span>
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default GoldView;