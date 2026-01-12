import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadialBarChart, RadialBar, Legend, ReferenceLine
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, Settings, 
  Zap, Clock, Filter, 
  LayoutDashboard, Server, Menu, X,
  Factory, AlertCircle, RefreshCw, ChevronLeft, Play, Pause,
  Sun, Moon, Thermometer, Droplet, Wrench, AlertTriangle, Gauge,
  ArrowRight, CheckCircle2, AlertOctagon, Microscope, List
} from 'lucide-react';

// --- Theme Hook (Preserved from Production) ---
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
};

// --- New Mock Data (From your JSX) ---
const mockPlantData = {
  kpis: { oee: 87.5, yield_pct: 98.2, uptime_pct: 96.1, production_rate_tons_hr: 245, active_alerts: 3, high_risk_equipment: 2, heats_today: 42 },
  stages: [
    { stage_id: "raw_materials", name: "Raw Materials", order: 1, status: "green", equipment_count: 5, high_risk_count: 0 },
    { stage_id: "melt_shop", name: "Melt Shop", order: 2, status: "green", equipment_count: 4, high_risk_count: 0 },
    { stage_id: "secondary_metallurgy", name: "Secondary Metallurgy", order: 3, status: "yellow", equipment_count: 6, high_risk_count: 1 },
    { stage_id: "continuous_casting", name: "Continuous Casting", order: 4, status: "red", equipment_count: 20, high_risk_count: 3 },
    { stage_id: "hot_rolling", name: "Hot Rolling", order: 5, status: "green", equipment_count: 15, high_risk_count: 0 },
    { stage_id: "finishing", name: "Finishing", order: 6, status: "green", equipment_count: 6, high_risk_count: 0 },
  ],
  alerts: [
    { alert_id: "A001", equipment: "TUNDISH-002", message: "High clogging risk", severity: "high", failure_probability: 0.78 },
    { alert_id: "A002", equipment: "SEN-001", message: "Erosion detected", severity: "high", failure_probability: 0.75 },
    { alert_id: "A003", equipment: "LADLE-003", message: "Refractory wear", severity: "medium", failure_probability: 0.52 },
  ]
};

const mockStageData = {
  stage_id: "continuous_casting",
  name: "Continuous Casting",
  status: "red",
  risk_distribution: { low: 7, medium: 6, high: 3 },
  equipment: [
    { equip_id: "TUNDISH-002", type_display: "Tundish", status: "red", health_score: 45, failure_probability: 0.78,wb_risk_category: "high" },
    { equip_id: "SEN-001", type_display: "SEN", status: "red", health_score: 48, failure_probability: 0.75, risk_category: "high" },
    { equip_id: "SEN-004", type_display: "SEN", status: "red", health_score: 52, failure_probability: 0.72, risk_category: "high" },
    { equip_id: "TUNDISH-001", type_display: "Tundish", status: "yellow", health_score: 62, failure_probability: 0.45, risk_category: "medium" },
    { equip_id: "MOLD-002", type_display: "Mold", status: "yellow", health_score: 68, failure_probability: 0.42, risk_category: "medium" },
    { equip_id: "GATE-003", type_display: "Slide Gate", status: "green", health_score: 88, failure_probability: 0.18, risk_category: "low" },
    { equip_id: "STOPPER-01", type_display: "Stopper Rod", status: "green", health_score: 92, failure_probability: 0.15, risk_category: "low" },
    { equip_id: "MOLD-001", type_display: "Mold", status: "green", health_score: 94, failure_probability: 0.12, risk_category: "low" },
  ]
};

const mockEquipmentData = {
  equip_id: "TUNDISH-002",
  type_display: "Tundish",
  stage_name: "Continuous Casting",
  status: "red",
  identity: { manufacturer: "Vesuvius", model: "VES-TUN-3000", install_date: "2023-06-15", last_maintenance: "2025-01-05" },
  health: { health_score: 45, failure_probability: 0.78, risk_category: "high", predicted_remaining_heats: 12, predicted_remaining_hours: 8.5 },
  current_readings: { steel_temp_c: 1542, clogging_index: 67, refractory_mm: 85, steel_level_pct: 72, heats_sequence: 8 },
  sensors: [
    { sensor_id: "TUNDISH-002-STEEL_TEMP_C", name: "Steel Temp", value: 1542, unit: "°C", status: "normal" },
    { sensor_id: "TUNDISH-002-CLOGGING_INDEX", name: "Clogging Index", value: 67, unit: "", status: "warning" },
    { sensor_id: "TUNDISH-002-REFRACTORY_MM", name: "Refractory", value: 85, unit: "mm", status: "warning" },
    { sensor_id: "TUNDISH-002-STEEL_LEVEL_PCT", name: "Steel Level", value: 72, unit: "%", status: "normal" },
  ],
  shap_features: [
    { feature: "clogging_index", display_name: "Clogging Index", value: 67, shap_value: 0.32, direction: "increases_risk" },
    { feature: "refractory_mm", display_name: "Refractory", value: 85, shap_value: 0.18, direction: "increases_risk" },
    { feature: "heats_sequence", display_name: "Heats in Sequence", value: 8, shap_value: 0.12, direction: "increases_risk" },
    { feature: "steel_temp_c", display_name: "Steel Temp", value: 1542, shap_value: -0.05, direction: "decreases_risk" },
  ],
  llm_explanation: "TUNDISH-002 shows HIGH risk with 78% failure probability. Primary factors: elevated clogging index (67) and refractory thickness approaching minimum threshold (85mm). Recommend immediate inspection.",
  recommendations: [
    { priority: 1, action: "Inspect nozzle for alumina buildup", urgency: "immediate", estimated_time_mins: 20 },
    { priority: 2, action: "Increase argon flow rate", urgency: "soon", estimated_time_mins: 5 },
    { priority: 3, action: "Schedule refractory relining", urgency: "planned", estimated_time_mins: 240 },
  ]
};

const mockSensorHistory = {
  sensor_id: "TUNDISH-002-CLOGGING_INDEX",
  name: "Clogging Index",
  current_value: 67,
  thresholds: { warning: 50, alarm: 75 },
  statistics: { min: 12, max: 67, avg: 38.5, std_dev: 15.2 },
  history: Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.min(67, 12 + i * 2.5 + Math.random() * 5),
    timeStr: `${(23-i) === 0 ? 'Now' : (23-i) + 'h ago'}`
  }))
};

// --- Helper Components (Production Design) ---

const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-[var(--color-surface)] backdrop-blur-xl border border-[var(--color-border)] rounded-3xl shadow-lg shadow-black/5 overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xl backdrop-blur-md z-50">
        <p className="text-[var(--color-text-muted)] text-xs mb-2 font-medium uppercase tracking-wider">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-1 min-w-30">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: p.color || p.fill, backgroundColor: p.color || p.fill }} />
            <span className="text-[var(--color-text-main)] text-sm font-medium flex-1 capitalize">{p.name}</span>
            <span className="text-[var(--color-text-main)] font-mono font-bold">{Number(p.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, unit, trend, icon: Icon, color, subtitle }: any) => {
  const isUp = trend > 0;
  const isNeutral = trend === undefined;
  
  const colorStyles: any = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-500 border-purple-500/20",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/20",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-500 border-rose-500/20",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/20",
    cyan: "from-cyan-500/10 to-cyan-600/5 text-cyan-500 border-cyan-500/20",
  };

  return (
    <Card className="relative group hover:border-[var(--color-border)] hover:ring-1 hover:ring-[var(--color-border)]">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br ${colorStyles[color]} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl bg-linear-to-br border ${colorStyles[color]} shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
          {!isNeutral && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isUp ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-[var(--color-text-muted)] text-sm font-medium tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-bold text-[var(--color-text-main)] tracking-tight mt-1">
          {value}<span className="text-lg text-[var(--color-text-muted)] ml-1 font-normal">{unit}</span>
        </p>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};

// --- View Components ---

// 1. GOLD VIEW: Plant Overview
const GoldView = ({ onStageClick }: { onStageClick: (stage: any) => void }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Plant KPIs</h2>
        <div className="px-3 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)]">Live Data</div>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Plant OEE" value={mockPlantData.kpis.oee} unit="%" trend={2.3} icon={Zap} color="blue" />
        <MetricCard title="Yield" value={mockPlantData.kpis.yield_pct} unit="%" trend={1.1} icon={CheckCircle2} color="emerald" />
        <MetricCard title="Production" value={mockPlantData.kpis.production_rate_tons_hr} unit="t/h" trend={-0.5} icon={Factory} color="purple" />
        <MetricCard title="At Risk Assets" value={mockPlantData.kpis.high_risk_equipment} unit="" icon={AlertTriangle} color="rose" subtitle={`${mockPlantData.kpis.active_alerts} Active Alerts`} />
      </div>

      {/* Production Flow */}
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
                      className={`relative group w-40 p-4 rounded-2xl border transition-all duration-300 ${statusColors[stage.status as keyof typeof statusColors]} hover:shadow-lg`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className={`w-3 h-3 rounded-full ${dotColors[stage.status as keyof typeof dotColors]} shadow-[0_0_8px_currentColor]`} />
                         <span className="text-[10px] font-bold uppercase opacity-70">{stage.equipment_count} EQ</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-[var(--color-text-main)] mb-1">{stage.name}</p>
                        <p className="text-xs opacity-80">{stage.high_risk_count > 0 ? `${stage.high_risk_count} Risk` : 'Optimal'}</p>
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

        {/* Critical Alerts */}
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

// 2. SILVER VIEW: Stage Detail
const SilverView = ({ stage, onEquipClick }: { stage: typeof mockStageData, onEquipClick: (eq: any) => void }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Risk Overview */}
        <Card className="p-6 lg:col-span-1 h-fit">
           <h3 className="text-lg font-bold mb-6 text-[var(--color-text-main)]">Risk Distribution</h3>
           <div className="space-y-6">
             {Object.entries(stage.risk_distribution).map(([risk, count]) => {
                const colors = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-rose-500" };
                const textColors = { low: "text-emerald-500", medium: "text-amber-500", high: "text-rose-500" };
                const total = Object.values(stage.risk_distribution).reduce((a, b) => a + b, 0);
                
                return (
                  <div key={risk}>
                    <div className="flex justify-between items-end mb-2">
                       <span className={`text-sm font-bold capitalize ${textColors[risk as keyof typeof textColors]}`}>{risk} Risk</span>
                       <span className="text-xs text-[var(--color-text-muted)]">{count} Assets</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${colors[risk as keyof typeof colors]}`} 
                         style={{ width: `${(count / total) * 100}%` }}
                       />
                    </div>
                  </div>
                );
             })}
           </div>
        </Card>

        {/* Right Panel: Equipment Grid */}
        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stage.equipment.map(eq => {
                 const statusColors = {
                   green: { border: "border-emerald-500/30", text: "text-emerald-500", bg: "bg-emerald-500/5", glow: "shadow-emerald-500/20" },
                   yellow: { border: "border-amber-500/30", text: "text-amber-500", bg: "bg-amber-500/5", glow: "shadow-amber-500/20" },
                   red: { border: "border-rose-500/30", text: "text-rose-500", bg: "bg-rose-500/5", glow: "shadow-rose-500/20" }
                 };
                 const theme = statusColors[eq.status as keyof typeof statusColors];

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

// 3. BRONZE VIEW: Equipment Detail
const BronzeView = ({ equipment, onSensorClick }: { equipment: typeof mockEquipmentData, onSensorClick: (s: any) => void }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Health Card */}
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

          {/* AI Analysis (SHAP) */}
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

       {/* Sensor Grid */}
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

       {/* Recommendations */}
       <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-text-main)]">
             <List className="w-5 h-5 text-blue-500" /> Recommended Actions
          </h3>
          <div className="space-y-3">
             {equipment.recommendations.map(rec => {
                const colors = { immediate: "border-rose-500 bg-rose-500/10 text-rose-500", soon: "border-amber-500 bg-amber-500/10 text-amber-500", planned: "border-blue-500 bg-blue-500/10 text-blue-500" };
                const c = colors[rec.urgency as keyof typeof colors];
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

// 4. DATA VIEW: Sensor History
const DataView = ({ sensor }: { sensor: typeof mockSensorHistory }) => {
  return (
     <div className="space-y-6 animate-fade-in pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 p-6 flex flex-col h-96">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)]">{sensor.name} Trend</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Last 24 Hours</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-bold font-mono text-[var(--color-text-main)]">{sensor.current_value}</p>
                    <p className="text-xs text-amber-500 font-bold uppercase">Current Value</p>
                 </div>
              </div>
              <div className="flex-1 -ml-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sensor.history}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="timeStr" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                       <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                       <Tooltip content={<CustomTooltip />} />
                       <ReferenceLine y={sensor.thresholds.alarm} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'ALARM', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                       <ReferenceLine y={sensor.thresholds.warning} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'WARN', fill: '#eab308', fontSize: 10, position: 'right' }} />
                       <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <div className="space-y-6">
              <Card className="p-6">
                 <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase mb-4">Statistics (24h)</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Min</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{sensor.statistics.min.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Max</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{sensor.statistics.max.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Avg</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{sensor.statistics.avg.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Std Dev</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{sensor.statistics.std_dev.toFixed(1)}</p>
                    </div>
                 </div>
              </Card>
              
              <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                 <Filter className="w-4 h-4" /> Export CSV Data
              </button>
           </div>
        </div>
     </div>
  );
};


// --- Sidebar & Layout ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]'
    }`}
  >
    <Icon className={`w-5 h-5 z-10 ${active ? 'animate-bounce-subtle' : ''}`} />
    <span className="font-semibold text-sm z-10">{label}</span>
    {active && <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />}
  </button>
);

const ThemeToggle = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => (
  <button 
    onClick={toggleTheme}
    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)] transition-all duration-200"
  >
    <div className="relative w-5 h-5">
      <Sun className={`absolute inset-0 transition-transform duration-500 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute inset-0 transition-transform duration-500 ${theme === 'light' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
    </div>
    <span className="font-semibold text-sm">
      {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
    </span>
  </button>
);

export default function App() {
  const [currentView, setCurrentView] = useState<"gold" | "silver" | "bronze" | "data">("gold");
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation Handlers
  const handleStageClick = (stage: any) => {
    setSelectedStage(stage);
    setCurrentView("silver");
  };

  const handleEquipmentClick = (equipment: any) => {
    setSelectedEquipment(equipment);
    setCurrentView("bronze");
  };

  const handleSensorClick = (sensor: any) => {
    setSelectedSensor(sensor);
    setCurrentView("data");
  };

  const handleBreadcrumb = (view: "gold" | "silver" | "bronze") => {
    if (view === "gold") {
      setCurrentView("gold");
      setSelectedStage(null);
      setSelectedEquipment(null);
      setSelectedSensor(null);
    } else if (view === "silver") {
      setCurrentView("silver");
      setSelectedEquipment(null);
      setSelectedSensor(null);
    } else if (view === "bronze") {
      setCurrentView("bronze");
      setSelectedSensor(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)] text-[var(--color-text-main)] font-sans custom-scrollbar transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-70 bg-[var(--color-bg)] border-r border-[var(--color-border)] z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group cursor-pointer hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none text-[var(--color-text-main)]">Intelli<span className="text-blue-500">OEE</span></h1>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Steel Plant</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-[var(--color-text-muted)]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Plant Overview" active={currentView === 'gold'} onClick={() => handleBreadcrumb('gold')} />
            <SidebarItem icon={Server} label="Equipment" active={currentView !== 'gold'} onClick={() => {}} />
            <SidebarItem icon={TrendingUp} label="Analytics" active={false} onClick={() => {}} />
            <div className="my-4 h-px bg-[var(--color-border)] opacity-50" />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <SidebarItem icon={Settings} label="Settings" active={false} onClick={() => {}} />
          </nav>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer shadow-sm">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-500 to-teal-500 border-2 border-[var(--color-bg)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text-main)] truncate">Alex Morgan</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">Plant Manager</p>
            </div>
            <Settings className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar (Mobile Only) */}
        <div className="lg:hidden h-16 border-b border-[var(--color-border)] flex items-center justify-between px-4 bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--color-text-muted)]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-[var(--color-text-main)]">Dashboard</span>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             
             {/* Dynamic Breadcrumbs & Header */}
             <div className="mb-8 animate-fade-in">
               <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-4">
                 <span onClick={() => handleBreadcrumb('gold')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'gold' ? 'text-blue-500 font-bold' : ''}`}>Plant</span>
                 {currentView !== 'gold' && (
                    <>
                      <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                      <span onClick={() => handleBreadcrumb('silver')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'silver' ? 'text-blue-500 font-bold' : ''}`}>
                         {selectedStage ? selectedStage.name : mockStageData.name}
                      </span>
                    </>
                 )}
                 {(currentView === 'bronze' || currentView === 'data') && (
                    <>
                      <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                      <span onClick={() => handleBreadcrumb('bronze')} className={`cursor-pointer hover:text-blue-500 transition-colors ${currentView === 'bronze' ? 'text-blue-500 font-bold' : ''}`}>
                         {selectedEquipment ? selectedEquipment.equip_id : mockEquipmentData.equip_id}
                      </span>
                    </>
                 )}
                 {currentView === 'data' && (
                    <>
                       <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                       <span className="text-blue-500 font-bold">{selectedSensor?.name}</span>
                    </>
                 )}
               </nav>

               <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-bold text-[var(--color-text-main)] tracking-tight">
                       {currentView === 'gold' && "Production Overview"}
                       {currentView === 'silver' && (selectedStage ? selectedStage.name : mockStageData.name)}
                       {currentView === 'bronze' && (selectedEquipment ? selectedEquipment.equip_id : mockEquipmentData.equip_id)}
                       {currentView === 'data' && (selectedSensor ? selectedSensor.name : "Sensor Data")}
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-2 font-medium">
                       {currentView === 'gold' && "Real-time plant monitoring and critical alerts"}
                       {currentView === 'silver' && "Stage-level equipment status and risk assessment"}
                       {currentView === 'bronze' && "Diagnostic telemetry and health analysis"}
                       {currentView === 'data' && "Historical time-series analysis"}
                    </p>
                  </div>
                  {currentView === 'gold' && (
                    <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-sm font-bold text-[var(--color-text-main)]">{mockPlantData.kpis.active_alerts} Alerts</span>
                    </div>
                  )}
               </div>
             </div>

             {/* Content Views */}
             {currentView === 'gold' && <GoldView onStageClick={handleStageClick} />}
             {currentView === 'silver' && <SilverView stage={mockStageData} onEquipClick={handleEquipmentClick} />}
             {currentView === 'bronze' && <BronzeView equipment={mockEquipmentData} onSensorClick={handleSensorClick} />}
             {currentView === 'data' && <DataView sensor={mockSensorHistory} />}
             
          </div>
        </main>
      </div>
    </div>
  );
}