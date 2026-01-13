// src/components/shared/AlertsModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Filter, Check, AlertOctagon, CheckCircle2, Activity, ArrowRight } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert, fetchStages } from '../../services/api';
import type { Alert, StageDetailAPI } from '../../types/api';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (equipId: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stages, setStages] = useState<StageDetailAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackLoading, setAckLoading] = useState<string | null>(null);

  // Filters
  const [severity, setSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [stageId, setStageId] = useState<string>('all');
  const [status, setStatus] = useState<'active' | 'acknowledged'>('active');

  // Load Filters (Stages) on mount
  useEffect(() => {
    fetchStages().then(res => setStages(res.stages)).catch(console.error);
  }, []);

  // Load Alerts when filters change or modal opens
  const loadAlerts = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const severityParam = severity === 'all' ? undefined : severity;
      const stageParam = stageId === 'all' ? undefined : stageId;
      const isAck = status === 'acknowledged';
      
      const response = await fetchAlerts(stageParam, severityParam, isAck);
      setAlerts(response.alerts);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [isOpen, severity, stageId, status]);

  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAckLoading(alertId);
    try {
      await acknowledgeAlert(alertId);
      await loadAlerts(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setAckLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-main)]">System Alerts</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Real-time anomaly detection and risk events</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] mr-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as any)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none text-[var(--color-text-main)]"
          >
            <option value="active">Active Issues</option>
            <option value="acknowledged">Acknowledged History</option>
          </select>

          <select 
            value={severity} 
            onChange={(e) => setSeverity(e.target.value as any)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none text-[var(--color-text-main)]"
          >
            <option value="all">All Severities</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <select 
            value={stageId} 
            onChange={(e) => setStageId(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none text-[var(--color-text-main)]"
          >
            <option value="all">All Stages</option>
            {stages.map(s => (
              <option key={s.stage_id} value={s.stage_id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[var(--color-surface)]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 opacity-50">
               <Activity className="w-8 h-8 animate-spin mb-2" />
               <p>Fetching alerts...</p>
             </div>
          ) : alerts.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)] opacity-50">
               <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
               <p className="font-bold">No alerts found matching filters</p>
             </div>
          ) : (
             <div className="space-y-3">
               {alerts.map(alert => (
                 <div 
                   key={alert.alert_id} 
                   onClick={() => {
                     onNavigate(alert.equipment);
                     onClose();
                   }}
                   className="group relative flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                 >
                    {/* Severity Indicator */}
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      alert.severity === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />

                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-bold text-[var(--color-text-main)] flex items-center gap-2">
                              {alert.equipment}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] uppercase font-bold">
                                {alert.equipment_type}
                              </span>
                            </h4>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{alert.stage_name}</p>
                          </div>
                          <div className="text-right">
                             <span className="text-xs font-mono text-[var(--color-text-muted)]">
                               {new Date(alert.timestamp).toLocaleString()}
                             </span>
                             {alert.failure_probability > 0 && (
                               <p className="text-xs font-bold text-rose-500 mt-0.5">
                                 {(alert.failure_probability * 100).toFixed(0)}% Risk
                               </p>
                             )}
                          </div>
                       </div>
                       
                       <p className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors leading-relaxed">
                          {alert.message}
                       </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end pl-4 border-l border-[var(--color-border)] ml-2">
                       {status === 'active' && (
                         <button
                           onClick={(e) => handleAcknowledge(alert.alert_id, e)}
                           disabled={ackLoading === alert.alert_id}
                           className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                           title="Acknowledge"
                         >
                           {ackLoading === alert.alert_id ? <Activity className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                         </button>
                       )}
                       <div className="p-2 rounded-lg bg-blue-500/5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4" />
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-muted)]">
           <span>Showing {alerts.length} alerts</span>
           <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> High
              <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> Medium
              <span className="w-2 h-2 rounded-full bg-blue-500 ml-2" /> Low
           </span>
        </div>
      </div>
    </div>
  );
};