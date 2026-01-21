// src/components/views/GoldView.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Activity, Zap, CheckCircle2, Factory, AlertTriangle, 
  Cpu, Server, Wifi, ClipboardList, 
  Layers, ArrowRight, TrendingUp, TrendingDown,
  Flame, AlertOctagon, BarChart3, Clock, ShieldAlert,
  Siren, ChevronRight, Timer
} from 'lucide-react';
import { type Stage } from '../../types';
import { fetchSystemHealth, fetchPlantOverview, fetchStages, fetchMaintenanceQueue } from '../../services/api';
import type { SystemHealth, PlantOverviewResponse, StageDetailAPI, MaintenanceTask } from '../../types/api';
import { 
  AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

interface GoldViewProps {
  onStageClick: (stage: Stage) => void;
  onNavigateToAlert?: (equipId: string) => void;
}

const GoldView: React.FC<GoldViewProps> = ({ onStageClick, onNavigateToAlert }) => {
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

  // --- Derived Metrics for "What's Wrong" Story ---
  
  const criticalAlerts = plantData?.critical_alerts.slice(0, 6) || [];
  const activeAlertCount = plantData?.kpis.active_alerts || 0;
  
  // Calculate a "Plant Health Score" (Mock logic based on alerts)
  const healthScore = useMemo(() => {
    const base = 100;
    const alertPenalty = activeAlertCount * 5;
    const stagePenalty = stagesData.filter(s => s.status === 'red').length * 10;
    return Math.max(0, base - alertPenalty - stagePenalty);
  }, [activeAlertCount, stagesData]);

  const healthStatus = healthScore > 85 ? 'Healthy' : healthScore > 60 ? 'Warning' : 'Critical';
  const healthColor = healthScore > 85 ? 'text-emerald-500' : healthScore > 60 ? 'text-amber-500' : 'text-rose-500';
  const healthBg = healthScore > 85 ? 'bg-emerald-500' : healthScore > 60 ? 'bg-amber-500' : 'bg-rose-500';

  // Issues Filtering
  const problemStages = stagesData.filter(s => s.status !== 'green');
  const criticalMaintenance = maintenanceQueue.filter(t => t.urgency === 'immediate' || t.priority === 1);

  // Mock Trend Data
  const productionTrend = Array.from({ length: 24 }, (_, i) => ({
    hour: i < 10 ? `0${i}:00` : `${i}:00`,
    production: 220 + Math.random() * 50,
    target: 245,
    efficiency: 85 + Math.random() * 12
  }));

  const stageHealthData = [
    { name: 'Healthy', value: stagesData.filter(s => s.status === 'green').length, color: '#10b981' },
    { name: 'Warning', value: stagesData.filter(s => s.status === 'yellow').length, color: '#f59e0b' },
    { name: 'Critical', value: stagesData.filter(s => s.status === 'red').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    oee: 82 + Math.random() * 10,
    yield: 96 + Math.random() * 3,
    uptime: 94 + Math.random() * 4
  }));

  const kpis = plantData?.kpis || {
    oee: 0, yield_pct: 0, uptime_pct: 0, production_rate_tons_hr: 0,
    active_alerts: 0, high_risk_equipment: 0, heats_today: 0
  };

  const getTrend = (current: number, target: number) => {
    const diff = ((current - target) / target) * 100;
    return { value: Math.abs(diff).toFixed(1), direction: diff >= 0 ? 'up' : 'down' };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[var(--color-text-muted)] text-xs mb-2 font-bold uppercase tracking-wider">{label}</p>
          {payload.map((p: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1.5 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[var(--color-text-main)] text-sm font-medium">{p.name}</span>
              <span className="text-[var(--color-text-main)] font-mono font-bold ml-auto">{Number(p.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-[1920px] mx-auto">
      
      {/* 1. HERO: SYSTEM VITALS & IMMEDIATE ATTENTION 
          The goal: Answer "How are we doing?" and "What's wrong?" immediately.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT: Plant Health Score */}
        <div className="xl:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-64 h-64 ${healthBg} opacity-5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-700`} />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${healthScore > 85 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                   <Activity className={`w-5 h-5 ${healthColor}`} />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text-main)]">Plant Vitals</h2>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm">Overall system efficiency & risk calculation</p>
            </div>

            <div className="my-8 flex items-end gap-4">
              <div className="relative">
                <span className={`text-7xl font-black tracking-tighter ${healthColor}`}>
                  {healthScore.toFixed(0)}
                </span>
                <span className={`text-2xl font-bold ${healthColor} absolute top-2 -right-6`}>%</span>
              </div>
              <div className={`pb-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border
                ${healthScore > 85 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : healthScore > 60
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }
              `}>
                {healthStatus}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-surface-hover)] rounded-2xl p-4 border border-[var(--color-border)]">
                <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase mb-1">Active Alerts</div>
                <div className={`text-2xl font-black ${activeAlertCount > 0 ? 'text-rose-500' : 'text-[var(--color-text-main)]'}`}>
                  {activeAlertCount}
                </div>
              </div>
              <div className="bg-[var(--color-surface-hover)] rounded-2xl p-4 border border-[var(--color-border)]">
                <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase mb-1">Problem Stages</div>
                <div className={`text-2xl font-black ${problemStages.length > 0 ? 'text-amber-500' : 'text-[var(--color-text-main)]'}`}>
                  {problemStages.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: The "What's Wrong" Dashboard (Action Center) */}
        <div className="xl:col-span-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Siren className={`w-5 h-5 ${criticalAlerts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-[var(--color-text-muted)]'}`} />
                Attention Required
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">Prioritized issues requiring intervention</p>
            </div>
            {criticalAlerts.length > 0 && (
              <button 
                onClick={() => onNavigateToAlert && onNavigateToAlert('')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
              >
                Resolve All <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[240px] overflow-y-auto custom-scrollbar pr-2">
            {/* ALERT CARDS */}
            {criticalAlerts.length === 0 && criticalMaintenance.length === 0 ? (
               <div className="col-span-full h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50 border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                 <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
                 <p className="font-bold">Systems Nominal</p>
               </div>
            ) : (
              <>
                {criticalAlerts.map(alert => (
                  <div key={alert.alert_id} 
                    onClick={() => onNavigateToAlert && onNavigateToAlert(alert.equipment)}
                    className="group bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 rounded-2xl p-4 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-rose-500 uppercase">Critical Alert</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <h3 className="font-bold text-[var(--color-text-main)] text-sm mb-1">{alert.equipment}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{alert.message}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${alert.failure_probability * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-rose-500">{(alert.failure_probability * 100).toFixed(0)}% Risk</span>
                    </div>
                  </div>
                ))}

                {criticalMaintenance.map((task, idx) => (
                  <div key={`maint-${idx}`} className="group bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-amber-500 uppercase">Maint. Due</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">P{task.priority}</span>
                    </div>
                    <h3 className="font-bold text-[var(--color-text-main)] text-sm mb-1">{task.equipment_name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{task.action}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-muted)]">
                       <Clock className="w-3 h-3" />
                       Est. {task.estimated_downtime_mins} mins
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. PIPELINE VISUALIZATION
          Redesigned to look like a connected process. 
          Problematic stages are highlighted.
      */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Production Flow
            </h3>
          </div>
          <div className="flex gap-4">
             {['Healthy', 'Warning', 'Critical'].map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Healthy' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">{status}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="relative">
          {/* Connector Line Background */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-[var(--color-border)] -translate-y-1/2 hidden xl:block rounded-full" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-0 relative">
            {stagesData.map((stage, index) => {
               const isProblem = stage.status !== 'green';
               const statusColor = stage.status === 'green' ? 'emerald' : stage.status === 'yellow' ? 'amber' : 'rose';
               
               return (
                 <div key={stage.stage_id} className="xl:px-2 relative group" onClick={() => onStageClick(stage as unknown as Stage)}>
                    {/* The Card */}
                    <div className={`
                      relative z-10 p-5 rounded-2xl border transition-all duration-300 cursor-pointer h-full
                      flex flex-col justify-between
                      ${isProblem 
                        ? `bg-${statusColor}-500/10 border-${statusColor}-500/50 shadow-[0_0_20px_rgba(0,0,0,0.1)] scale-105` 
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-blue-500/30 hover:shadow-lg'
                      }
                    `}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isProblem ? `text-${statusColor}-500` : 'text-[var(--color-text-muted)]'}`}>
                          0{index + 1}
                        </span>
                        <div className={`w-2 h-2 rounded-full bg-${statusColor}-500 ${isProblem ? 'animate-pulse' : ''}`} />
                      </div>
                      
                      <div className="mb-2">
                         <h4 className={`font-bold text-sm leading-tight ${isProblem ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]'}`}>
                           {stage.name}
                         </h4>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-[var(--color-border)]/50">
                         <div className="flex flex-col">
                           <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">Assets</span>
                           <span className="font-mono text-xs font-bold text-[var(--color-text-main)]">{stage.equipment_count}</span>
                         </div>
                         {stage.high_risk_count > 0 && (
                           <div className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1">
                             <AlertTriangle className="w-3 h-3" /> {stage.high_risk_count}
                           </div>
                         )}
                      </div>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* 3. METRICS & TRENDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI CARDS (Vertical Stack) */}
        <div className="space-y-6">
          {/* OEE Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-md relative overflow-hidden group hover:border-blue-500/30 transition-all">
             <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                 <Zap className="w-6 h-6" />
               </div>
               <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${getTrend(kpis.oee, 85).direction === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                 {getTrend(kpis.oee, 85).direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                 {getTrend(kpis.oee, 85).value}%
               </div>
             </div>
             <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">Overall Efficiency</div>
             <div className="text-4xl font-black text-[var(--color-text-main)] mt-1">{kpis.oee}<span className="text-lg text-[var(--color-text-muted)] font-medium ml-1">%</span></div>
          </div>

          {/* Yield Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-md relative overflow-hidden group hover:border-emerald-500/30 transition-all">
             <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                 <Factory className="w-6 h-6" />
               </div>
               <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${getTrend(kpis.yield_pct, 97).direction === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                 {getTrend(kpis.yield_pct, 97).direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                 {getTrend(kpis.yield_pct, 97).value}%
               </div>
             </div>
             <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">Quality Yield</div>
             <div className="text-4xl font-black text-[var(--color-text-main)] mt-1">{kpis.yield_pct}<span className="text-lg text-[var(--color-text-muted)] font-medium ml-1">%</span></div>
          </div>

          {/* Output Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
             <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                 <Flame className="w-6 h-6" />
               </div>
               <div className="text-xs font-bold text-[var(--color-text-muted)] px-2 py-1 bg-[var(--color-surface-hover)] rounded-lg">
                 Target: 240
               </div>
             </div>
             <div className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">Production Rate</div>
             <div className="text-4xl font-black text-[var(--color-text-main)] mt-1">{kpis.production_rate_tons_hr}<span className="text-lg text-[var(--color-text-muted)] font-medium ml-1">t/hr</span></div>
          </div>
        </div>

        {/* PRODUCTION CHART */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg h-[260px]">
            <div className="flex justify-between items-center mb-4">
               <div>
                  <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Hourly Output
                  </h3>
               </div>
               <div className="flex gap-4 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500" /> Actual</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500/50" /> Target</span>
               </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={productionTrend}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} interval={3} />
                <YAxis hide domain={[200, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="production" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
                <Area type="monotone" dataKey="target" stroke="#10b981" fill="none" strokeDasharray="3 3" strokeOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WEEKLY TREND */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg h-[200px]">
              <h3 className="font-bold text-[var(--color-text-main)] text-sm mb-2">7-Day Performance</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={performanceData}>
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="oee" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="yield" stroke="#10b981" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="uptime" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* STAGE HEALTH PIE */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg h-[200px] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-main)] text-sm mb-4">Stage Distribution</h3>
                <div className="space-y-2">
                  {stageHealthData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)]">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span>{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stageHealthData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                      {stageHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GoldView;