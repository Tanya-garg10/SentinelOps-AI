import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Database,
  Server,
  Layers,
  FileCode,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  GitBranch,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentDetailViewProps {
  incident: Incident;
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  onApproveAction,
  onRejectAction,
  isApproving,
  isRejecting,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'evidence' | 'governance' | 'timeline' | 'rca'>('telemetry');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('LOG-021');

  const isResolved = incident.status === 'RESOLVED';
  const isApproved = incident.proposed_action?.approval_status === 'APPROVED';

  // Format chart data
  const chartData = incident.telemetry.map((t) => ({
    time: t.timestamp,
    memory: t.memory_pct,
    latency: t.latency_ms,
    errors: t.error_rate_pct,
    stage: t.stage,
  }));

  return (
    <div className="space-y-6">
      {/* Incident Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                {incident.severity} CRITICAL
              </span>
              <span className="font-mono text-xs text-slate-400">ID: {incident.incident_id}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <Server className="w-3.5 h-3.5" />
                {incident.affected_services.join(', ')}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">env: production</span>
            </div>

            <h1 className="text-lg font-bold text-slate-100 tracking-tight">{incident.title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{incident.summary}</p>
          </div>

          {/* Right Status & MTTR */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Current Phase</div>
              <div
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md mt-0.5 border ${
                  isResolved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                }`}
              >
                {incident.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800 pt-3 overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Real-time Telemetry' },
            { id: 'evidence', label: `Verified Evidence (${incident.evidence.length})` },
            { id: 'governance', label: 'Governance & HITL Gate' },
            { id: 'timeline', label: `Chronological Timeline (${incident.timeline.length})` },
            { id: 'rca', label: 'Blameless Postmortem (RCA)', badge: isResolved ? 'READY' : 'PENDING' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    tab.badge === 'READY'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* HITL OPERATOR APPROVAL BANNER (High visibility if awaiting approval) */}
      {!isApproved && incident.proposed_action && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-xl p-5 shadow-lg shadow-amber-950/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                    HUMAN-IN-THE-LOOP AUTHORIZATION REQUIRED
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    Rule 4: Production High-Risk
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mt-1">
                  Proposed Action: <span className="text-cyan-300 font-mono">{incident.proposed_action.action}</span> on{' '}
                  <span className="text-slate-200 font-mono">{incident.proposed_action.target}</span> ({incident.proposed_action.from_version} → {incident.proposed_action.to_version})
                </h3>
                <p className="text-xs text-slate-400 mt-1">{incident.proposed_action.reason}</p>
              </div>
            </div>

            {/* Approve / Reject Controls */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => onRejectAction(incident.proposed_action.id)}
                disabled={isRejecting || isApproving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRejecting ? 'Rejecting...' : 'Reject Proposal'}</span>
              </button>

              <button
                onClick={() => onApproveAction(incident.proposed_action.id)}
                disabled={isApproving || isRejecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-white" />
                <span>{isApproving ? 'Executing Rollback...' : 'Authorize & Execute Rollback'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVED BANNER */}
      {isResolved && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 font-mono">INCIDENT RESOLVED SAFELY</span>
              <p className="text-xs text-slate-300">
                Rollback to <span className="font-mono text-cyan-300 font-semibold">v2.8.0</span> completed. Memory normalized to 71.2%, Latency to 620ms. Blameless RCA available below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('rca')}
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 underline font-mono flex items-center gap-1"
          >
            <span>View Blameless RCA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: TELEMETRY & DECISION GRAPH */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Causal Decision Dependency Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Autonomous Causal Dependency Graph
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Synthesized by DiagnosticAgent</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Trigger</div>
                <div className="font-bold text-amber-300 font-mono mt-1">Deploy v2.8.1</div>
                <div className="text-[11px] text-slate-400 mt-1">SessionCache rollout at 17:55Z</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">DEPLOY-009</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Mechanism</div>
                <div className="font-bold text-red-400 font-mono mt-1">Memory Saturation</div>
                <div className="text-[11px] text-slate-400 mt-1">Heap escalated 62% → 94.2%</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">METRIC-001</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Internal Cascade</div>
                <div className="font-bold text-red-300 font-mono mt-1">GC Overhead & OOM</div>
                <div className="text-[11px] text-slate-400 mt-1">4.6s stop-the-world stall</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">LOG-021 &amp; TRACE-017</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Symptom</div>
                <div className="font-bold text-red-400 font-mono mt-1">5xx Spike (18.4%)</div>
                <div className="text-[11px] text-slate-400 mt-1">P99 latency rose to 4.82s</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">ALT-004</div>
              </div>

              <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-lg bg-emerald-950/10">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">Governed Resolution</div>
                <div className="font-bold text-emerald-300 font-mono mt-1">Rollback to v2.8.0</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isResolved ? 'Executed safely' : 'Awaiting SRE Approval'}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">ACT-77189A</div>
              </div>
            </div>
          </div>

          {/* Telemetry Charts: Memory & Latency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Memory Utilization */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">
                    Container Memory Utilization (%)
                  </h4>
                  <span className="text-[11px] text-slate-400">checkout-api pods • Critical Threshold: 90%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {chartData[chartData.length - 1]?.memory}%
                  </span>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#ef4444' }}
                      name="Memory %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: P99 Latency & HTTP 5xx */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">
                    P99 Latency (ms) &amp; 5xx Error Rate (%)
                  </h4>
                  <span className="text-[11px] text-slate-400">Checkout Endpoint Degradation</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {chartData[chartData.length - 1]?.latency}ms
                  </span>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      name="P99 Latency (ms)"
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#06b6d4' }}
                      name="5xx Error %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Before & After Recovery Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono mb-3">
              Telemetry Differential Matrix (Peak vs. Post-Rollback)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Memory Utilization</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-red-400 font-mono font-bold text-sm">94.2%</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-mono font-bold text-sm">71.2%</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">-23.0% reclaimed</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">P99 Request Latency</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-red-400 font-mono font-bold text-sm">4.82s</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-mono font-bold text-sm">620ms</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">-87.1% latency drop</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">HTTP 5xx Error Rate</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-red-400 font-mono font-bold text-sm">18.4%</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-mono font-bold text-sm">1.2%</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">-17.2% errors cleared</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Pod Restarts / CrashLoops</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-red-400 font-mono font-bold text-sm">8 OOM</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400 font-mono font-bold text-sm">0 Stable</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Containers healthy</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED EVIDENCE & HYPOTHESES */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Root Cause & Hypothesis Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-300">
                Diagnostic Agent Synthesis
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">{incident.root_cause}</h3>

            {/* Hypotheses ranking */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                Evaluated Hypotheses &amp; Probabilities:
              </div>
              {incident.hypotheses.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                    h.status === 'CONFIRMED_PRIMARY'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        h.status === 'CONFIRMED_PRIMARY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {h.status === 'CONFIRMED_PRIMARY' ? 'PRIMARY CONFIRMED' : 'DISPROVED'}
                    </span>
                    <span className="font-medium text-slate-200">{h.hypothesis}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {Math.round(h.probability * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incident.evidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidenceId(ev.id)}
                className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedEvidenceId === ev.id
                    ? 'border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {ev.id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-200">{ev.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.finding}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                  <span>Source: {ev.source}</span>
                  <span>{ev.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Evidence Inspector */}
          {selectedEvidenceId && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              <div className="text-[11px] text-cyan-400 mb-2 font-bold uppercase tracking-wider">
                Raw Telemetry Payload: {selectedEvidenceId}
              </div>
              <pre className="text-slate-300 overflow-x-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed">
                {JSON.stringify(incident.evidence.find((e) => e.id === selectedEvidenceId), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOVERNANCE & HITL GATE */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Deterministic Policy Evaluation</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  10 SRE safety rules evaluated outside LLM before any proposed action execution.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>SAFE AI ENGINE: PASS</span>
              </div>
            </div>

            {/* Evaluated Rules List */}
            <div className="space-y-2">
              {incident.proposed_action?.governance_result?.evaluated_rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{rule}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    EVALUATED
                  </span>
                </div>
              ))}
            </div>

            {/* Action Details Card */}
            {incident.proposed_action && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Runbook Action</span>
                    <div className="font-mono font-bold text-cyan-300 mt-1">
                      {incident.proposed_action.action}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Risk Classification</span>
                    <div className="font-mono font-bold text-amber-400 mt-1">
                      {incident.proposed_action.risk}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Target Microservice</span>
                    <div className="font-mono font-bold text-slate-200 mt-1">
                      {incident.proposed_action.target}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Human Approval</span>
                    <div className="font-mono font-bold text-emerald-400 mt-1">
                      {incident.proposed_action.approval_status}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHRONOLOGICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Chronological Event Timeline</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {incident.timeline.map((entry, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-cyan-400 font-semibold">{entry.time}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {entry.actor}
                  </span>
                  {entry.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                      {entry.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 mt-1">{entry.event}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BLAMELESS POSTMORTEM (RCA) */}
      {activeTab === 'rca' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          {incident.rca ? (
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
                      AIMS Postmortem Report
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">ID: {incident.rca.rca_id}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 mt-1">{incident.rca.title}</h2>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-400">
                  <div>Generated by: {incident.rca.agent}</div>
                  <div>Model: {incident.rca.model}</div>
                </div>
              </div>

              {/* Blameless Statement */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg text-slate-300 italic">
                &ldquo;{incident.rca.blameless_statement}&rdquo;
              </div>

              {/* Executive Summary & Impact */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-1">
                  1. Executive Summary &amp; Customer Impact
                </h4>
                <p className="text-slate-300">{incident.rca.impact}</p>
              </div>

              {/* Detection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-1">
                  2. Detection &amp; Triage
                </h4>
                <p className="text-slate-300">{incident.rca.detection}</p>
              </div>

              {/* Root Cause */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-1">
                  3. Evidence-Backed Root Cause
                </h4>
                <p className="text-slate-300">{incident.rca.root_cause}</p>
              </div>

              {/* Contributing Factors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-1">
                  4. Contributing Factors
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {incident.rca.contributing_factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Remediation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-1">
                  5. Governed Remediation
                </h4>
                <p className="text-slate-300">{incident.rca.remediation}</p>
              </div>

              {/* Action Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono mb-2">
                  6. Preventative Action Items
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Action Item</th>
                        <th className="p-2.5">Owner</th>
                        <th className="p-2.5">Priority</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {incident.rca.action_items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 font-mono">
                          <td className="p-2.5 text-cyan-300">{item.id}</td>
                          <td className="p-2.5 font-sans">{item.task}</td>
                          <td className="p-2.5 text-slate-400">{item.owner_team}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px]">
                              {item.priority}
                            </span>
                          </td>
                          <td className="p-2.5 text-emerald-400">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">Postmortem Awaiting Resolution</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The RCA Agent automatically produces a blameless postmortem report as soon as the remediation action is approved and telemetry recovery is confirmed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
