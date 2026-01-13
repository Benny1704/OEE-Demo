// src/components/views/SilverView.tsx
import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Filter,
  X,
  RotateCcw
} from 'lucide-react';
import type { EquipmentSummary } from '../../types';
import type { StageDetailResponse } from '../../types/api';
import { fetchStageDetail } from '../../services/api';

interface SilverViewProps {
  stageId: string;
  onEquipClick: (eq: EquipmentSummary) => void;
}

type RiskFilter = 'all' | 'high' | 'medium' | 'low';

// --- SVG Math Helpers ---
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const SilverView: React.FC<SilverViewProps> = ({ stageId, onEquipClick }) => {
  const [stageData, setStageData] = useState<StageDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RiskFilter>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchStageDetail(stageId);
        setStageData(data);
        setActiveFilter('all');
      } catch (err) {
        setError("Failed to load stage data.");
      } finally {
        setLoading(false);
      }
    };
    if (stageId) loadData();
  }, [stageId]);

  if (loading) return <div className="flex justify-center items-center h-96 animate-pulse text-blue-500"><Activity className="w-8 h-8 animate-spin" /></div>;
  if (error || !stageData) return <div className="flex justify-center items-center h-96 text-rose-500 font-bold">{error || "No Data"}</div>;

  // --- Data Processing ---
  const riskDist = stageData.risk_distribution;
  const totalAssets = (riskDist.low || 0) + (riskDist.medium || 0) + (riskDist.high || 0);
  
  // Math for Gauge
  const radius = 120;
  const stroke = 24;
  // Gap between segments in degrees
  const gap = 3; 
  const totalDeg = 180;
  
  // Calculate active segments (to subtract gaps)
  const activeSegments = (riskDist.low > 0 ? 1 : 0) + (riskDist.medium > 0 ? 1 : 0) + (riskDist.high > 0 ? 1 : 0);
  const totalGap = (activeSegments - 1) * gap;
  const availableDeg = totalDeg - (totalGap > 0 ? totalGap : 0);
  
  const scale = totalAssets > 0 ? availableDeg / totalAssets : 0;
  
  const lowDeg = riskDist.low * scale;
  const medDeg = riskDist.medium * scale;
  const highDeg = riskDist.high * scale;

  // Arc Paths
  let currentAngle = 0;
  
  const renderArc = (value: number, degree: number, color: string, filter: RiskFilter) => {
    if (value <= 0) return null;
    const start = currentAngle;
    const end = currentAngle + degree;
    currentAngle = end + gap; // Advance angle for next segment

    const isActive = activeFilter === filter;
    const isDimmed = activeFilter !== 'all' && !isActive;

    return (
      <path 
        d={describeArc(150, 150, radius, start, end)} 
        fill="none" 
        stroke={color} 
        strokeWidth={isActive ? stroke + 8 : stroke}
        strokeLinecap="round"
        className={`cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100 hover:opacity-90'}`}
        onClick={() => setActiveFilter(prev => prev === filter ? 'all' : filter)}
        style={{ filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none' }}
      />
    );
  };

  // Filter Equipment List
  const filteredEquipment = stageData.equipment.filter(eq => {
     if (activeFilter === 'all') return true;
     // Fallback mapping if risk_category is missing or different
     const r = eq.risk_category?.toLowerCase() || '';
     const s = eq.status;
     if (activeFilter === 'high') return r === 'high' || s === 'red';
     if (activeFilter === 'medium') return r === 'medium' || s === 'yellow';
     if (activeFilter === 'low') return r === 'low' || s === 'green';
     return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. CONTROL PANEL CONTAINER */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-sm relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

         <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            
            {/* LEFT: Stats & Context */}
            <div className="flex-1 w-full space-y-8">
               <div>
                  <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Stage Health</h2>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-lg leading-relaxed">
                     Detailed breakdown of asset health distribution. Select a risk segment on the gauge to filter the equipment list.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="p-5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                     <div className="flex items-center gap-2 mb-2">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Assets</span>
                     </div>
                     <p className="text-3xl font-mono font-bold text-[var(--color-text-main)]">{totalAssets}</p>
                  </div>
                  <div className={`p-5 rounded-2xl border transition-colors duration-300 ${activeFilter === 'high' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[var(--color-bg)] border-[var(--color-border)]'}`}>
                     <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${riskDist.high > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Critical Risk</span>
                     </div>
                     <p className={`text-3xl font-mono font-bold ${riskDist.high > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {riskDist.high}
                     </p>
                  </div>
               </div>
            </div>

            {/* RIGHT: Modern Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0">
               {/* SVG Container */}
               <div className="relative w-[300px] h-[160px] flex justify-center">
                  <svg viewBox="0 0 300 160" className="w-full h-full overflow-visible">
                     {/* Track Background */}
                     <path d={describeArc(150, 150, radius, 0, 180)} fill="none" stroke="var(--color-surface-hover)" strokeWidth={stroke} strokeLinecap="round" />
                     
                     {/* Segments (Order: Low -> Med -> High) */}
                     {renderArc(riskDist.low, lowDeg, '#10b981', 'low')}
                     {renderArc(riskDist.medium, medDeg, '#f59e0b', 'medium')}
                     {renderArc(riskDist.high, highDeg, '#f43f5e', 'high')}
                  </svg>
                  
                  {/* Center Text Overlay */}
                  <div className="absolute bottom-0 text-center pb-2">
                     <div className="text-5xl font-black font-mono text-[var(--color-text-main)] tracking-tighter">
                        {activeFilter === 'all' ? totalAssets : 
                         activeFilter === 'low' ? riskDist.low : 
                         activeFilter === 'medium' ? riskDist.medium : riskDist.high}
                     </div>
                     <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                        activeFilter === 'high' ? 'text-rose-500' :
                        activeFilter === 'medium' ? 'text-amber-500' :
                        activeFilter === 'low' ? 'text-emerald-500' :
                        'text-[var(--color-text-muted)]'
                     }`}>
                        {activeFilter === 'all' ? 'All Assets' : `${activeFilter} Risk`}
                     </div>
                  </div>
               </div>
               
               {/* Reset Button (Flows naturally below gauge) */}
               <div className="h-10 mt-4 flex items-center justify-center">
                 {activeFilter !== 'all' && (
                    <button 
                       onClick={() => setActiveFilter('all')}
                       className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-main)] transition-all animate-fade-in hover:scale-105"
                    >
                       <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                       Reset View
                    </button>
                 )}
               </div>
            </div>

         </div>
      </div>

      {/* 2. EQUIPMENT GRID */}
      <div>
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Server className="w-5 h-5 text-[var(--color-text-muted)]" /> 
                Equipment List
            </h3>
            <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)]">
               Showing {filteredEquipment.length} of {totalAssets}
            </span>
         </div>
         
         {filteredEquipment.length === 0 ? (
            <div className="border-2 border-dashed border-[var(--color-border)] rounded-2xl h-64 flex flex-col items-center justify-center text-[var(--color-text-muted)] animate-fade-in">
               <Filter className="w-8 h-8 mb-2 opacity-50" />
               <p>No equipment found matching criteria.</p>
               <button onClick={() => setActiveFilter('all')} className="mt-4 text-xs font-bold text-blue-500 hover:underline">
                  Reset Filters
               </button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
               {filteredEquipment.map((eq) => {
                  const statusColors: any = {
                     green: { bar: "bg-emerald-500", text: "text-emerald-500", bg: "hover:border-emerald-500/50 hover:bg-emerald-500/5" },
                     yellow: { bar: "bg-amber-500", text: "text-amber-500", bg: "hover:border-amber-500/50 hover:bg-amber-500/5" },
                     red: { bar: "bg-rose-500", text: "text-rose-500", bg: "hover:border-rose-500/50 hover:bg-rose-500/5" }
                  };
                  const theme = statusColors[eq.status] || statusColors['green'];

                  return (
                     <div 
                        key={eq.equip_id}
                        onClick={() => onEquipClick(eq)}
                        className={`
                           group relative overflow-hidden cursor-pointer
                           bg-[var(--color-surface)] border border-[var(--color-border)] 
                           rounded-xl p-5 transition-all duration-300
                           ${theme.bg} hover:shadow-lg animate-fade-in
                        `}
                     >
                        {/* Status Accent Bar */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${theme.bar}`} />

                        <div className="flex justify-between items-start mb-6 pl-2">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-lg text-[var(--color-text-main)]">{eq.equip_id}</h4>
                                 {eq.status === 'green' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                 {eq.status === 'yellow' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                 {eq.status === 'red' && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{eq.type_display}</p>
                           </div>
                           
                           {/* Health Ring */}
                           <div className="relative flex items-center justify-center w-12 h-12">
                              <svg className="w-full h-full transform -rotate-90">
                                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--color-border)]" />
                                 <circle 
                                    cx="24" cy="24" r="20" 
                                    stroke="currentColor" strokeWidth="4" fill="transparent" 
                                    strokeDasharray={125.6} 
                                    strokeDashoffset={125.6 - (125.6 * eq.health_score) / 100}
                                    className={`${theme.text} transition-all duration-1000 ease-out`} 
                                 />
                              </svg>
                              <span className={`absolute text-[10px] font-bold ${theme.text}`}>{eq.health_score}</span>
                           </div>
                        </div>

                        <div className="pl-2 grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
                           <div>
                              <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold mb-0.5">Failure Prob.</p>
                              <p className={`text-xl font-mono font-bold ${theme.text}`}>
                                 {(eq.failure_probability * 100).toFixed(0)}%
                              </p>
                           </div>
                           <div className="text-right flex flex-col justify-end">
                              <span className="text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                                 Details <ArrowRight className="w-3 h-3" />
                              </span>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
    </div>
  );
};

export default SilverView;