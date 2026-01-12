import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../shared/Card';
import type { Stage, EquipmentSummary } from '../../types';

interface SilverViewProps {
  stage: Stage;
  onEquipClick: (eq: EquipmentSummary) => void;
}

const SilverView: React.FC<SilverViewProps> = ({ stage, onEquipClick }) => {
  // Guard clause to prevent rendering if data is missing
  if (!stage.risk_distribution || !stage.equipment) return <div>No detail data available</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Risk Distribution Card */}
        <Card className="p-6 lg:col-span-1 h-fit">
           <h3 className="text-lg font-bold mb-6 text-[var(--color-text-main)]">Risk Distribution</h3>
           <div className="space-y-6">
             {Object.entries(stage.risk_distribution).map(([risk, count]) => {
                const colors: Record<string, string> = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-rose-500" };
                const textColors: Record<string, string> = { low: "text-emerald-500", medium: "text-amber-500", high: "text-rose-500" };
                const total = Object.values(stage.risk_distribution!).reduce((a, b) => a + b, 0);
                
                return (
                  <div key={risk}>
                    <div className="flex justify-between items-end mb-2">
                       <span className={`text-sm font-bold capitalize ${textColors[risk]}`}>{risk} Risk</span>
                       <span className="text-xs text-[var(--color-text-muted)]">{count} Assets</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${colors[risk]}`} 
                         style={{ width: `${(count / total) * 100}%` }}
                       />
                    </div>
                  </div>
                );
             })}
           </div>
        </Card>

        {/* Equipment List Grid */}
        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stage.equipment.map(eq => {
                 const statusColors: any = {
                   green: { border: "border-emerald-500/30", text: "text-emerald-500", bg: "bg-emerald-500/5", glow: "shadow-emerald-500/20" },
                   yellow: { border: "border-amber-500/30", text: "text-amber-500", bg: "bg-amber-500/5", glow: "shadow-amber-500/20" },
                   red: { border: "border-rose-500/30", text: "text-rose-500", bg: "bg-rose-500/5", glow: "shadow-rose-500/20" }
                 };
                 const theme = statusColors[eq.status];

                 return (
                   <Card 
                     key={eq.equip_id} 
                     onClick={() => onEquipClick(eq)}
                     className={`cursor-pointer hover:scale-[1.02] transition-transform p-5 border ${theme.border} group`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-[var(--color-text-main)]">{eq.equip_id}</h4>
                            <p className="text-xs text-[var(--color-text-muted)]">{eq.type_display}</p>
                         </div>
                         <div className={`w-3 h-3 rounded-full ${theme.text.replace('text', 'bg')} shadow-[0_0_8px_currentColor]`} />
                      </div>
                      
                      <div className="flex items-end justify-between">
                         <div>
                            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Failure Risk</p>
                            <p className={`text-2xl font-bold font-mono ${theme.text}`}>{(eq.failure_probability * 100).toFixed(0)}%</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Health</p>
                            <div className="flex items-center gap-1 justify-end">
                              <Activity className="w-4 h-4 text-[var(--color-text-muted)]" />
                              <span className="text-lg font-bold text-[var(--color-text-main)]">{eq.health_score}</span>
                            </div>
                         </div>
                      </div>
                   </Card>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SilverView;