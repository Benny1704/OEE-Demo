import React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'cyan';
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, trend, icon: Icon, color, subtitle }) => {
  const isUp = trend !== undefined && trend > 0;
  const isNeutral = trend === undefined;
  
  const colorStyles = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-500 border-purple-500/20",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/20",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-500 border-rose-500/20",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/20",
    cyan: "from-cyan-500/10 to-cyan-600/5 text-cyan-500 border-cyan-500/20",
  };

  return (
    <Card className="relative group hover:border-[var(--color-border)] hover:ring-1 hover:ring-[var(--color-border)]">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br ${colorStyles[color]}YZ blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
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