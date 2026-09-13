import React, { useState } from 'react';
import { FileCheck2, Filter, ChevronDown, ChevronUp, Bot, User, ShieldCheck } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailViewProps {
  auditEvents: AuditEvent[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditEvents }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterActor, setFilterActor] = useState<string>('ALL');

  const filteredEvents = auditEvents.filter((e) => {
    if (filterActor === 'ALL') return true;
    return e.actor === filterActor;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">AIMS-Compatible Audit Ledger</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamper-evident record of all agent deliberations, evidence inputs, policy evaluations, and human authorizations.
            </p>
          </div>
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Actor Filter:</span>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 px-2.5 py-1 rounded-lg"
            >
              <option value="ALL">All Actors</option>
              <option value="triage_agent">triage_agent</option>
              <option value="diagnostic_agent">diagnostic_agent</option>
              <option value="remediation_agent">remediation_agent</option>
              <option value="rca_agent">rca_agent</option>
              <option value="policy_engine">policy_engine</option>
              <option value="hitl_controller">hitl_controller</option>
              <option value="human_operator">human_operator</option>
              <option value="mock_executor">mock_executor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800">
          {filteredEvents.map((event) => {
            const isSelected = selectedEventId === event.event_id;
            return (
              <div key={event.event_id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setSelectedEventId(isSelected ? null : event.event_id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      {event.event_id}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {event.actor}
                    </span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{event.event_type}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        event.policy_result === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : event.policy_result === 'PASS_AWAITING_HITL'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {event.policy_result}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{event.timestamp}</span>
                    {isSelected ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-300 mt-2 font-mono">
                  <span className="text-slate-500">Decision:</span> {event.decision}
                </div>

                {event.input_reference && (
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="text-slate-500">Input Reference:</span> {event.input_reference}
                  </div>
                )}

                {/* Expanded Details */}
                {isSelected && event.details && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg text-slate-300 overflow-x-auto border border-slate-800">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
