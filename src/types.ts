export type Severity = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'DIAGNOSING'
  | 'DIAGNOSED'
  | 'REMEDIATION_PROPOSED'
  | 'AWAITING_APPROVAL'
  | 'REMEDIATING'
  | 'RESOLVED'
  | 'REQUIRES_HUMAN'
  | 'BLOCKED';

export type RiskLevel =
  | 'READ_ONLY'
  | 'LOW_RISK'
  | 'MEDIUM_RISK'
  | 'HIGH_RISK'
  | 'DESTRUCTIVE'
  | 'UNKNOWN';

export interface AlertItem {
  alert_id: string;
  service: string;
  alert_name: string;
  severity: 'critical' | 'warning' | 'info';
  metric?: string;
  threshold?: string;
  current_value?: string;
  environment: string;
  timestamp: string;
  labels: Record<string, string>;
}

export interface EvidenceItem {
  id: string;
  source: string;
  title: string;
  finding: string;
  timestamp?: string;
  verified: boolean;
  metadata?: Record<string, any>;
}

export interface Hypothesis {
  hypothesis: string;
  probability: number;
  status: 'CONFIRMED_PRIMARY' | 'DISPROVED' | 'UNDER_INVESTIGATION';
  supporting_evidence?: string[];
}

export interface GovernanceResult {
  decision: 'APPROVED' | 'REQUIRES_APPROVAL' | 'BLOCKED' | 'REQUIRES_HUMAN';
  risk: RiskLevel;
  reason: string;
  requires_human_approval: boolean;
  evaluated_rules: string[];
  safe_ai_status: 'PASS' | 'PASS_AWAITING_HITL' | 'BLOCK' | 'FLAG_LOW_CONFIDENCE' | 'FLAG_EVIDENCE_ABSENT';
}

export interface RemediationAction {
  id: string;
  incident_id: string;
  action: string;
  target: string;
  from_version?: string;
  to_version?: string;
  risk: RiskLevel;
  environment: string;
  reason: string;
  requires_human_approval: boolean;
  governance_result?: GovernanceResult;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  execution_status: 'NOT_EXECUTED' | 'EXECUTING' | 'COMPLETED' | 'BLOCKED' | 'FAILED';
  executed_at?: string;
  approved_by?: string;
  parameters?: Record<string, any>;
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  incident_id: string;
  actor:
    | 'triage_agent'
    | 'diagnostic_agent'
    | 'remediation_agent'
    | 'rca_agent'
    | 'policy_engine'
    | 'hitl_controller'
    | 'mock_executor'
    | 'human_operator';
  event_type: string;
  input_reference: string;
  decision: string;
  confidence: number;
  policy_result: 'PASS' | 'PASS_AWAITING_HITL' | 'BLOCK' | 'REQUIRE_HUMAN';
  details?: Record<string, any>;
}

export interface TimelineEntry {
  time: string;
  event: string;
  actor: string;
  badge?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner_team: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface RCAReport {
  rca_id: string;
  incident_id: string;
  title: string;
  generated_at: string;
  severity: Severity;
  impact: string;
  detection: string;
  timeline: TimelineEntry[];
  root_cause: string;
  contributing_factors: string[];
  remediation: string;
  prevention: string[];
  action_items: ActionItem[];
  blameless_statement: string;
  agent: string;
  model: string;
}

export interface TelemetryPoint {
  timestamp: string;
  memory_pct: number;
  latency_ms: number;
  error_rate_pct: number;
  stage: string;
}

export interface Incident {
  incident_id: string;
  title: string;
  severity: Severity;
  affected_services: string[];
  correlated_alerts: string[];
  status: IncidentStatus;
  summary: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  root_cause?: string;
  recommended_runbook?: string;
  evidence: EvidenceItem[];
  hypotheses: Hypothesis[];
  proposed_action?: RemediationAction;
  rca?: RCAReport;
  timeline: TimelineEntry[];
  telemetry: TelemetryPoint[];
  recovery_metrics?: {
    before: {
      memory_pct: number;
      latency_s: number;
      error_rate_pct: number;
      restarts: number;
    };
    after: {
      memory_pct: number;
      latency_ms: number;
      error_rate_pct: number;
      restarts: number;
    };
  };
}

export interface Runbook {
  id: string;
  name: string;
  risk: RiskLevel;
  description: string;
  target_type: string;
  requires_approval_in_prod: boolean;
  allowed_parameters: string[];
}

export interface GovernancePolicy {
  id: string;
  title: string;
  rule: string;
  severity_tier: string;
  action_on_breach: 'BLOCK' | 'REQUIRE_HITL';
  description: string;
}
