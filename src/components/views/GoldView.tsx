// src/components/views/GoldView.tsx
import React, { useEffect, useState } from 'react';
import { 
  Activity, Zap, CheckCircle2, Factory, AlertTriangle, 
  Cpu, Server, Wifi, ClipboardList, 
  Layers, ArrowRight, Timer, AlertOctagon, TrendingUp, TrendingDown,
  Flame, Droplet, Gauge, BarChart3, Clock, Calendar, Users, Target,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Sparkles, ShieldAlert
} from 'lucide-react';
import { type Stage } from '../../types';
import { fetchSystemHealth, fetchPlantOverview, fetchStages, fetchMaintenanceQueue } from '../../services/api';
import type { SystemHealth, PlantOverviewResponse, StageDetailAPI, MaintenanceTask } from '../../types/api';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
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

  // Generate mock production trend data
  const productionTrend = Array.from({ length: 24 }, (_, i) => ({
    hour: i < 10 ? `0${i}:00` : `${i}:00`,
    production: 220 + Math.random() * 50,
    target: 245,
    efficiency: 85 + Math.random() * 12
  }));

  // Stage health distribution for pie chart
  const stageHealthData = [
    { name: 'Healthy', value: stagesData.filter(s => s.status === 'green').length, color: '#10b981' },
    { name: 'Warning', value: stagesData.filter(s => s.status === 'yellow').length, color: '#f59e0b' },
    { name: 'Critical', value: stagesData.filter(s => s.status === 'red').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Recent alerts summary
  const criticalAlerts = plantData?.critical_alerts.slice(0, 6) || [];
  const alertsBySeverity = {
    high: criticalAlerts.filter(a => a.severity === 'high').length,
    medium: criticalAlerts.filter(a => a.severity === 'medium').length,
    low: criticalAlerts.filter(a => a.severity === 'low').length
  };

  // Performance metrics over time
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

  // Calculate trends (mock - in real app would come from API)
  const getTrend = (current: number, target: number) => {
    const diff = ((current - target) / target) * 100;
    return { value: Math.abs(diff).toFixed(1), direction: diff >= 0 ? 'up' : 'down' };
  };

  const oeeTrend = getTrend(kpis.oee, 85);
  const yieldTrend = getTrend(kpis.yield_pct, 97);
  const productionTrend2 = getTrend(kpis.production_rate_tons_hr, 240);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-[var(--color-text-muted)] text-xs mb-2 font-medium">{label}</p>
          {payload.map((p: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[var(--color-text-main)] text-sm font-medium capitalize">{p.name}</span>
              <span className="text-[var(--color-text-main)] font-mono font-bold ml-auto">{Number(p.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* HERO SECTION - Plant Status Overview */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left: Status & Key Metrics */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center">
                    <Factory className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {plantData?.plant_name || 'Steel Production Plant'}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-bold">Live</span>
                    </div>
                    <span className="text-white/70 text-sm font-medium">
                      {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Mini KPI Cards */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs text-white/70 font-bold uppercase">OEE</span>
                  </div>
                  <div className="text-3xl font-black text-white">{kpis.oee}%</div>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${
                    oeeTrend.direction === 'up' ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {oeeTrend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {oeeTrend.value}%
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs text-white/70 font-bold uppercase">Yield</span>
                  </div>
                  <div className="text-3xl font-black text-white">{kpis.yield_pct}%</div>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${
                    yieldTrend.direction === 'up' ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {yieldTrend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {yieldTrend.value}%
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-xs text-white/70 font-bold uppercase">Output</span>
                  </div>
                  <div className="text-3xl font-black text-white">{kpis.production_rate_tons_hr}</div>
                  <div className="text-xs text-white/70 font-bold mt-1">t/hr</div>
                </div>
              </div>
            </div>

            {/* Right: Alert Summary Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-xl">
                    <AlertOctagon className="w-6 h-6 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Alert Status</h3>
                    <p className="text-sm text-white/70">Requires immediate attention</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">{kpis.active_alerts}</div>
                  <div className="text-xs text-white/70 font-bold uppercase">Active</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-xl border border-rose-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-white font-bold">Critical</span>
                  </div>
                  <span className="text-2xl font-black text-rose-300">{alertsBySeverity.high}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-white font-bold">Warning</span>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{alertsBySeverity.medium}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-white font-bold">Info</span>
                  </div>
                  <span className="text-2xl font-black text-blue-300">{alertsBySeverity.low}</span>
                </div>
              </div>

              {kpis.active_alerts > 0 && (
                <button 
                  onClick={() => onNavigateToAlert && onNavigateToAlert('')}
                  className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <ShieldAlert className="w-4 h-4" />
                  View All Alerts
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* PRODUCTION METRICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production Trend Chart */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                24-Hour Production Trend
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Tons per hour vs target</p>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface-hover)] px-3 py-2 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-xs font-bold text-[var(--color-text-muted)]">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500/30 rounded" />
                <span className="text-xs font-bold text-[var(--color-text-muted)]">Target</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={productionTrend}>
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="var(--color-text-muted)" 
                fontSize={11} 
                tickLine={false}
                interval={2}
              />
              <YAxis 
                stroke="var(--color-text-muted)" 
                fontSize={11} 
                tickLine={false}
                domain={[200, 280]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#10b981" 
                fill="none"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="production" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#productionGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Health Distribution */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">Stage Health</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Distribution across pipeline</p>

          <div className="flex items-center justify-center mb-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stageHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {stageHealthData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-[var(--color-text-main)]">{item.name}</span>
                </div>
                <span className="text-xl font-black font-mono text-[var(--color-text-main)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PRODUCTION PIPELINE - Enhanced */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-lg">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-500" />
              Production Pipeline
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              End-to-end process monitoring • {stagesData.length} Stages • {stagesData.reduce((sum, s) => sum + s.equipment_count, 0)} Assets
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs font-bold text-[var(--color-text-muted)] uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Healthy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Critical
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {stagesData.map((stage, index) => {
            const statusConfig = {
              green: { 
                bg: 'bg-emerald-500/5 hover:bg-emerald-500/10', 
                border: 'border-emerald-500/20 hover:border-emerald-500/40', 
                text: 'text-emerald-500', 
                indicator: 'bg-emerald-500',
                glow: 'shadow-emerald-500/20'
              },
              yellow: { 
                bg: 'bg-amber-500/5 hover:bg-amber-500/10', 
                border: 'border-amber-500/20 hover:border-amber-500/40', 
                text: 'text-amber-500', 
                indicator: 'bg-amber-500',
                glow: 'shadow-amber-500/20'
              },
              red: { 
                bg: 'bg-rose-500/5 hover:bg-rose-500/10', 
                border: 'border-rose-500/20 hover:border-rose-500/40', 
                text: 'text-rose-500', 
                indicator: 'bg-rose-500 animate-pulse',
                glow: 'shadow-rose-500/20'
              },
            }[stage.status] || { bg: '', border: '', text: '', indicator: '', glow: '' };

            return (
              <div 
                key={stage.stage_id}
                onClick={() => onStageClick(stage as unknown as Stage)}
                className={`
                  group relative flex flex-col justify-between cursor-pointer transition-all duration-300
                  h-48 rounded-2xl border ${statusConfig.bg} ${statusConfig.border}
                  hover:shadow-lg ${statusConfig.glow} hover:scale-105
                `}
              >
                {/* Connector Arrow */}
                {index < stagesData.length - 1 && (
                  <div className="hidden xl:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-[var(--color-border)]" />
                  </div>
                )}

                <div className="p-5 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-auto">
                    <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider opacity-50">
                      Stage {index + 1}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.indicator}`} />
                  </div>

                  {/* Stage Name */}
                  <div className="mb-4">
                    <h4 className="font-bold text-[var(--color-text-main)] text-sm leading-tight mb-1">
                      {stage.name}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase ${statusConfig.text}`}>
                      {stage.status === 'green' ? 'Optimal' : stage.status === 'yellow' ? 'Caution' : 'Alert'}
                    </span>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)]/50 pt-3">
                    <div>
                      <span className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold block">Assets</span>
                      <span className="text-lg font-mono font-bold text-[var(--color-text-main)]">
                        {stage.equipment_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold block">Risk</span>
                      <span className={`text-lg font-mono font-bold ${stage.high_risk_count > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {stage.high_risk_count}
                      </span>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 p-1.5 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ROW - Maintenance & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Maintenance Queue */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text-main)]">Priority Action Queue</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Scheduled maintenance & interventions</p>
                </div>
              </div>
              {maintenanceQueue.length > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {maintenanceQueue.length} Tasks
                </span>
              )}
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
            {maintenanceQueue.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500 opacity-50" />
                <p className="text-lg font-bold">All Clear!</p>
                <p className="text-sm">No pending maintenance tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceQueue.slice(0, 5).map((task, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30 hover:shadow-md transition-all group"
                  >
                    <div className={`
                      w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border
                      ${task.priority <= 3 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'}
                    `}>
                      <span className="text-[10px] font-bold uppercase opacity-70">P{task.priority}</span>
                      <div className="text-2xl font-black leading-none">{task.priority}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-[var(--color-text-main)] truncate">{task.equipment_name}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ml-2 ${
                          task.urgency === 'immediate' || task.urgency === 'next_shift' 
                          ? 'bg-rose-500/10 text-rose-500' 
                          : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors mb-2 line-clamp-1">
                        {task.action}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {task.stage_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estimated_downtime_mins}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Performance Metrics */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">Weekly Performance</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Last 7 days overview</p>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} domain={[75, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="uptime" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-blue-500/5">
              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1" />
              <div className="text-xs font-bold text-[var(--color-text-muted)]">OEE</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mb-1" />
              <div className="text-xs font-bold text-[var(--color-text-muted)]">Yield</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-500/5">
              <div className="w-2 h-2 bg-amber-500 rounded-full mx-auto mb-1" />
              <div className="text-xs font-bold text-[var(--color-text-muted)]">Uptime</div>
            </div>
          </div>
        </div>

      </div>

      {/* CRITICAL ALERTS SECTION */}
      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-br from-rose-500/5 to-orange-500/5 border-2 border-rose-500/20 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-3 bg-rose-500/10 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)]">Critical Alerts</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Immediate attention required</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToAlert && onNavigateToAlert('')}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalAlerts.map((alert) => (
              <div 
                key={alert.alert_id}
                onClick={() => onNavigateToAlert && onNavigateToAlert(alert.equipment)}
                className="group bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-rose-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-rose-500 animate-pulse' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">{alert.severity}</span>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <h4 className="font-bold text-[var(--color-text-main)] mb-1">{alert.equipment}</h4>
                <p className="text-xs text-[var(--color-text-muted)] uppercase mb-2">{alert.equipment_type}</p>
                <p className="text-sm text-[var(--color-text-main)] mb-3 line-clamp-2">{alert.message}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                  <span className="text-xs font-bold text-[var(--color-text-muted)]">Failure Risk</span>
                  <span className="text-lg font-black text-rose-500">{(alert.failure_probability * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM HEALTH FOOTER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Cpu className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-lg font-bold text-[var(--color-text-main)]">{healthData?.status || 'Online'}</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Equipment</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--color-text-main)]">{healthData?.equipment_count || 0}</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Wifi className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Sensors</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--color-text-main)]">{healthData?.sensor_count || 0}</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Heats Today</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--color-text-main)]">{kpis.heats_today}</span>
        </div>
      </div>

    </div>
  );
};

export default GoldView;