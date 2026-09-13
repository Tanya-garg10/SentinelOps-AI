import React from 'react';
import { Bot, Cpu, ShieldCheck, Terminal, Layers, Sparkles } from 'lucide-react';

export const AgentsView: React.FC = () => {
  const agents = [
    {
      id: 'triage_agent',
      name: 'Triage Agent',
      role: 'Alert Ingestion & Correlation Specialist',
      temperature: 0.1,
      model: 'lyzr-agent-v1 / gpt-4o-mini',
      tools: ['alert_deduplicator', 'signature_correlator', 'severity_classifier'],
      safe_ai_rule: 'RULE-001 (Allowlist Verification)',
      description:
        'Ingests raw Prometheus and OpenTelemetry alert streams, groups co-occurring signals by service namespace, and deterministically computes incident severity (P1-P4).',
    },
    {
      id: 'diagnostic_agent',
      name: 'Diagnostic Agent',
      role: 'Root Cause & Telemetry Investigator',
      temperature: 0.1,
      model: 'lyzr-agent-v1 / gpt-4o',
      tools: ['mock_metrics_tool', 'mock_logs_tool', 'mock_traces_tool', 'mock_deployments_tool'],
      safe_ai_rule: 'RULE-006 & RULE-007 (Evidence Grounding)',
      description:
        'Synthesizes multi-modal observability telemetry. Formulates and tests competing hypotheses, disproving non-viable explanations. Must ground conclusions in verified Evidence IDs.',
    },
    {
      id: 'remediation_agent',
      name: 'Remediation Agent',
      role: 'Runbook Selection & Action Planner',
      temperature: 0.1,
      model: 'lyzr-agent-v1 / gpt-4o-mini',
      tools: ['runbook_catalog_query', 'risk_classifier', 'parameter_validator'],
      safe_ai_rule: 'RULE-002, RULE-004 & RULE-008 (Runbook Allowlist)',
      description:
        'Constrained to the approved operational catalog. Never outputs arbitrary shell commands or raw scripts. Routes high-risk production actions to the HITL gate.',
    },
    {
      id: 'rca_agent',
      name: 'RCA Agent',
      role: 'Blameless Postmortem Synthesizer',
      temperature: 0.2,
      model: 'lyzr-agent-v1 / gpt-4o',
      tools: ['timeline_extractor', 'incident_history_indexer', 'jira_action_item_generator'],
      safe_ai_rule: 'RULE-010 (AIMS Audit Compliance)',
      description:
        'Generates blameless post-incident reviews following incident recovery. Produces chronological timelines, contributing factors, and assigned preventative action items.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Governed SRE Multi-Agent Swarm</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by the Lyzr Agent API &amp; SDK with low-temperature deterministic outputs and strict tool schemas.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 text-xs font-mono">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>4 Specialized Autonomous Roles</span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((ag) => (
          <div key={ag.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{ag.name}</h3>
                    <span className="text-[11px] font-mono text-cyan-300">{ag.role}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-semibold">
                  ACTIVE
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{ag.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Model Engine:</span>
                <span className="text-slate-200">{ag.model}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Sampling Temp:</span>
                <span className="text-cyan-400 font-bold">{ag.temperature} (Deterministic)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Safe AI Constraint:</span>
                <span className="text-amber-300">{ag.safe_ai_rule}</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-500 text-[10px]">Bound Tools:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ag.tools.map((t) => (
                    <span key={t} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
