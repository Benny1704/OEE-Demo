// src/components/views/BronzeView.tsx
import React, { useEffect, useState } from 'react';
import { Microscope, Clock, List, Activity, AlertCircle, Info } from 'lucide-react';
import { Card } from '../shared/Card';
import type { Sensor } from '../../types';
import type { 
  EquipmentExplanation, 
  RecommendationAPI, 
  EquipmentDetailResponse 
} from '../../types/api';
import { 
  fetchEquipmentExplanation, 
  fetchEquipmentRecommendations,
  fetchEquipmentDetail 
} from '../../services/api';

interface BronzeViewProps {
  equipId: string;
  onSensorClick: (s: Sensor) => void;
}

const BronzeView: React.FC<BronzeViewProps> = ({ equipId, onSensorClick }) => {
  const [equipment, setEquipment] = useState<EquipmentDetailResponse | null>(null);
  const [explanation, setExplanation] = useState<EquipmentExplanation | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all 3 endpoints in parallel to build the full view
        const [equipData, expData, recData] = await Promise.all([
          fetchEquipmentDetail(equipId),
          fetchEquipmentExplanation(equipId),
          fetchEquipmentRecommendations(equipId)
        ]);
        
        setEquipment(equipData);
        setExplanation(expData);
        setRecommendations(recData.recommendations);
      } catch (err) {
        console.error("Failed to load equipment details", err);
        setError("Failed to load equipment telemetry.");
      } finally {
        setLoading(false);
      }
    };

    if (equipId) {
      loadData();
    }
  }, [equipId]);

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-96 text-[var(--color-text-muted)] animate-pulse">
           <Activity className="w-10 h-10 mb-3 animate-spin" />
           <p className="font-bold">Establishing Secure Connection to {equipId}...</p>
        </div>
     );
  }

  if (error || !equipment) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-rose-500">
           <AlertCircle className="w-10 h-10 mb-3" />
           <p className="font-bold">{error || "Equipment not found"}</p>
        </div>
      );
  }

  // Use real health values from the API
  const { health_score, failure_probability, predicted_remaining_heats, predicted_remaining_hours } = equipment.health;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       
       {/* Identity / Info Header (Optional small strip) */}
       <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-lg">
          <Info className="w-4 h-4" />
          <span className="font-mono font-bold text-[var(--color-text-main)]">{equipment.type_display}</span>
          <span className="w-px h-4 bg-[var(--color-border)]" />
          <span>Model: <span className="text-[var(--color-text-main)]">{equipment.identity.model}</span></span>
          <span className="w-px h-4 bg-[var(--color-border)]" />
          <span>Installed: <span className="text-[var(--color-text-main)]">{equipment.identity.install_date}</span></span>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Health Score Card (Live Data) */}
          <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-rose-500/5 z-0" />
             <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-rose-500/30 bg-[var(--color-bg)] mb-4 relative">
                   <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin-slow opacity-50" />
                   <div>
                      <span className="block text-4xl font-bold font-mono text-rose-500">{health_score}</span>
                      <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold">Health Score</span>
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-1">
                   {health_score < 50 ? "CRITICAL RISK" : "MODERATE RISK"}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">Failure Probability: <span className="text-rose-500 font-bold">{(failure_probability * 100).toFixed(1)}%</span></p>
             </div>
             
             <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="p-3 rounded-xl bg-[var(--color-surface-hover)] text-center">
                   <span className="block text-xs text-[var(--color-text-muted)] uppercase mb-1">Rem. Life</span>
                   <span className="font-bold text-[var(--color-text-main)]">{predicted_remaining_heats} Heats</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-surface-hover)] text-center">
                   <span className="block text-xs text-[var(--color-text-muted)] uppercase mb-1">Rem. Time</span>
                   <span className="font-bold text-[var(--color-text-main)]">{predicted_remaining_hours} Hrs</span>
                </div>
             </div>
          </Card>

          {/* 2. Root Cause Analysis (Live API Data) */}
          <Card className="p-6 lg:col-span-2">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
                <Microscope className="w-5 h-5 text-purple-500" /> Root Cause Analysis (AI)
             </h3>
             <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-[var(--color-text-main)] leading-relaxed">
                <span className="font-bold text-purple-400">Analysis: </span>
                {explanation?.llm_explanation || "No analysis available."}
             </div>
             <div className="space-y-4">
                {explanation?.shap_features.map(f => {
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

       {/* 3. Live Sensor Telemetry (REAL API DATA) */}
       <div>
          <h3 className="text-lg font-bold mb-4 text-[var(--color-text-main)]">Live Sensor Telemetry</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {equipment.sensors.map(sensor => {
                // Map API status 'alarm'/'warning' to visual colors
                const isAlarm = sensor.status === 'alarm';
                const isWarn = sensor.status === 'warning';
                
                let borderColor = "border-[var(--color-border)]";
                let bgColor = "bg-[var(--color-surface)]";
                let statusColor = "text-emerald-500";
                let dotColor = "bg-emerald-500";
                
                if (isAlarm) {
                   borderColor = "border-rose-500/50";
                   bgColor = "bg-rose-500/5";
                   statusColor = "text-rose-500";
                   dotColor = "bg-rose-500";
                } else if (isWarn) {
                   borderColor = "border-amber-500/50";
                   bgColor = "bg-amber-500/5";
                   statusColor = "text-amber-500";
                   dotColor = "bg-amber-500";
                }

                return (
                   <Card 
                     key={sensor.sensor_id} 
                     // Cast API sensor to generic sensor type if needed, or pass directly
                     onClick={() => onSensorClick(sensor as unknown as Sensor)}
                     className={`p-4 cursor-pointer hover:border-blue-500/50 transition-colors border ${borderColor} ${bgColor}`}
                   >
                      <p className="text-xs text-[var(--color-text-muted)] uppercase mb-2 truncate" title={sensor.name}>
                        {sensor.name}
                      </p>
                      <p className="text-2xl font-bold font-mono text-[var(--color-text-main)] flex items-baseline gap-1">
                         {sensor.value} <span className="text-sm font-sans text-[var(--color-text-muted)] font-normal">{sensor.unit}</span>
                      </p>
                      <div className={`mt-2 text-[10px] font-bold uppercase flex items-center gap-1 ${statusColor}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                         {sensor.status}
                      </div>
                   </Card>
                )
             })}
          </div>
       </div>

       {/* 4. Recommended Actions (Live API Data) */}
       <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
             <List className="w-5 h-5 text-blue-500" /> Recommended Actions
          </h3>
          <div className="space-y-3">
             {recommendations.length === 0 ? (
                <div className="text-center p-4 text-[var(--color-text-muted)]">No recommendations generated.</div>
             ) : (
               recommendations.map((rec, idx) => {
                  const colors: any = { immediate: "border-rose-500 bg-rose-500/10 text-rose-500", soon: "border-amber-500 bg-amber-500/10 text-amber-500", planned: "border-blue-500 bg-blue-500/10 text-blue-500" };
                  const c = colors[rec.urgency];
                  return (
                     <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold ${c}`}>
                              {rec.priority}
                           </div>
                           <div>
                              <p className="font-medium text-[var(--color-text-main)]">{rec.action}</p>
                              {rec.reason && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{rec.reason}</p>}
                              <p className={`text-xs uppercase font-bold mt-1 ${c.split(' ').pop()}`}>{rec.urgency}</p>
                           </div>
                        </div>
                        <div className="text-sm font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {rec.estimated_time_mins} min
                        </div>
                     </div>
                  )
               })
             )}
          </div>
       </Card>
    </div>
  );
};
export default BronzeView;