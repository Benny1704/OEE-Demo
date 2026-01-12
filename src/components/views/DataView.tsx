import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Filter } from 'lucide-react';
import { Card } from '../shared/Card';
import { CustomTooltip } from '../shared/Charts';
import type { SensorHistory } from '../../types';

interface DataViewProps {
  sensor: SensorHistory;
}

const DataView: React.FC<DataViewProps> = ({ sensor }) => {
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
export default DataView;