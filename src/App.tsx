import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StatsCards } from './components/StatsCards';
import { WorkflowStepper } from './components/WorkflowStepper';
import { IncidentDetailView } from './components/IncidentDetailView';
import { DangerousActionModal } from './components/DangerousActionModal';
import { AlertsView } from './components/AlertsView';
import { RunbooksView } from './components/RunbooksView';
import { GovernanceView } from './components/GovernanceView';
import { AuditTrailView } from './components/AuditTrailView';
import { AgentsView } from './components/AgentsView';
import { RCAListView } from './components/RCAListView';

import { Incident, AlertItem, AuditEvent } from './types';
import { INITIAL_CHECKOUT_INCIDENT, INITIAL_ALERTS, INITIAL_AUDIT_LOG } from './data/mockData';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [incident, setIncident] = useState<Incident>(INITIAL_CHECKOUT_INCIDENT);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_LOG);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5); // Human Approval

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isEvaluatingDangerous, setIsEvaluatingDangerous] = useState<boolean>(false);
  const [dangerousResult, setDangerousResult] = useState<any>(null);
  const [isDangerousModalOpen, setIsDangerousModalOpen] = useState<boolean>(false);

  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Fetch live state from backend
  const fetchState = async () => {
    try {
      const [incRes, auditRes] = await Promise.all([
        fetch('/api/incidents/INC-001'),
        fetch('/api/audit'),
      ]);

      if (incRes.ok) {
        const incData = await incRes.json();
        setIncident(incData);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditEvents(auditData.audit_events || INITIAL_AUDIT_LOG);
      }
    } catch (err) {
      // Graceful fallback to client-side state
      console.warn('Backend API sync using local simulation state');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Update active step based on incident status
  useEffect(() => {
    if (incident.status === 'RESOLVED') {
      setActiveStepIndex(7); // RCA
    } else if (incident.proposed_action?.approval_status === 'APPROVED') {
      setActiveStepIndex(6); // Mock Execution
    } else {
      setActiveStepIndex(5); // Human Approval
    }
  }, [incident.status, incident.proposed_action?.approval_status]);

  // Trigger Simulate P1 Incident
  const handleSimulateIncident = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/demo/simulate-incident', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setActiveStepIndex(5);
        await fetchState();
      } else {
        // Fallback local reset
        setIncident({
          ...INITIAL_CHECKOUT_INCIDENT,
          status: 'AWAITING_APPROVAL',
          proposed_action: {
            ...INITIAL_CHECKOUT_INCIDENT.proposed_action!,
            approval_status: 'PENDING',
            execution_status: 'NOT_EXECUTED',
          },
        });
      }
    } catch (e) {
      setIncident({
        ...INITIAL_CHECKOUT_INCIDENT,
        status: 'AWAITING_APPROVAL',
        proposed_action: {
          ...INITIAL_CHECKOUT_INCIDENT.proposed_action!,
          approval_status: 'PENDING',
          execution_status: 'NOT_EXECUTED',
        },
      });
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  // Trigger Test Dangerous Action (CRITICAL SAFETY DEMO)
  const handleTestDangerousAction = async () => {
    setIsEvaluatingDangerous(true);
    try {
      const res = await fetch('/api/demo/dangerous-action', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDangerousResult(data);
        setIsDangerousModalOpen(true);
        await fetchState();
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Local fallback for safety modal
      setDangerousResult({
        proposal: { action: 'DROP_DATABASE', target: 'checkout_prod', risk: 'DESTRUCTIVE' },
        governance_result: {
          decision: 'BLOCKED',
          reason: 'Destructive production database operation is not permitted by autonomous agents.',
          policy_checks: [
            { rule: 'RULE-001: Approved Runbook Allowlist', status: 'FAIL (Action not in approved runbooks)' },
            { rule: 'RULE-003: Destructive Action Containment', status: 'FAIL (Classified as DESTRUCTIVE)' },
            { rule: 'RULE-005: Production Database Zero-Tolerance', status: 'FAIL (Permanent Zero-Tolerance Block)' },
            { rule: 'RULE-009: Deterministic Sandbox Execution', status: 'ENFORCED (Execution blocked)' },
          ],
        },
      });
      setIsDangerousModalOpen(true);
    } finally {
      setIsEvaluatingDangerous(false);
    }
  };

  // Reset demo
  const handleReset = async () => {
    await handleSimulateIncident();
  };

  // Approve action (HITL)
  const handleApproveAction = async (actionId: string) => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/actions/${actionId}/approve`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setActiveStepIndex(7);
        await fetchState();
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Local fallback
      const updated: Incident = {
        ...incident,
        status: 'RESOLVED',
        proposed_action: {
          ...incident.proposed_action!,
          approval_status: 'APPROVED',
          execution_status: 'COMPLETED',
          executed_at: new Date().toISOString(),
          approved_by: 'SRE Lead (Lead Operator)',
        },
        timeline: [
          ...incident.timeline,
          { time: '18:06:00Z', event: 'Human approval granted by SRE Lead (Lead Operator)', actor: 'Human Operator', badge: 'APPROVED' },
          { time: '18:06:45Z', event: 'Mock rollback executed: v2.8.1 -> v2.8.0. Memory returned to 71.2%, Latency to 620ms', actor: 'Mock Executor', badge: 'EXECUTED' },
          { time: '18:07:30Z', event: 'Incident marked RESOLVED. All health checks nominal.', actor: 'SentinelOps Orchestrator', badge: 'RESOLVED' },
          { time: '18:08:00Z', event: 'Blameless RCA postmortem generated with 3 prevention items', actor: 'RCA Agent', badge: 'RCA' },
        ],
        telemetry: [
          ...incident.telemetry,
          { timestamp: '18:07', memory_pct: 83.5, latency_ms: 2100, error_rate_pct: 7.1, stage: 'Rollback In Progress' },
          { timestamp: '18:08', memory_pct: 74.0, latency_ms: 890, error_rate_pct: 2.4, stage: 'Stabilizing' },
          { timestamp: '18:10', memory_pct: 71.2, latency_ms: 620, error_rate_pct: 1.2, stage: 'Resolved & Baseline' },
        ],
        rca: {
          rca_id: `RCA-${incident.incident_id}`,
          incident_id: incident.incident_id,
          title: `Blameless Postmortem: ${incident.summary}`,
          generated_at: new Date().toISOString(),
          severity: incident.severity,
          impact:
            'During the 6-minute degradation window, approximately 18.4% of checkout transactions failed with HTTP 500 errors. Approximately 240 customer checkout operations experienced timeouts before governed rollback restored nominal latency.',
          detection:
            'Prometheus alert ContainerMemoryUtilizationHigh (>90%) fired at 18:01:12Z, correlated with Http5xxRateElevated by SentinelOps Triage Agent within 18 seconds.',
          timeline: incident.timeline,
          root_cause:
            'Unbounded memory growth in transaction deduplication cache introduced in deployment v2.8.1 causing severe JVM garbage collection pauses, container terminations with exit 137 (OOMKilled), and cascading 5xx HTTP errors.',
          contributing_factors: [
            'SessionCache in release v2.8.1 lacked maximum capacity bounds or LRU TTL eviction policies.',
            'Canary deployment period of 5 minutes was shorter than cache fill velocity under normal checkout traffic.',
            'JVM heap ceiling was breached before CPU-based Horizontal Pod Autoscaler (HPA) could trigger pod replication.',
          ],
          remediation:
            'Rollback from checkout-api v2.8.1 to v2.8.0 was executed with explicit human authorization, instantaneously reducing memory utilization to 71.2% and P99 latency to 620ms.',
          prevention: [
            'Mandatory heap allocation profiling in pre-merge CI/CD pipeline under 1-hour simulated soak tests.',
            'Add Prometheus rate-of-change alerting for memory consumption slope (deriv(container_memory[5m]) > 0.05).',
            'Automated SentinelOps canary gate evaluation before 100% production traffic promotion.',
          ],
          action_items: [
            { id: 'ACT-001', task: 'Add memory leak regression tests and JVM heap profiling in pre-merge CI pipeline', owner_team: 'Checkout Engineering', priority: 'P1', status: 'OPEN' },
            { id: 'ACT-002', task: 'Implement canary deployment analysis with automatic rollback on >15% memory slope', owner_team: 'SRE / Platform Infrastructure', priority: 'P1', status: 'IN_PROGRESS' },
            { id: 'ACT-003', task: 'Audit bounded cache eviction policies across all in-memory microservice stores', owner_team: 'Core Services Architecture', priority: 'P2', status: 'OPEN' },
          ],
          blameless_statement:
            'This postmortem is conducted under blameless review principles. Failures are systemic opportunities to improve design, monitoring, and verification safeguards. No individual fault is assigned.',
          agent: 'rca_agent',
          model: 'lyzr-agent-v1',
        },
      };
      setIncident(updated);
      setActiveStepIndex(7);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject action
  const handleRejectAction = async (actionId: string) => {
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/actions/${actionId}/reject`, { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (e) {
      setIncident({
        ...incident,
        status: 'REQUIRES_HUMAN',
        proposed_action: {
          ...incident.proposed_action!,
          approval_status: 'REJECTED',
        },
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeIncidentsCount={incident.status !== 'RESOLVED' ? 1 : 0}
        alertsCount={alerts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          systemStatus={incident.status === 'RESOLVED' ? 'OPERATIONAL' : 'DEGRADED'}
          onSimulateIncident={handleSimulateIncident}
          onTestDangerousAction={handleTestDangerousAction}
          onReset={handleReset}
          isSimulating={isSimulating}
          isEvaluatingDangerous={isEvaluatingDangerous}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Stat Cards */}
            <StatsCards incident={incident} alertsCount={alerts.length} />

            {/* Workflow Progress Stepper (always visible on Console) */}
            {currentTab === 'dashboard' && (
              <WorkflowStepper
                incident={incident}
                activeStepIndex={activeStepIndex}
                onStepClick={(idx) => setActiveStepIndex(idx)}
              />
            )}

            {/* View Switcher */}
            {currentTab === 'dashboard' && (
              <IncidentDetailView
                incident={incident}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
                isApproving={isApproving}
                isRejecting={isRejecting}
              />
            )}

            {currentTab === 'alerts' && <AlertsView alerts={alerts} />}

            {currentTab === 'agents' && <AgentsView />}

            {currentTab === 'runbooks' && <RunbooksView />}

            {currentTab === 'governance' && <GovernanceView />}

            {currentTab === 'audit' && <AuditTrailView auditEvents={auditEvents} />}

            {currentTab === 'rca' && (
              <RCAListView incident={incident} onViewIncident={() => setCurrentTab('dashboard')} />
            )}
          </div>
        </main>
      </div>

      {/* Critical Dangerous Action Safety Modal */}
      <DangerousActionModal
        isOpen={isDangerousModalOpen}
        onClose={() => setIsDangerousModalOpen(false)}
        result={dangerousResult}
      />
    </div>
  );
}

export default App;
