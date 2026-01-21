// src/components/views/GoldView.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Activity, Zap, Factory, AlertTriangle, 
  Cpu, ArrowRight, TrendingUp, TrendingDown,
  AlertOctagon, Siren, Wrench, ChevronRight,
  Timer, DollarSign, BarChart3, Layers,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { type Stage } from '../../types';
import { fetchSystemHealth, fetchPlantOverview, fetchStages, fetchMaintenanceQueue, fetchAlerts } from '../../services/api';
import type { SystemHealth, PlantOverviewResponse, StageDetailAPI, MaintenanceTask, Alert } from '../../types/api';

// --- TYPES ---
interface GoldViewProps {
  onStageClick: (stage: Stage) => void;
  onNavigateToAlert?: (equipId: string) => void;
}

// --- MOCK DATA GENERATOR FOR SPARKLINE VISUALS ---
// (In a real app, you would fetch history from the API)
const generateSparkline = (currentValue: number, variance: number, points: number = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * variance))
  }));
};

const GoldView: React.FC<GoldViewProps> = ({ onStageClick, onNavigateToAlert }) => {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [plantData, setPlantData] = useState<PlantOverviewResponse | null>(null);
  const [stagesData, setStagesData] = useState<StageDetailAPI[]>([]);
  const [maintenanceQueue, setMaintenanceQueue] = useState<MaintenanceTask[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'maintenance'>('alerts');
  const [isLoading, setIsLoading] = useState(true);

  // Synthetic History Data for Charts
  const [kpiHistory, setKpiHistory] = useState<{ oee: any[], yield: any[] }>({ oee: [], yield: [] });

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, overview, stagesRes, maintenanceRes, alertsRes] = await Promise.all([
          fetchSystemHealth(),
          fetchPlantOverview(),
          fetchStages(),
          fetchMaintenanceQueue(),
          fetchAlerts(undefined, 'high', false)
        ]);
        
        setHealthData(health);
        setPlantData(overview);
        setStagesData(stagesRes.stages.sort((a, b) => a.order - b.order));
        setMaintenanceQueue(maintenanceRes.queue);
        setActiveAlerts(alertsRes.alerts);

        // Generate sparklines based on fetched data (Visual enhancement)
        setKpiHistory({
          oee: generateSparkline(overview.kpis.oee, 15),
          yield: generateSparkline(overview.kpis.yield_pct, 5)
        });

      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // --- INSIGHT LOGIC ---
  
  const metrics = useMemo(() => {
    if (!plantData) return null;
    const oee = plantData.kpis.oee;
    
    // Calculate Financial Impact (Mock Logic: Assume $50k/hr revenue capacity)
    const revenuePerHour = 50000; 
    const currentRevenue = revenuePerHour * (oee / 100);
    const opportunityCost = revenuePerHour - currentRevenue;

    return {
      oee,
      revenuePerHour,
      currentRevenue,
      opportunityCost,
      isOeeCritical: oee < 75,
      isOeeWarning: oee >= 75 && oee < 85
    };
  }, [plantData]);

  const bottleneck = useMemo(() => {
    return stagesData.find(s => s.status === 'red') || stagesData.find(s => s.status === 'yellow');
  }, [stagesData]);

  // --- STYLES ---
  const glassCard = "bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300";
  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r";

  if (isLoading) {
    return (
        <div className="h-[600px] flex flex-col items-center justify-center space-y-6 animate-pulse">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-blue-500/50" />
                </div>
            </div>
            <p className="text-[var(--color-text-muted)] font-medium tracking-wide">Synchronizing Plant Digital Twin...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      
      {/* --- TOP BAR: CONTEXT --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
         <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Executive Dashboard</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Real-time production telemetry & financial impact</p>
         </div>
         <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${healthData?.status === 'OK' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                <Activity className="w-3 h-3" />
                System {healthData?.status || 'Online'}
            </div>
            <div className="text-right">
                <div className="text-xs font-bold text-[var(--color-text-main)]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Shift A • 06:00 - 14:00</div>
            </div>
         </div>
      </div>

      {/* --- SECTION 1: KPI & FINANCIALS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BIG KPI CARD: OEE (Span 4) */}
        <div className={`${glassCard} lg:col-span-4 p-6 relative overflow-hidden group`}>
            {/* Background Chart */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity translate-y-8">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpiHistory.oee}>
                        <defs>
                            <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOee)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                        <Zap className="w-6 h-6" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" /> +1.2%
                    </span>
                </div>
                <div className="mt-4">
                    <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Overall Efficiency</span>
                    <div className="text-5xl font-black text-[var(--color-text-main)] tracking-tight mt-1">
                        {metrics?.oee}<span className="text-2xl text-[var(--color-text-muted)] font-medium ml-1">%</span>
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics?.oee}%` }} />
                    </div>
                    <span>Target: 85%</span>
                </div>
            </div>
        </div>

        {/* FINANCIAL IMPACT CARD (Span 4) */}
        <div className={`${glassCard} lg:col-span-4 p-6 flex flex-col justify-between`}>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase">Financial Velocity</h3>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--color-text-muted)]">Projected Revenue/Hr</span>
                        <span className="font-bold text-[var(--color-text-main)]">${(metrics?.currentRevenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics?.oee}%` }} />
                    </div>
                </div>

                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-500 uppercase">Opportunity Cost</span>
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-text-main)] mt-1">
                        -${(metrics?.opportunityCost ?? 0).toLocaleString()}
                        <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">/hr</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Loss due to {100 - (metrics?.oee || 100)}% downtime/inefficiency</p>
                </div>
             </div>
        </div>

        {/* AI INSIGHT / BOTTLENECK (Span 4) */}
        <div className={`${glassCard} lg:col-span-4 p-6 flex flex-col relative overflow-hidden`}>
            {/* Ambient Background */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${metrics?.isOeeCritical ? 'bg-rose-500' : 'bg-blue-500'}`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-5 h-5 text-[var(--color-text-main)]" />
                    <h3 className="text-sm font-bold text-[var(--color-text-main)]">AI Production Insight</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-lg font-medium text-[var(--color-text-main)] leading-relaxed">
                        {metrics?.isOeeCritical 
                            ? `Critical production loss detected in ${bottleneck?.name || 'the line'}. Immediate maintenance intervention required to restore profitability.`
                            : bottleneck 
                                ? `Throughput constrained by ${bottleneck.name}. Optimize cycle times here to gain estimated +$2,500/hr revenue.`
                                : "Production flow is optimal. No significant bottlenecks detected."
                        }
                    </p>
                </div>

                {bottleneck && (
                    <button 
                        onClick={() => onStageClick(bottleneck as unknown as Stage)}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--color-text-main)] text-[var(--color-bg)] font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                        Investigate {bottleneck.name} <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* --- SECTION 2: INTERACTIVE PRODUCTION PIPELINE --- */}
      <div>
         <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" /> 
                Production Flow
            </h3>
            <div className="flex gap-2">
                {['green', 'yellow', 'red'].map(status => (
                    <span key={status} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded border border-[var(--color-border)]">
                        <span className={`w-2 h-2 rounded-full ${status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        {status === 'green' ? 'Stable' : status === 'yellow' ? 'Warning' : 'Critical'}
                    </span>
                ))}
            </div>
         </div>

         {/* Scrollable Container for Mobile, Grid for Desktop */}
         <div className="relative group">
            <div className="hidden xl:block absolute top-1/2 left-4 right-4 h-0.5 bg-[var(--color-border)] -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {stagesData.map((stage, idx) => {
                    const isLast = idx === stagesData.length - 1;
                    const statusColors = {
                        green: 'border-emerald-500/20 hover:border-emerald-500/50 bg-[var(--color-surface)]',
                        yellow: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5',
                        red: 'border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    };
                    const indicatorColors = {
                        green: 'text-emerald-500 bg-emerald-500/10',
                        yellow: 'text-amber-500 bg-amber-500/10',
                        red: 'text-rose-500 bg-rose-500/10'
                    };

                    return (
                        <div key={stage.stage_id} className="relative">
                            <button
                                onClick={() => onStageClick(stage as unknown as Stage)}
                                className={`
                                    w-full h-44 text-left p-5 rounded-3xl border transition-all duration-300
                                    flex flex-col justify-between group/card
                                    ${statusColors[stage.status]}
                                `}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] opacity-50 uppercase tracking-widest">Step 0{idx+1}</span>
                                        <div className={`p-1.5 rounded-full ${indicatorColors[stage.status]}`}>
                                            {stage.status === 'red' ? <AlertOctagon className="w-4 h-4" /> : 
                                             stage.status === 'yellow' ? <AlertTriangle className="w-4 h-4" /> : 
                                             <Activity className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-[var(--color-text-main)] text-sm leading-tight pr-4">{stage.name}</h4>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-2xl font-mono font-bold text-[var(--color-text-main)]">{stage.equipment_count}</div>
                                        <div className="text-[10px] font-medium text-[var(--color-text-muted)] leading-tight">Active<br/>Units</div>
                                    </div>
                                    
                                    {stage.high_risk_count > 0 && (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase">
                                            <AlertTriangle className="w-3 h-3" /> {stage.high_risk_count} Risks
                                        </div>
                                    )}
                                </div>
                                
                                {/* Hover Action */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity translate-x-2 group-hover/card:translate-x-0">
                                    <div className="p-2 rounded-full bg-[var(--color-text-main)] text-[var(--color-bg)]">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>

                            {/* Connector Arrow (Desktop) */}
                            {!isLast && (
                                <div className="hidden xl:flex absolute top-1/2 -right-3 z-10 w-6 h-6 items-center justify-center -translate-y-1/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)]">
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
         </div>
      </div>

      {/* --- SECTION 3: COMMAND CENTER (TABS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
         
         {/* LEFT: ACTION CONSOLE (2/3) */}
         <div className={`${glassCard} lg:col-span-2 flex flex-col`}>
             {/* Tab Header */}
             <div className="flex items-center border-b border-[var(--color-border)]">
                <button 
                    onClick={() => setActiveTab('alerts')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors relative ${activeTab === 'alerts' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}
                >
                    <Siren className={`w-4 h-4 ${activeAlerts.length > 0 ? 'text-rose-500 animate-pulse' : ''}`} />
                    Active Alerts ({activeAlerts.length})
                    {activeTab === 'alerts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
                </button>
                <div className="w-px h-6 bg-[var(--color-border)]" />
                <button 
                    onClick={() => setActiveTab('maintenance')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors relative ${activeTab === 'maintenance' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}
                >
                    <Wrench className="w-4 h-4" />
                    Maintenance Queue ({maintenanceQueue.length})
                    {activeTab === 'maintenance' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
                </button>
             </div>

             {/* Tab Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {activeTab === 'alerts' ? (
                    // ALERTS LIST
                    <div className="space-y-2 p-2">
                        {activeAlerts.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50">
                                <CheckCircle2 className="w-10 h-10 mb-2" />
                                <p>All Systems Nominal</p>
                            </div>
                        ) : (
                            activeAlerts.map(alert => (
                                <div key={alert.alert_id} 
                                    onClick={() => onNavigateToAlert && onNavigateToAlert(alert.equipment)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-rose-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-500/20">
                                        {(alert.failure_probability * 100).toFixed(0)}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-bold text-[var(--color-text-main)]">{alert.equipment}</h4>
                                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{alert.message}</p>
                                    </div>
                                    <button className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-main)] text-xs font-bold border border-[var(--color-border)] group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                                        Act
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // MAINTENANCE LIST
                    <div className="space-y-2 p-2">
                        {maintenanceQueue.map((task, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-muted)] flex flex-col items-center justify-center shrink-0 border border-[var(--color-border)]">
                                    <span className="text-[9px] uppercase font-bold">Pri</span>
                                    <span className={`text-lg font-black leading-none ${task.priority <= 2 ? 'text-rose-500' : ''}`}>{task.priority}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-bold text-[var(--color-text-main)]">{task.equipment_name}</h4>
                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase">{task.urgency}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                                        <Timer className="w-3 h-3" /> Est. {task.estimated_downtime_mins}m downtime
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
         </div>

         {/* RIGHT: MINI STATS (1/3) */}
         <div className="space-y-4">
             {/* Metric 1: Yield */}
             <div className={`${glassCard} p-5`}>
                 <div className="flex justify-between items-end mb-4">
                     <div>
                         <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase mb-1">Total Yield</div>
                         <div className="text-3xl font-black text-[var(--color-text-main)]">{plantData?.kpis.yield_pct}%</div>
                     </div>
                     <BarChart width={80} height={40} data={kpiHistory.yield.slice(-5)}>
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                            {kpiHistory.yield.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={0.3 + (index * 0.15)} />
                            ))}
                        </Bar>
                     </BarChart>
                 </div>
                 <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" /> Quality control passing
                 </div>
             </div>

             {/* Metric 2: Production Rate */}
             <div className={`${glassCard} p-5`}>
                 <div className="flex justify-between items-start mb-4">
                     <div>
                         <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase mb-1">Production Rate</div>
                         <div className="text-3xl font-black text-[var(--color-text-main)]">{plantData?.kpis.production_rate_tons_hr}</div>
                         <span className="text-xs text-[var(--color-text-muted)]">Tons / Hour</span>
                     </div>
                     <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                         <Factory className="w-5 h-5" />
                     </div>
                 </div>
             </div>
         </div>

      </div>

    </div>
  );
};

export default GoldView;