import React from 'react';
import { 
  Activity, 
  Zap, 
  CheckCircle2, 
  Factory, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingUp,
  Cpu,
  Users,
  ArrowRight
} from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { mockPlantData } from '../../data/mockData';
import { type Stage } from '../../types';

interface GoldViewProps {
  onStageClick: (stage: Stage) => void;
}

const GoldView: React.FC<GoldViewProps> = ({ onStageClick }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Top KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
            <MetricCard title="Plant OEE" value={mockPlantData.kpis.oee} unit="%" trend={2.3} icon={Zap} color="blue" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
            <MetricCard title="Yield" value={mockPlantData.kpis.yield_pct} unit="%" trend={1.1} icon={CheckCircle2} color="emerald" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
            <MetricCard title="Production" value={mockPlantData.kpis.production_rate_tons_hr} unit="t/h" trend={-0.5} icon={Factory} color="purple" />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10">
            <MetricCard title="Risk Level" value={mockPlantData.kpis.high_risk_equipment} unit="High" icon={AlertTriangle} color="rose" />
        </div>
      </div>

      {/* 2. Main Layout: Reduced Height to 480px */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px]">
        
        {/* LEFT: Production Flow (Spans 2/3) */}
        <div className="lg:col-span-2 h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col relative overflow-hidden">
           {/* Header */}
           <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">Production Flow</h3>
              </div>
           </div>

           {/* The Accordion Container */}
           <div className="flex flex-1 gap-2 w-full h-full min-h-0">
             {mockPlantData.stages.map((stage) => {
                const statusConfig = {
                  green: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20" },
                  yellow: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", gradient: "from-amber-500/20" },
                  red: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", gradient: "from-rose-500/20" },
                }[stage.status];

                // FIX: Safely access optional properties with default values
                const riskCount = stage.high_risk_count ?? 0;
                const equipmentCount = stage.equipment_count ?? 0;

                return (
                  <div 
                    key={stage.stage_id}
                    onClick={() => onStageClick(stage)}
                    className={`
                      group relative cursor-pointer
                      flex-1 hover:flex-[6] 
                      transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                      rounded-xl border ${statusConfig.border}
                      bg-[var(--color-bg)] overflow-hidden
                      flex flex-col
                    `}
                  >
                     {/* Background Gradient Animation */}
                     <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b ${statusConfig.gradient} to-transparent pointer-events-none`} />

                     {/* COLLAPSED STATE */}
                     <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 delay-100 group-hover:delay-0">
                        <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                           <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                              {stage.name.split(' ')[0]}
                           </h4>
                        </div>
                     </div>

                     {/* EXPANDED STATE */}
                     <div className="absolute inset-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 flex flex-col">
                        {/* Title Row */}
                        <div className="flex justify-between items-start mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                           <div className="flex flex-col min-w-0">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.color} mb-1`}>
                                {stage.status}
                              </span>
                              <h3 className="text-xl font-bold text-[var(--color-text-main)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                 {stage.name}
                              </h3>
                           </div>
                           <div className={`shrink-0 ml-2 p-2 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}>
                              <ArrowRight className={`w-4 h-4 ${statusConfig.color}`} />
                           </div>
                        </div>

                        {/* Metrics Area */}
                        <div className="mt-auto space-y-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-700 delay-150 ease-out">
                           <div className="grid grid-cols-2 gap-2">
                              <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Equipment</div>
                                 <div className="text-xl font-bold text-[var(--color-text-main)]">{equipmentCount}</div>
                              </div>
                              <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                                 <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Risk</div>
                                 <div className={`text-xl font-bold ${riskCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {riskCount}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                );
             })}
           </div>
        </div>

        {/* RIGHT: Stats (Top) + Alerts (Bottom) */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            
            {/* A. System Stats (Top - 2x2 Grid) */}
            <div className="shrink-0 grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-emerald-500/50 transition-colors">
                   <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Health</span>
                   </div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">98%</p>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-amber-500/50 transition-colors">
                   <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Energy</span>
                   </div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">4.2<span className="text-xs ml-0.5">MW</span></p>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-blue-500/50 transition-colors">
                   <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Effic.</span>
                   </div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">87%</p>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-purple-500/50 transition-colors">
                   <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Users</span>
                   </div>
                   <p className="text-lg font-bold text-[var(--color-text-main)]">12</p>
                </div>
            </div>

            {/* B. Critical Alerts (Bottom - Fills remaining height) */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden min-h-0">
                <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                     <AlertOctagon className="w-4 h-4 text-rose-500" /> 
                     <h3 className="text-sm font-bold text-[var(--color-text-main)]">Critical Alerts</h3>
                  </div>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                     {mockPlantData.alerts.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {mockPlantData.alerts.map((alert) => (
                    <div 
                      key={alert.alert_id}
                      className="relative p-3 rounded-lg border border-rose-500/10 bg-gradient-to-r from-rose-500/5 to-transparent hover:bg-rose-500/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-xs font-bold text-[var(--color-text-main)]">{alert.equipment}</span>
                         <span className="text-[10px] text-rose-500 font-bold">{(alert.failure_probability * 100).toFixed(0)}% Risk</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                         {alert.message}
                      </p>
                    </div>
                  ))}
                  
                  {mockPlantData.alerts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50">
                       <CheckCircle2 className="w-8 h-8 mb-2" />
                       <p className="text-xs">No Alerts</p>
                    </div>
                  )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default GoldView;