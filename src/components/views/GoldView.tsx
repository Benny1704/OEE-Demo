import React from 'react';
import { Activity, ArrowRight, Zap, CheckCircle2, Factory, AlertTriangle, AlertOctagon } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { Card } from '../shared/Card';
import { mockPlantData } from '../../data/mockData';
import { type Stage } from '../../types';

interface GoldViewProps {
  onStageClick: (stage: Stage) => void;
}

const GoldView: React.FC<GoldViewProps> = ({ onStageClick }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Plant KPIs</h2>
        <div className="px-3 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)]">Live Data</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Plant OEE" value={mockPlantData.kpis.oee} unit="%" trend={2.3} icon={Zap} color="blue" />
        <MetricCard title="Yield" value={mockPlantData.kpis.yield_pct} unit="%" trend={1.1} icon={CheckCircle2} color="emerald" />
        <MetricCard title="Production" value={mockPlantData.kpis.production_rate_tons_hr} unit="t/h" trend={-0.5} icon={Factory} color="purple" />
        <MetricCard title="At Risk Assets" value={mockPlantData.kpis.high_risk_equipment} unit="" icon={AlertTriangle} color="rose" subtitle={`${mockPlantData.kpis.active_alerts} Active Alerts`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--color-text-main)]">
            <Activity className="w-5 h-5 text-blue-500" /> Production Flow
          </h3>
          <div className="relative flex items-center gap-4 overflow-x-auto pb-6 scrollbar-thin">
             {mockPlantData.stages.map((stage, i) => {
                const statusColors = {
                  green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20",
                  yellow: "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20",
                  red: "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                };
                const dotColors = {
                  green: "bg-emerald-500",
                  yellow: "bg-amber-500",
                  red: "bg-rose-500"
                };

                return (
                  <div key={stage.stage_id} className="flex items-center shrink-0">
                    <button 
                      onClick={() => onStageClick(stage)}
                      className={`relative group w-40 p-4 rounded-2xl border transition-all duration-300 ${statusColors[stage.status]} hover:shadow-lg`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className={`w-3 h-3 rounded-full ${dotColors[stage.status]} shadow-[0_0_8px_currentColor]`} />
                         <span className="text-[10px] font-bold uppercase opacity-70">{stage.equipment_count} EQ</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-[var(--color-text-main)] mb-1">{stage.name}</p>
                        <p className="text-xs opacity-80">{(stage.high_risk_count ?? 0) > 0 ? `${stage.high_risk_count} Risk` : 'Optimal'}</p>
                      </div>
                    </button>
                    {i < mockPlantData.stages.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] mx-2 opacity-50" />
                    )}
                  </div>
                );
             })}
          </div>
        </Card>

        <Card className="p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
             <AlertOctagon className="w-5 h-5 text-rose-500" /> Critical Alerts
           </h3>
           <div className="space-y-3">
             {mockPlantData.alerts.map(alert => (
               <div key={alert.alert_id} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                 <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                 <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-sm font-bold text-[var(--color-text-main)]">{alert.equipment}</span>
                     <span className="text-xs font-mono text-rose-500 font-bold">{(alert.failure_probability * 100).toFixed(0)}% PROB</span>
                   </div>
                   <p className="text-xs text-[var(--color-text-muted)]">{alert.message}</p>
                 </div>
               </div>
             ))}
           </div>
        </Card>
      </div>
    </div>
  );
};
export default GoldView;