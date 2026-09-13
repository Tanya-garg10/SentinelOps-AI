import React from 'react';
import {
  Bell,
  Search,
  Stethoscope,
  Wrench,
  ShieldCheck,
  UserCheck,
  Play,
  FileText,
  Check,
} from 'lucide-react';
import { Incident } from '../types';

interface WorkflowStepperProps {
  incident: Incident;
  activeStepIndex: number;
  onStepClick: (stepIndex: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  incident,
  activeStepIndex,
  onStepClick,
}) => {
  const isApproved = incident.proposed_action?.approval_status === 'APPROVED';
  const isResolved = incident.status === 'RESOLVED';

  const steps = [
    { id: 'alert', label: 'Alert Storm', sub: '5 Signals Ingested', icon: Bell, completed: true },
    { id: 'triage', label: 'Triage Agent', sub: 'P1 Declared', icon: Search, completed: true },
    { id: 'diagnose', label: 'Diagnostic Agent', sub: '4 Evidences Verified', icon: Stethoscope, completed: true },
    { id: 'remediation', label: 'Remediation Agent', sub: 'ROLLBACK Proposed', icon: Wrench, completed: true },
    { id: 'governance', label: 'Policy Engine', sub: '10 Rules Evaluated', icon: ShieldCheck, completed: true },
    { id: 'approval', label: 'Human Approval', sub: isApproved ? 'Approved by SRE' : 'Awaiting Authorization', icon: UserCheck, completed: isApproved, current: !isApproved },
    { id: 'execution', label: 'Mock Execution', sub: isResolved ? 'Telemetry Recovered' : 'Pending Gate', icon: Play, completed: isResolved, current: isApproved && !isResolved },
    { id: 'rca', label: 'Blameless RCA', sub: isResolved ? 'Postmortem Ready' : 'Awaiting Resolution', icon: FileText, completed: isResolved },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.current;
          const isDone = step.completed;

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 min-w-4 transition-colors ${
                    isDone ? 'bg-cyan-500/60' : isCurrent ? 'bg-amber-500/60 border-t border-dashed border-amber-400' : 'bg-slate-800'
                  }`}
                />
              )}

              <button
                onClick={() => onStepClick(idx)}
                className={`flex flex-col items-center text-center group cursor-pointer transition-all p-1.5 rounded-lg ${
                  activeStepIndex === idx ? 'bg-slate-800/80 ring-1 ring-cyan-500/40' : 'hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : isCurrent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>

                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isDone ? 'text-slate-200' : isCurrent ? 'text-amber-300' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>

                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap mt-0.5">
                  {step.sub}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
