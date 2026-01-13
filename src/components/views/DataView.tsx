// src/components/views/DataView.tsx
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Filter, Calendar, Download, Activity, AlertCircle } from 'lucide-react';
import { Card } from '../shared/Card';
import { CustomTooltip } from '../shared/Charts';
import type { SensorHistoryAPI } from '../../types/api';
import { fetchSensorHistory } from '../../services/api';

interface DataViewProps {
  sensorId: string;
}

const DataView: React.FC<DataViewProps> = ({ sensorId }) => {
  const [data, setData] = useState<SensorHistoryAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24); // Default 24 hours

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyData = await fetchSensorHistory(sensorId, timeRange);
        setData(historyData);
      } catch (err) {
        setError("Failed to load sensor history.");
      } finally {
        setLoading(false);
      }
    };

    if (sensorId) {
      loadData();
    }
  }, [sensorId, timeRange]);

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-96 text-[var(--color-text-muted)] animate-pulse">
           <Activity className="w-10 h-10 mb-3 animate-spin" />
           <p className="font-bold">Loading Historical Telemetry...</p>
        </div>
     );
  }

  if (error || !data) {
     return (
        <div className="flex flex-col items-center justify-center h-96 text-rose-500">
           <AlertCircle className="w-10 h-10 mb-3" />
           <p className="font-bold">{error || "Sensor data unavailable"}</p>
        </div>
     );
  }

  // Format history for Recharts
  const chartData = data.history.map(point => {
     const date = new Date(point.timestamp);
     return {
        ...point,
        // If range > 24h, show Date + Time (e.g., "Mon 14:00"), else just Time ("14:00")
        timeStr: timeRange > 24 
           ? date.toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
           : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
     };
  });

  return (
     <div className="space-y-6 animate-fade-in pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Main Chart Card */}
           <Card className="lg:col-span-2 p-6 flex flex-col h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                       {data.name} <span className="text-[var(--color-text-muted)] font-normal text-sm">({data.sensor_id})</span>
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                       <Calendar className="w-3 h-3" />
                       Data Range: Last {timeRange} Hours
                    </p>
                 </div>
                 
                 {/* Time Range Selector */}
                 <div className="flex bg-[var(--color-surface-hover)] rounded-lg p-1 border border-[var(--color-border)]">
                    {[24, 72, 168].map((hours) => (
                       <button
                          key={hours}
                          onClick={() => setTimeRange(hours)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                             timeRange === hours 
                             ? 'bg-[var(--color-bg)] text-blue-500 shadow-sm' 
                             : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                          }`}
                       >
                          {hours === 24 ? '24H' : hours === 168 ? '7D' : `${hours}H`}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex-1 -ml-4 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis 
                          dataKey="timeStr" 
                          stroke="#64748b" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={10} 
                          minTickGap={timeRange > 24 ? 50 : 30} // Increase gap for longer labels
                       />
                       <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                       <Tooltip content={<CustomTooltip />} />
                       
                       {/* Threshold Lines */}
                       <ReferenceLine y={data.thresholds.alarm} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'ALARM', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                       <ReferenceLine y={data.thresholds.warning} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'WARN', fill: '#eab308', fontSize: 10, position: 'right' }} />
                       
                       <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          fill="url(#colorValue)" 
                          animationDuration={1000}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Stats & Actions */}
           <div className="space-y-6">
              
              {/* Current Value Card */}
              <Card className="p-6 text-center">
                 <p className="text-sm font-bold text-[var(--color-text-muted)] uppercase mb-2">Current Reading</p>
                 <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-mono font-bold text-[var(--color-text-main)]">
                       {data.current_value.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-muted)] mt-4">{data.unit}</span>
                 </div>
              </Card>

              {/* Statistics Card */}
              <Card className="p-6">
                 <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase mb-4">Statistics ({timeRange}h)</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Min</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{data.statistics.min.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Max</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{data.statistics.max.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Avg</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{data.statistics.avg.toFixed(1)}</p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl">
                       <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Std Dev</p>
                       <p className="text-xl font-mono font-bold text-[var(--color-text-main)]">{data.statistics.std_dev.toFixed(1)}</p>
                    </div>
                 </div>
              </Card>
              
              <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                 <Download className="w-4 h-4" /> Export CSV Data
              </button>
           </div>
        </div>
     </div>
  );
};

export default DataView;