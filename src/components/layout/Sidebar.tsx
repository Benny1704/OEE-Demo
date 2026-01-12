import React from 'react';
import { LayoutDashboard, Server, TrendingUp, Settings, Sun, Moon, Zap, X } from 'lucide-react';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xlYB transition-all duration-200 groupYB relative overflow-hidden ${
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  handleViewChange: (view: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, handleViewChange, theme, toggleTheme }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:sticky top-0 h-screen w-70 bg-[var(--color-bg)] border-r border-[var(--color-border)] z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group cursor-pointer hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none text-[var(--color-text-main)]">Intelli<span className="text-blue-500">OEE</span></h1>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Steel Plant</span>
            </div>
            <button onClick={onClose} className="ml-auto lg:hidden text-[var(--color-text-muted)]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Plant Overview" active={currentView === 'gold'} onClick={() => handleViewChange('gold')} />
            <SidebarItem icon={Server} label="Equipment" active={currentView !== 'gold'} onClick={() => {}} />
            <SidebarItem icon={TrendingUp} label="Analytics" active={false} onClick={() => {}} />
            <div className="my-4 h-px bg-[var(--color-border)] opacity-50" />
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
    </>
  );
};