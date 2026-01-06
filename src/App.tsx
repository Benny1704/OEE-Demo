import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar,Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer, 
  LineChart, Line, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, Settings, 
  Zap, Clock, Filter, 
  LayoutDashboard, Server, Menu, X,
  Factory, AlertCircle, RefreshCw, ChevronLeft, Play, Pause,
  Sun, Moon, Thermometer, Droplet, Wrench, AlertTriangle, Gauge
} from 'lucide-react';

// --- Theme Hook ---
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

// --- Types ---
interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'critical' | 'warning' | 'good';
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  history: number[];
  // New Chemical Industry Fields
  temperature: number;      // °C
  fuelConsumption: number;  // L/h or m3/h
  energyPerUnit: number;    // kWh/ton
  mtbf: number;             // Hours
  mttr: number;             // Hours
  breakdownFreq: number;    // Count/Month
  assetUtilization: number; // %
}

interface TrendPoint {
  time: string;
  oee: number;
  performance: number;
  quality: number;
}

interface DowntimeReason {
  name: string;
  value: number;
  fill: string;
  details?: { name: string; value: number }[];
}

// --- Data Simulation Hook ---
const useLiveData = (isLive: boolean) => {
  // Initial data tailored for Chemical Industry
  const initialMachines: Machine[] = [
    { 
      id: 'R-101', name: 'Reactor Unit 1', type: 'Polymerization', status: 'good', 
      oee: 94, availability: 98, performance: 95, quality: 99, history: [92, 93, 94, 94, 94],
      temperature: 145.5, fuelConsumption: 42.5, energyPerUnit: 120, mtbf: 2500, mttr: 4.5, breakdownFreq: 0.5, assetUtilization: 92
    },
    { 
      id: 'D-202', name: 'Distillation Col', type: 'Separation', status: 'warning', 
      oee: 81, availability: 85, performance: 80, quality: 95, history: [80, 82, 81, 80, 81],
      temperature: 210.2, fuelConsumption: 85.0, energyPerUnit: 180, mtbf: 1800, mttr: 6.0, breakdownFreq: 1.2, assetUtilization: 88
    },
    { 
      id: 'C-303', name: 'Centrifuge Alpha', type: 'Filtration', status: 'critical', 
      oee: 72, availability: 80, performance: 75, quality: 90, history: [70, 72, 71, 74, 72],
      temperature: 65.0, fuelConsumption: 12.5, energyPerUnit: 45, mtbf: 900, mttr: 8.5, breakdownFreq: 2.5, assetUtilization: 75
    },
    { 
      id: 'B-505', name: 'Main Boiler', type: 'Utility', status: 'good', 
      oee: 96, availability: 99, performance: 96, quality: 98, history: [95, 96, 96, 97, 96],
      temperature: 350.0, fuelConsumption: 240.0, energyPerUnit: 310, mtbf: 5000, mttr: 2.0, breakdownFreq: 0.1, assetUtilization: 98
    },
    { 
      id: 'M-404', name: 'Hi-Shear Mixer', type: 'Mixing', status: 'warning', 
      oee: 78, availability: 82, performance: 79, quality: 91, history: [75, 76, 77, 78, 78],
      temperature: 80.5, fuelConsumption: 18.0, energyPerUnit: 55, mtbf: 1200, mttr: 5.0, breakdownFreq: 1.5, assetUtilization: 81
    },
    { 
      id: 'P-606', name: 'Packaging Line', type: 'Finishing', status: 'critical', 
      oee: 65, availability: 70, performance: 72, quality: 85, history: [68, 67, 66, 65, 65],
      temperature: 24.0, fuelConsumption: 8.0, energyPerUnit: 15, mtbf: 600, mttr: 1.5, breakdownFreq: 3.0, assetUtilization: 68
    },
  ];

  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  
  const [trendData, setTrendData] = useState<TrendPoint[]>(() => 
    Array.from({ length: 12 }, (_, i) => ({
      time: `${10 + i}:00`,
      oee: 80 + Math.random() * 10,
      performance: 75 + Math.random() * 15,
      quality: 90 + Math.random() * 5
    }))
  );

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMachines(prev => prev.map(m => {
        const change = (Math.random() - 0.5) * 4;
        const newOee = Math.min(100, Math.max(0, m.oee + change));
        const newHistory = [...m.history.slice(1), newOee];
        let newStatus: Machine['status'] = 'good';
        if (newOee < 70) newStatus = 'critical';
        else if (newOee < 85) newStatus = 'warning';

        // Simulate Temperature fluctuation
        const tempChange = (Math.random() - 0.5) * 1.5;
        
        return { 
          ...m, 
          oee: parseFloat(newOee.toFixed(1)), 
          status: newStatus, 
          history: newHistory,
          temperature: parseFloat((m.temperature +tempChange).toFixed(1))
        };
      }));

      setTrendData(prev => {
        const lastTime = parseInt(prev[prev.length - 1].time.split(':')[0]);
        const nextTime = (lastTime + 1) % 24;
        const newPoint = {
          time: `${nextTime}:00`,
          oee: 75 + Math.random() * 15,
          performance: 70 + Math.random() * 20,
          quality: 90 + Math.random() * 8
        };
        return [...prev.slice(1), newPoint];
      });

    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  return { machines, trendData, setMachines };
};

// --- Helper Components ---

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
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: p.color, backgroundColor: p.color }} />
            <span className="text-[var(--color-text-main)] text-sm font-medium flex-1 capitalize">{p.name}</span>
            <span className="text-[var(--color-text-main)] font-mono font-bold">{Number(p.value).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const chartData = data.map((val, i) => ({ i, val }));
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const MetricCard = ({ title, value, change, icon: Icon, trend, color, subtitle }: any) => {
  const isUp = trend === 'up';
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
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isUp ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <h3 className="text-[var(--color-text-muted)] text-sm font-medium tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-bold text-[var(--color-text-main)] tracking-tight mt-1">{value}</p>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};

// --- Sub-components for Fleet Status ---

const MachineCard = ({ machine, onClick }: { machine: Machine; onClick?: () => void }) => {
  const statusConfig = {
    critical: { color: '#f43f5e', text: 'text-rose-500', bg: 'bg-rose-500', glow: 'shadow-rose-500/50', border: 'border-rose-500/30' },
    warning: { color: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500', glow: 'shadow-amber-500/50', border: 'border-amber-500/30' },
    good: { color: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', border: 'border-emerald-500/30' },
  };
  
  const config = statusConfig[machine.status];

  return (
    <Card onClick={onClick} className="hover:scale-[1.02] cursor-pointer group hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center">
            <Factory className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-blue-500 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-text-main)]">{machine.name}</h3>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">{machine.id}</p>
          </div>
        </div>
        <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border ${config.border} bg-[var(--color-bg)]`}>
          <div className={`w-2.5 h-2.5 rounded-full ${config.bg} ${config.glow} shadow-[0_0_10px_currentColor] animate-pulse`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex items-center justify-between">
         <div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Efficiency</span>
            <span className="text-3xl font-bold text-[var(--color-text-main)]">{machine.oee}%</span>
         </div>
         <Sparkline data={machine.history} color={config.color} />
      </div>

      {/* Footer Metrics */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-2">
        {[{l: 'Temp', v: `${machine.temperature}°C`}, {l: 'Util', v: `${machine.assetUtilization}%`}, {l: 'Quality', v: `${machine.quality}%`}].map((m, i) => (
           <div key={i} className="text-center p-2 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
              <span className="block text-[10px] text-[var(--color-text-muted)] font-bold mb-1">{m.l}</span>
              <span className="text-sm font-bold text-[var(--color-text-main)]">{m.v}</span>
           </div>
        ))}
      </div>
    </Card>
  );
};

const FleetDetailView = ({ machine, onBack }: { machine: Machine; onBack: () => void }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">{machine.name}</h1>
          <p className="text-[var(--color-text-muted)] flex items-center gap-2">
            ID: {machine.id} • Type: {machine.type} • 
            <span className={`inline-block w-2 h-2 rounded-full ${machine.status === 'good' ? 'bg-emerald-500' : machine.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            Status: {machine.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Temperature" value={`${machine.temperature}°C`} icon={Thermometer} color="rose" subtitle="Optimal: 60-150°C" />
        <MetricCard title="Fuel Consump." value={`${machine.fuelConsumption}`} icon={Droplet} color="amber" subtitle="Liters / Hour" />
        <MetricCard title="Energy / Unit" value={`${machine.energyPerUnit}`} icon={Zap}SJcolor="blue" subtitle="kWh / Ton" />
        <MetricCard title="Asset Util." value={`${machine.assetUtilization}%`} icon={Gauge} color="emerald" subtitle="Target: >85%" />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 lg:col-span-2">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <Activity className="w-5 h-5 text-blue-500" /> Maintenance Metrics
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                 <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">MTBF</span>
                 </div>
                 <p className="text-2xl font-bold">{machine.mtbf} <span className="text-sm font-normal text-[var(--color-text-muted)]">Hrs</span></p>
                 <p className="text-xs text-[var(--color-text-muted)] mt-1">Mean Time Between Failures</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                 <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">MTTR</span>
                 </div>
                 <p className="text-2xl font-bold">{machine.mttr} <span className="text-sm font-normal text-[var(--color-text-muted)]">Hrs</span></p>
                 <p className="text-xs text-[var(--color-text-muted)] mt-1">Mean Time To Repair</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                 <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Breakdown Freq</span>
                 </div>
                 <p className="text-2xl font-bold">{machine.breakdownFreq} <span className="text-sm font-normal text-[var(--color-text-muted)]">/ Mo</span></p>
                 <p className="text-xs text-[var(--color-text-muted)] mt-1">Avg incidents per month</p>
              </div>
           </div>
           
           <div className="mt-6">
              <h4 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase">Performance History (Last 5 Cycles)</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={machine.history.map((h, i) => ({ i, val: h }))}>
                      <defs>
                        <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fill="url(#colorHistory)" />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </Card>

        {/* Efficiency Breakdown */}
        <Card className="p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-emerald-500" /> Efficiency
           </h3>
           <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  data={[
                    { name: 'OEE', value: machine.oee, fill: '#3b82f6' },
                    { name: 'Availability', value: machine.availability, fill: '#8b5cf6' },
                    { name: 'Performance', value: machine.performance, fill: '#10b981' },
                    { name: 'Quality', value: machine.quality, fill: '#f59e0b' }
                  ]} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar label={{ position: 'insideStart', fill: '#fff' }} background dataKey="value" cornerRadius={10} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: 0, left: 0, lineHeight: '24px' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 w-full text-center">
                 <p className="text-3xl font-bold text-[var(--color-text-main)]">{machine.oee}%</p>
                 <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Overall OEE</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

const FleetStatusPage = ({ machines, selectedMachineId, onSelectMachine }: { machines: Machine[], selectedMachineId: string | null, onSelectMachine: (id: string | null) => void }) => {
  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  if (selectedMachine) {
    return <FleetDetailView machine={selectedMachine} onBack={() => onSelectMachine(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-main)]">Fleet Status</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Detailed overview of all active assets</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-muted)]">
             Total Assets: {machines.length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machines.map((machine) => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            onClick={() => onSelectMachine(machine.id)} 
          />
        ))}
      </div>
    </div>
  );
};

// --- Executive Dashboard ---

const ExecutiveDashboard = ({ theme, machines, trendData, isLive, setIsLive, onNavigateToFleet }: any) => {
  const [visibleSeries, setVisibleSeries] = useState({ oee: true, performance: false, quality: false });
  const [drillDown, setDrillDown] = useState<DowntimeReason | null>(null);

  // Dynamic colors based on theme
  const chartGridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0';
  const chartTextColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  const baseDowntimeData: DowntimeReason[] = [
    { name: 'Process', value: 35, fill: '#ef4444', details: [{name: 'React. Stall', value: 20}, {name: 'Overheat', value: 15}] },
    { name: 'Utility', value: 25, fill: '#f59e0b', details: [{name: 'Power Loss', value: 10}, {name: 'Steam Low', value: 15}] },
    { name: 'Material', value: 20, fill: '#3b82f6', details: [{name: 'Feed Empty', value: 20}] },
    { name: 'Maint', value: 15, fill: '#10b981', details: [{name: 'Planned', value: 5}, {name: 'Pump Fail', value: 10}] },
  ];

  const toggleSeries = (key: 'oee' | 'performance' | 'quality') => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-main)] tracking-tight flex items-center gap-3">
             Chemical Plant Dashboard
             {isLive && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm font-medium">Real-time monitoring • Zone A • Reactor Cluster</p>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setIsLive(!isLive)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${isLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}>
                {isLive ? <><Pause className="w-4 h-4" /> Live Stream On</> : <><Play className="w-4 h-4" /> Paused</>}
            </button>
            <button className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all">
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Plant OEE" value={`${(machines.reduce((acc: number, m: Machine) => acc + m.oee, 0) / machines.length).toFixed(1)}%`} change="+2.4%"Hp trend="up" icon={Zap} color="blue" />
        <MetricCard title="Total Output" value="1,240 T" change="+1.2%" trend="up" icon={Factory} color="purple" subtitle="Daily Production" />
        <MetricCard title="Avg Asset Util" value={`${(machines.reduce((acc: number, m: Machine) => acc + m.assetUtilization, 0) / machines.length).toFixed(1)}%`} change="-0.5%" trend="down" icon={Activity} color="emerald" />
        <MetricCard title="Energy Intensity" value="145" change="-2.1%" trend="up" icon={Droplet} color="amber" subtitle="kWh / Ton" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-112.5">
        
        {/* Interactive Trend Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Efficiency Trend
            </h2>
            <div className="flex gap-4">
               {[
                 { key: 'oee', label: 'OEE', color: '#3b82f6' },
                 { key: 'performance', label: 'Performance', color: '#10b981' },
                 { key: 'quality', label: 'Quality', color: '#8b5cf6' }
               ].map(s => (
                 <button 
                    key={s.key} 
                    onClick={() => toggleSeries(s.key as any)}
                    className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-lg transition-all ${visibleSeries[s.key as keyof typeof visibleSeries] ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
                 >
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: s.color, opacity: visibleSeries[s.key as keyof typeof visibleSeries] ? 1 : 0.3 }} />
                    {s.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex-1 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="time" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                
                {visibleSeries.oee && (
                  <Area type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={3} fill="url(#colorOee)" animationDuration={500} />
                )}
                {visibleSeries.performance && (
                  <Area type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={3} fill="url(#colorPerf)" animationDuration={500} />
                )}
                {visibleSeries.quality && (
                  <Area type="monotone" dataKey="quality" stroke="#8b5cf6" strokeWidth={3} fill="none" animationDuration={500} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Interactive Loss Factors (Drill Down) */}
        <Card className="p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-2 z-10">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Loss Factors
            </h2>
            {drillDown && (
               <button 
                 onClick={() => setDrillDown(null)}
                 className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg"
               >
                 <ChevronLeft className="w-3 h-3" /> Back
               </button>
            )}
          </div>
          
          <p className="text-xs text-[var(--color-text-muted)] mb-6 z-10">
             {drillDown ? `Details for: ${drillDown.name}` : 'Click bar for details'}
          </p>
          
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={drillDown ? drillDown.details : baseDowntimeData} 
                layout="vertical" 
                barSize={20} 
                margin={{ left: 0, right: 30 }}
              >
                <CartesianGrid stroke="none" />
                <XAxis type="number" hide />
                <YAxis 
                   dataKey="name" 
                   type="category" 
                   width={80} 
                   tick={{ fill: chartTextColor, fontSize: 11, fontWeight: 600 }} 
                   axisLine={false} 
                   tickLine={false} 
                />
                <Tooltip cursor={{ fill: chartGridColor }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]} 
                  onClick={(data) => !drillDown && setDrillDown(data)}
                  className="cursor-pointer"
                >
                  {(drillDown ? drillDown.details! : baseDowntimeData).map((entry: any, index: number) => (
                    <Cell 
                       key={`cell-${index}`} 
                       fill={drillDown ? '#64748b' : entry.fill} 
                       className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Active Machines Grid */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            Active Fleet Status
          </h2>
          
          {/* Mock Notification Feed */}
          <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-xs text-[var(--color-text-muted)]">
               <span className="font-bold text-[var(--color-text-main)]">Alert:</span> C-303 High Vibration (5m ago)
             </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine: Machine) => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onClick={() => onNavigateToFleet(machine.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---

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
  const [activePage, setActivePage] = useState('overview');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Lifted state to App level
  const { machines, trendData } = useLiveData(isLive);

  const handleNavigateToFleet = (id: string) => {
    setSelectedMachineId(id);
    setActivePage('fleet');
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
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Chemical</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-[var(--color-text-muted)]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activePage === 'overview'} onClick={() => setActivePage('overview')} />
            <SidebarItem icon={Server} label="Fleet Status" active={activePage === 'fleet'} onClick={() => { setActivePage('fleet'); setSelectedMachineId(null); }} />
            <SidebarItem icon={TrendingUp} label="Analytics" active={activePage === 'analytics'} onClick={() => setActivePage('analytics')} />
            <div className="my-4 h-px bg-[var(--color-border)] opacity-50" />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <SidebarItem icon={Settings} label="Settings" active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
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
             {activePage === 'overview' && (
               <ExecutiveDashboard 
                 theme={theme} 
                 machines={machines} 
                 trendData={trendData} 
                 isLive={isLive} 
                 setIsLive={setIsLive} 
                 onNavigateToFleet={handleNavigateToFleet}
               />
             )}
             {activePage === 'fleet' && (
               <FleetStatusPage 
                 machines={machines} 
                 selectedMachineId={selectedMachineId} 
                 onSelectMachine={setSelectedMachineId} 
               />
             )}
             {activePage !== 'overview' && activePage !== 'fleet' && (
               <div className="flex flex-col items-center justify-center h-[60vh] text-[var(--color-text-muted)] animate-fade-in">
                 <div className="p-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-4 relative group">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors" />
                    <RefreshCw className="w-12 h-12 relative z-10 animate-spin-slow" />
                 </div>
                 <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-1">Module Under Development</h2>
                 <p>This section is currently being upgraded.</p>
               </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}