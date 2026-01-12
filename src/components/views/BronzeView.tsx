import React from 'react';
import { Microscope, Clock, List } from 'lucide-react';
import { Card } from '../shared/Card';
import type { EquipmentDetail, Sensor } from '../../types';

interface BronzeViewProps {
  equipment: EquipmentDetail;
  onSensorClick: (s: Sensor) => void;
}

const BronzeView: React.FC<BronzeViewProps> = ({ equipment, onSensorClick }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-rose-500/5 z-0" />
             <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-rose-500/30 bg-[var(--color-bg)] mb-4 relative">
                   <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin-slow opacity-50" />
                   <div>
                      <span className="block text-4xl font-bold font-mono text-rose-500">{equipment.health.health_score}</span>
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Health Score</span>
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-1">CRITICAL RISK</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Failure Probability: <span className="text-rose-500 font-bold">{(equipment.health.failure_probability * 100).toFixed(0)}%</span></p>
             </div>
             <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="p-3 rounded-xl bg-[var(--color-surface-hover)] text-center">
                   <span className="block text-xs text-[var(--color-text-muted)] uppercase mb-1">Rem. Life</span>
                   <span className="font-bold text-[var(--color-text-main)]">{equipment.health.predicted_remaining_heats} Heats</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-surface-hover)] text-center">
                   <span className="block text-xs text-[var(--color-text-muted)] uppercase mb-1">Rem. Time</span>
                   <span className="font-bold text-[var(--color-text-main)]">{equipment.health.predicted_remaining_hours} Hrs</span>
                </div>
             </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
                <Microscope className="w-5 h-5 text-purple-500" /> Root Cause Analysis (AI)
             </h3>
             <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-[var(--color-text-main)] leading-relaxed">
                <span className="font-bold text-purple-400">Analysis: </span>
                {equipment.llm_explanation}
             </div>
             <div className="space-y-4">
                {equipment.shap_features.map(f => {
                   const isRisk = f.direction === 'increases_risk';
                   return (
                      <div key={f.feature}>
                         <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-[var(--color-text-muted)]">{f.display_name} ({f.value})</span>
                            <span className={isRisk ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                               {isRisk ? '+' : ''}{f.shap_value.toFixed(2)} impact
                            </span>
                         </div>
                         <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden flex">
                            <div className="w-1/2 flex justify-end">
                               {!isRisk && <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${Math.abs(f.shap_value) * 100}%` }} />}
                            </div>
                            <div className="w-px bg-[var(--color-border)] z-10" />
                            <div className="w-1/2">
                               {isRisk && <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${Math.abs(f.shap_value) * 100}%` }} />}
                            </div>
                         </div>
                      </div>
                   )
                })}
             </div>
          </Card>
       </div>

       <div>
          <h3 className="text-lg font-bold mb-4 text-[var(--color-text-main)]">Live Sensor Telemetry</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {equipment.sensors.map(sensor => {
                const isWarn = sensor.status === 'warning';
                return (
                   <Card 
                     key={sensor.sensor_id} 
                     onClick={() => onSensorClick(sensor)}
                     className={`p-4 cursor-pointer hover:border-blue-500/50 transition-colors ${isWarn ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
                   >
                      <p className="text-xs text-[var(--color-text-muted)] uppercase mb-2">{sensor.name}</p>
                      <p className="text-2xl font-bold font-mono text-[var(--color-text-main)] flex items-baseline gap-1">
                         {sensor.value} <span className="text-sm font-sans text-[var(--color-text-muted)] font-normal">{sensor.unit}</span>
                      </p>
                      <div className={`mt-2 text-[10px] font-bold uppercase flex items-center gap-1 ${isWarn ? 'text-amber-500' : 'text-emerald-500'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${isWarn ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                         {sensor.status}
                      </div>
                   </Card>
                )
             })}
          </div>
       </div>

       <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
             <List className="w-5 h-5 text-blue-500" /> Recommended Actions
          </h3>
          <div className="space-y-3">
             {equipment.recommendations.map(rec => {
                const colors: any = { immediate: "border-rose-500 bg-rose-500/10 text-rose-500", soon: "border-amber-500 bg-amber-500/10 text-amber-500", planned: "border-blue-500 bg-blue-500/10 text-blue-500" };
                const c = colors[rec.urgency];
                return (
                   <div key={rec.priority} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold ${c}`}>
                            {rec.priority}
                         </div>
                         <div>
                            <p className="font-medium text-[var(--color-text-main)]">{rec.action}</p>
                            <p className={`text-xs uppercase font-bold mt-0.5 ${c.split(' ').pop()}`}>{rec.urgency}</p>
                         </div>
                      </div>
                      <div className="text-sm font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {rec.estimated_time_mins} min
                      </div>
                   </div>
                )
             })}
          </div>
       </Card>
    </div>
  );
};
export default BronzeView;