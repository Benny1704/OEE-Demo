import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
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