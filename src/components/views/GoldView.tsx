// src/components/views/GoldView.tsx
import React, { useEffect, useState } from 'react';
import { 
  Activity, Zap, CheckCircle2, Factory, AlertTriangle, 
  Cpu, ArrowRight, Server, Wifi, Wrench, ClipboardList 
} from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Top KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
            <MetricCard title="Plant OEE" value={plantData?.kpis.oee ?? 0} unit="%" trend={0} icon={Zap} color="blue" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
            <MetricCard title="Yield" value={plantData?.kpis.yield_pct ?? 0} unit="%" trend={0} icon={CheckCircle2} color="emerald" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
            <MetricCard title="Production" value={plantData?.kpis.production_rate_tons_hr ?? 0} unit="t/h" trend={0} icon={Factory} color="purple" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10">
            <MetricCard title="Risk Level" value={plantData?.kpis.high_risk_equipment ?? 0} unit="High" icon={AlertTriangle} color="rose" />
        </div>
      </div>

      {/* 2. Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Production Flow */}
        <div className="lg:col-span-2 h-[480px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col relative overflow-hidden">
           <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">Production Flow</h3>
           </div>
           <div className="flex flex-1 gap-2 w-full h-full min-h-0">
             {stagesData.map((stage) => {
                const statusConfig = {
                  green: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20" },
                  yellow: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", gradient: "from-amber-500/20" },
                  red: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", gradient: "from-rose-500/20" },
                }[stage.status] || { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", gradient: "from-gray-500/20" };

                return (
                  <div 
                    key={stage.stage_id}
                    onClick={() => onStageClick(stage as unknown as Stage)}
                    className={`group relative cursor-pointer flex-1 hover:flex-[6] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] rounded-xl border ${statusConfig.border} bg-[var(--color-bg)] overflow-hidden flex flex-col`}
                  >
                     <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b ${statusConfig.gradient} to-transparent pointer-events-none`} />
                     <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 delay-100 group-hover:delay-0">
                        <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                           <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{stage.name.split(' ')[0]}</h4>
                        </div>
                     </div>
                     <div className="absolute inset-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 flex flex-col">
                        <div className="flex justify-between items-start mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                           <div className="flex flex-col min-w-0">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.color} mb-1`}>{stage.status}</span>
                              <h3 className="text-xl font-bold text-[var(--color-text-main)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{stage.name}</h3>
                           </div>
                           <div className={`shrink-0 ml-2 p-2 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}><ArrowRight className={`w-4 h-4 ${statusConfig.color}`} /></div>
                        </div>
                        <div className="mt-auto space-y-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-700 delay-150 ease-out">
                           <div className="grid grid-cols-2 gap-2">
                              <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Equipment</div>
                                 <div className="text-xl font-bold text-[var(--color-text-main)]">{stage.equipment_count}</div>
                              </div>
                              <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Risk</div>
                                 <div className={`text-xl font-bold ${stage.high_risk_count > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{stage.high_risk_count}</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                );
             })}
           </div>
        </div>

        {/* RIGHT: Stats + Maintenance Queue */}
        <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Stats Cards */}
            <div className="shrink-0 grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
                   <div className="flex items-center gap-2 mb-1"><Cpu className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">System</span></div>
                   <p className="text-lg font-bold text-[var(--color-text-main)] uppercase">{healthData?.status || "N/A"}</p>
                </div>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
                   <div className="flex items-center gap-2 mb-1"><Server className="w-4 h-4 text-blue-500" /><span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Active Eq.</span></div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">{healthData?.equipment_count ?? 0}</p>
                </div>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
                   <div className="flex items-center gap-2 mb-1"><Wifi className="w-4 h-4 text-purple-500" /><span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Sensors</span></div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">{healthData?.sensor_count ?? 0}</p>
                </div>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
                   <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-amber-500" /><span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Updated</span></div>
                   <p className="text-xs font-bold text-[var(--color-text-main)] leading-tight mt-1">{healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--"}</p>
                </div>
            </div>

            {/* MAINTENANCE QUEUE (Replacing Action Center) */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-[var(--color-border)] bg-blue-500/5">
                   <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--color-text-main)]">
                      <ClipboardList className="w-3 h-3 text-blue-500" /> 
                      Maintenance Queue
                   </div>
                   {maintenanceQueue.length > 0 && (
                      <span className="bg-blue-500 text-white text-[9px] px-1.5 rounded-full">{maintenanceQueue.length}</span>
                   )}
                </div>

                <div className="h-[280px] overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
                   {maintenanceQueue.map((task) => (
                        <div key={task.equip_id + task.action} className="relative p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:border-blue-500/30 transition-colors">
                           <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-2">
                                 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-muted)]">{task.priority}</span>
                                 <span className="text-xs font-bold text-[var(--color-text-main)]">{task.equipment_name}</span>
                              </div>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${task.urgency === 'immediate' || task.urgency === 'next_shift' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>{task.urgency.replace('_', ' ')}</span>
                           </div>
                           <div className="pl-7">
                              <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed line-clamp-2 mb-1">{task.action}</p>
                              <div className="flex items-center gap-3 text-[9px] text-[var(--color-text-muted)] opacity-70"><span className="flex items-center gap-1"><Wrench className="w-2.5 h-2.5" /> {task.estimated_downtime_mins}m est.</span><span>{task.stage_name}</span></div>
                           </div>
                        </div>
                   ))}
                   {maintenanceQueue.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50"><CheckCircle2 className="w-8 h-8 mb-2" /><p className="text-xs">Queue Empty</p></div>
                   )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GoldView;