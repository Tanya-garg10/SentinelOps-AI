import React from 'react';
import { FileText, CheckCircle2, Bot, Calendar, Clock } from 'lucide-react';
import { Incident } from '../types';

interface RCAListViewProps {
  incident: Incident;
  onViewIncident: () => void;
}

export const RCAListView: React.FC<RCAListViewProps> = ({ incident, onViewIncident }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Blameless Postmortems &amp; RCA Archive</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable incident reviews generated under blameless review principles to promote engineering resilience.
            </p>
          </div>
        </div>
      </div>

      {incident.rca ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {incident.rca.rca_id}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-300">
                Incident: {incident.rca.incident_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                {incident.rca.severity}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">{incident.rca.generated_at}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-100">{incident.rca.title}</h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{incident.rca.root_cause}</p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span>Preventative Items: {incident.rca.action_items.length}</span>
              <span>•</span>
              <span className="text-emerald-400">Blameless Review Standard</span>
            </div>

            <button
              onClick={onViewIncident}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-colors"
            >
              Open Full Postmortem
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No Postmortem Generated Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Authorize and execute the pending rollback on the active P1 incident to automatically trigger the RCA Agent synthesis.
          </p>
          <button
            onClick={onViewIncident}
            className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
          >
            Review Active P1 Incident
          </button>
        </div>
      )}
    </div>
  );
};
