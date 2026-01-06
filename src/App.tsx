import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  Activity, AlertTriangle, TrendingUp, TrendingDown, Settings, 
  Bell, ChevronRight, Zap, Shield, Target, Clock, Filter, 
  LayoutDashboard, Server, Menu, Search, X
} from 'lucide-react';

// --- Mock Data Generator (Kept logic, improved structure) ---
const generateMockData = () => {
  const machines = [
    { id: 'M-001', name: 'CNC Mill A', risk: 85, status: 'critical', location: 'Floor 1', oee: 72, availability: 80, performance: 75, quality: 90 },
    { id: 'M-002', name: 'Lathe B', risk: 68, status: 'warning', location: 'Floor 1', oee: 81, availability: 85, performance: 80, quality: 95 },
    { id: 'M-003', name: 'Press C', risk: 45, status: 'good', location: 'Floor 2', oee: 89, availability: 92, performance: 88, quality: 98 },
    { id: 'M-004', name: 'Welder D', risk: 92, status: 'critical', location: 'Floor 2', oee: 65, availability: 70, performance: 72, quality: 85 },
    { id: 'M-005', name: 'Grinder E', risk: 38, status: 'good', location: 'Floor 3', oee: 93, availability: 95, performance: 92, quality: 99 },
    { id: 'M-006', name: 'Router F', risk: 71, status: 'warning', location: 'Floor 3', oee: 78, availability: 82, performance: 79, quality: 91 },
  ];

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    failures: Math.floor(Math.random() * 3),
    efficiency: Math.floor(Math.random() * 20) + 70,
    availability: Math.floor(Math.random() * 15) + 80,
  }));

  const rootCauses = [
    { cause: 'Bearing Wear', count: 28, fill: '#6366f1' },
    { cause: 'Overheating', count: 18, fill: '#8b5cf6' },
    { cause: 'Vibration', count: 15, fill: '#ec4899' },
    { cause: 'Lubrication', count: 12, fill: '#f43f5e' },
    { cause: 'Alignment', count: 7, fill: '#14b8a6' },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 35, fill: '#10b981' },
    { name: 'Medium Risk', value: 45, fill: '#f59e0b' },
    { name: 'High Risk', value: 20, fill: '#ef4444' },
  ];

  return { machines, trendData, rootCauses, riskDistribution };
};

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-200 mb-2">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-400 capitalize">{p.name}:</span>
            <span className="font-mono text-slate-100 font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, change, icon: Icon, trend, colorClass }: any) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const MachineCard = ({ machine, onClick }: any) => {
  const statusColors: any = {
    critical: 'bg-rose-500 shadow-rose-500/20',
    warning: 'bg-amber-500 shadow-amber-500/20',
    good: 'bg-emerald-500 shadow-emerald-500/20',
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-800 border border-slate-700 hover:border-slate-600 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusColors[machine.status]} shadow-lg animate-pulse`} />
          <div>
            <h3 className="font-bold text-white text-lg">{machine.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{machine.id}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
          machine.status === 'critical' ? 'bg-rose-500/10 text-rose-400' : 
          machine.status === 'warning' ? 'bg-amber-500/10 text-amber-400' : 
          'bg-emerald-500/10 text-emerald-400'
        }`}>
          {machine.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">OEE</span>
          <p className="text-lg font-bold text-blue-400">{machine.oee}%</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avail</span>
          <p className="text-lg font-bold text-purple-400">{machine.availability}%</p>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Perf</span>
          <p className="text-lg font-bold text-cyan-400">{machine.performance}%</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Pages ---

const ExecutiveOverview = ({ data }: any) => {
  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Real-time production intelligence & KPI monitoring</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Overall OEE" 
          value="79.7%" 
          change="+3.2%" 
          trend="up" 
          icon={Zap}
          colorClass="from-blue-500 to-indigo-600"
        />
        <MetricCard 
          title="Availability" 
          value="84.2%" 
          change="-0.5%" 
          trend="down" 
          icon={Clock}
          colorClass="from-violet-500 to-purple-600"
        />
        <MetricCard 
          title="Performance" 
          value="92.1%" 
          change="+1.8%" 
          trend="up" 
          icon={Activity}
          colorClass="from-cyan-500 to-teal-600"
        />
        <MetricCard 
          title="Quality Rate" 
          value="98.5%" 
          change="+0.2%" 
          trend="up" 
          icon={Shield}
          colorClass="from-emerald-500 to-green-600"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Chart: Production Trend */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Production Efficiency Trend</h2>
            <select className="bg-slate-900 border border-slate-700 text-xs text-slate-400 rounded-lg px-2 py-1 outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" name="Efficiency" />
                <Area type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvail)" name="Availability" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart: Downtime Causes */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col">
          <h2 className="text-lg font-bold text-white mb-2">Downtime Analysis</h2>
          <p className="text-sm text-slate-400 mb-6">Top contributing factors to efficiency loss</p>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.rootCauses} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="cause" type="category" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.rootCauses.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Machine Grid Preview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Active Machines</h2>
          <button className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1">
            View All Fleet <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {data.machines.slice(0, 3).map((machine: any) => (
            <MachineCard key={machine.id} machine={machine} onClick={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Sidebar Navigation ---

const Sidebar = ({ activePage, setPage, isMobile, isOpen, toggleSidebar }: any) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet Status', icon: Server },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
  `;

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={toggleSidebar} />
      )}
      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Clarium<span className="text-blue-500">.ai</span></span>
            {isMobile && (
              <button onClick={toggleSidebar} className="ml-auto text-slate-400">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  if (isMobile) toggleSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activePage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
                {activePage === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">System Alert</p>
                  <p className="text-[10px] text-slate-400">Maintenance required</p>
                </div>
              </div>
              <button className="w-full py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- App Container ---

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [data, setData] = useState(generateMockData());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Simulating live data updates
    const interval = setInterval(() => {
      setData(prev => ({ ...prev, trendData: generateMockData().trendData }));
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setPage={setActivePage} 
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isMobile ? 'ml-64' : ''}`}>
        
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-white">OEE Monitor</span>
            <div className="w-6" /> {/* Spacer */}
          </header>
        )}

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activePage === 'overview' && <ExecutiveOverview data={data} />}
          {activePage === 'fleet' && (
            <div className="p-6">
               <h1 className="text-3xl font-bold text-white mb-6">Fleet Management</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.machines.map((machine: any) => (
                  <MachineCard key={machine.id} machine={machine} onClick={() => {}} />
                ))}
               </div>
            </div>
          )}
          {/* Placeholders for other pages */}
          {(activePage === 'analytics' || activePage === 'maintenance') && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Settings className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Module coming soon</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke-opacity: 0.1;
        }
      `}</style>
    </div>
  );
}