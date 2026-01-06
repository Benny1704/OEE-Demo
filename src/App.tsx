import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Settings, Bell, ChevronRight, Zap, Shield, Target, Clock, Database, Filter } from 'lucide-react';

// Generate realistic mock data
const generateMockData = () => {
  const machines = [
    { id: 'M-001', name: 'CNC Mill A', risk: 85, status: 'critical', location: 'Floor 1', oee: 72 },
    { id: 'M-002', name: 'Lathe B', risk: 68, status: 'warning', location: 'Floor 1', oee: 81 },
    { id: 'M-003', name: 'Press C', risk: 45, status: 'good', location: 'Floor 2', oee: 89 },
    { id: 'M-004', name: 'Welder D', risk: 92, status: 'critical', location: 'Floor 2', oee: 65 },
    { id: 'M-005', name: 'Grinder E', risk: 38, status: 'good', location: 'Floor 3', oee: 93 },
    { id: 'M-006', name: 'Router F', risk: 71, status: 'warning', location: 'Floor 3', oee: 78 },
  ];

  const trendData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    failures: Math.floor(Math.random() * 5) + 1,
    efficiency: Math.floor(Math.random() * 20) + 70,
    availability: Math.floor(Math.random() * 15) + 80,
  }));

  const rootCauses = [
    { cause: 'Bearing Wear', count: 28, percentage: 35 },
    { cause: 'Temperature', count: 18, percentage: 22 },
    { cause: 'Vibration', count: 15, percentage: 19 },
    { cause: 'Lubrication', count: 12, percentage: 15 },
    { cause: 'Other', count: 7, percentage: 9 },
  ];

  const riskDistribution = [
    { range: '0-20', count: 12, color: '#10b981' },
    { range: '21-40', count: 18, color: '#3b82f6' },
    { range: '41-60', count: 15, color: '#f59e0b' },
    { range: '61-80', count: 8, color: '#ef4444' },
    { range: '81-100', count: 5, color: '#7f1d1d' },
  ];

  return { machines, trendData, rootCauses, riskDistribution };
};

const MetricCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-semibold">{change}</span>
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const MachineCard = ({ machine, onClick }) => {
  const statusColors = {
    critical: 'border-red-500 bg-red-50',
    warning: 'border-orange-500 bg-orange-50',
    good: 'border-green-500 bg-green-50',
  };

  const statusDots = {
    critical: 'bg-red-500',
    warning: 'bg-orange-500',
    good: 'bg-green-500',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border-l-4 ${statusColors[machine.status]} shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${statusDots[machine.status]} animate-pulse`}></span>
            <h3 className="font-bold text-gray-900">{machine.name}</h3>
          </div>
          <p className="text-sm text-gray-500">{machine.id} • {machine.location}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Risk Score</span>
          <span className={`font-bold ${machine.risk > 70 ? 'text-red-600' : machine.risk > 50 ? 'text-orange-600' : 'text-green-600'}`}>
            {machine.risk}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${machine.risk > 70 ? 'bg-red-500' : machine.risk > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${machine.risk}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-gray-600">OEE</span>
          <span className="font-bold text-blue-600">{machine.oee}%</span>
        </div>
      </div>
    </div>
  );
};

const ExecutiveOverview = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-500 mt-1">Real-time performance metrics and insights</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="font-medium">Alerts</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Failure Rate" 
          value="12.4%" 
          change="2.3%" 
          trend="down" 
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard 
          title="High-Risk Machines" 
          value="2" 
          change="1" 
          trend="up" 
          icon={Shield}
          color="orange"
        />
        <MetricCard 
          title="Model Accuracy" 
          value="94.2%" 
          change="1.8%" 
          trend="up" 
          icon={Target}
          color="green"
        />
        <MetricCard 
          title="Avg OEE" 
          value="79.7%" 
          change="3.2%" 
          trend="up" 
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">24-Hour Failure Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.trendData}>
              <defs>
                <linearGradient id="colorFailures" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="failures" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailures)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Root Causes Today</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.rootCauses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="cause" type="category" stroke="#9ca3af" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="availability" stroke="#3b82f6" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MachineDetail = ({ machine, onBack }) => {
  const sensorData = [
    { sensor: 'Temperature', value: 78, max: 100, unit: '°C', status: 'normal' },
    { sensor: 'Vibration', value: 92, max: 100, unit: 'Hz', status: 'warning' },
    { sensor: 'Pressure', value: 65, max: 100, unit: 'PSI', status: 'normal' },
    { sensor: 'Speed', value: 1450, max: 2000, unit: 'RPM', status: 'normal' },
  ];

  const shapData = [
    { feature: 'Temperature', impact: 0.35 },
    { feature: 'Operating Hours', impact: 0.28 },
    { feature: 'Vibration', impact: 0.22 },
    { feature: 'Load Factor', impact: 0.15 },
  ];

  const maintenanceHistory = [
    { date: '2025-01-05', type: 'Preventive', description: 'Bearing lubrication', status: 'Completed' },
    { date: '2025-01-03', type: 'Corrective', description: 'Belt replacement', status: 'Completed' },
    { date: '2024-12-28', type: 'Inspection', description: 'Routine check', status: 'Completed' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{machine.name}</h1>
          <p className="text-gray-500 mt-1">{machine.id} • {machine.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-sm font-medium opacity-90">Failure Probability</span>
          </div>
          <p className="text-5xl font-bold">{machine.risk}%</p>
          <p className="text-sm opacity-90 mt-2">Critical Risk Level</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-8 h-8" />
            <span className="text-sm font-medium opacity-90">Overall OEE</span>
          </div>
          <p className="text-5xl font-bold">{machine.oee}%</p>
          <p className="text-sm opacity-90 mt-2">Below Target (85%)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-8 h-8" />
            <span className="text-sm font-medium opacity-90">Next Maintenance</span>
          </div>
          <p className="text-5xl font-bold">3d</p>
          <p className="text-sm opacity-90 mt-2">Scheduled: Jan 9, 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Live Sensor Readings</h2>
          <div className="space-y-4">
            {sensorData.map((sensor, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{sensor.sensor}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {sensor.value} {sensor.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      sensor.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(sensor.value / sensor.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SHAP Feature Impact</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={shapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="feature" type="category" stroke="#9ca3af" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="impact" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Maintenance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceHistory.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.type === 'Preventive' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'Corrective' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FleetMonitoring = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Monitoring</h1>
        <p className="text-gray-500 mt-1">Real-time overview of all machines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percentage }) => `${range}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Machines by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'Critical', count: 2, color: '#ef4444' },
              { status: 'Warning', count: 2, color: '#f59e0b' },
              { status: 'Good', count: 2, color: '#10b981' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {[
                  { status: 'Critical', count: 2, color: '#ef4444' },
                  { status: 'Warning', count: 2, color: '#f59e0b' },
                  { status: 'Good', count: 2, color: '#10b981' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Machines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} onClick={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [data, setData] = useState(generateMockData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setCurrentPage('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OEE Monitor</h1>
                <p className="text-xs text-gray-500">Production Intelligence</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setCurrentPage('overview'); setSelectedMachine(null); }}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  currentPage === 'overview' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentPage('fleet')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  currentPage === 'fleet' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Fleet
              </button>
              <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'overview' && <ExecutiveOverview data={data} />}
        {currentPage === 'detail' && selectedMachine && (
          <MachineDetail 
            machine={selectedMachine} 
            onBack={() => setCurrentPage('overview')}
          />
        )}
        {currentPage === 'fleet' && <FleetMonitoring data={data} />}
      </main>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}