import React from 'react';
import { AlertTriangle, CheckCircle2, Server, Filter, Radio } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Cloud &amp; Infrastructure Alert Stream</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Raw telemetry alerts ingested from Prometheus Alertmanager, OpenTelemetry, and Kubernetes monitors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-1 rounded-md">
              {alerts.length} Active Alerts Correlated
            </span>
          </div>
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800">
          {alerts.map((alert) => (
            <div key={alert.alert_id} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {alert.alert_id}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-semibold">{alert.service}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">{alert.environment}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">{alert.timestamp}</span>
              </div>

              <div className="text-sm font-semibold text-slate-200 mt-1">{alert.alert_name}</div>

              {alert.metric && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                  <div>
                    <span className="text-slate-500">Metric:</span> <span className="text-slate-300">{alert.metric}</span>
                  </div>
                  {alert.threshold && (
                    <div>
                      <span className="text-slate-500">Threshold:</span>{' '}
                      <span className="text-amber-400">{alert.threshold}</span>
                    </div>
                  )}
                  {alert.current_value && (
                    <div>
                      <span className="text-slate-500">Value:</span>{' '}
                      <span className="text-red-400 font-bold">{alert.current_value}</span>
                    </div>
                  )}
                </div>
              )}

              {alert.labels && Object.keys(alert.labels).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {Object.entries(alert.labels).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-800"
                    >
                      {k}: <span className="text-slate-300">{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
