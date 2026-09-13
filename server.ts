import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory simulation state
interface IncidentState {
  incident_id: string;
  title: string;
  severity: string;
  affected_services: string[];
  correlated_alerts: string[];
  status: string;
  summary: string;
  confidence: number;
  created_at: string;
  updated_at: string;
  root_cause: string;
  recommended_runbook: string;
  evidence: any[];
  hypotheses: any[];
  proposed_action: any;
  rca?: any;
  timeline: any[];
  telemetry: any[];
  recovery_metrics: any;
}

let alertsStore: any[] = [
  {
    alert_id: 'ALT-001',
    service: 'checkout-api',
    alert_name: 'ContainerMemoryUtilizationHigh',
    severity: 'critical',
    metric: 'container_memory_working_set_bytes',
    threshold: '90%',
    current_value: '94.2%',
    environment: 'production',
    timestamp: '18:01:12Z',
    labels: { cluster: 'prod-useast-01', namespace: 'ecommerce', pod: 'checkout-api-7b49f-x9c1a' },
  },
  {
    alert_id: 'ALT-002',
    service: 'checkout-api',
    alert_name: 'ContainerMemoryUtilizationHigh',
    severity: 'critical',
    metric: 'container_memory_working_set_bytes',
    threshold: '90%',
    current_value: '93.8%',
    environment: 'production',
    timestamp: '18:01:25Z',
    labels: { cluster: 'prod-useast-01', namespace: 'ecommerce', pod: 'checkout-api-7b49f-m2b8z' },
  },
  {
    alert_id: 'ALT-004',
    service: 'checkout-api',
    alert_name: 'Http5xxRateElevated',
    severity: 'critical',
    metric: "http_requests_total{status=~'5..'}",
    threshold: '5.0%',
    current_value: '18.4%',
    environment: 'production',
    timestamp: '18:01:30Z',
    labels: { endpoint: '/api/v1/checkout/process', status_code: '500' },
  },
  {
    alert_id: 'ALT-007',
    service: 'checkout-api',
    alert_name: 'HttpLatencyP99Exceeded',
    severity: 'warning',
    metric: "http_request_duration_seconds{quantile='0.99'}",
    threshold: '2.0s',
    current_value: '4.82s',
    environment: 'production',
    timestamp: '18:01:45Z',
    labels: { route: '/checkout' },
  },
  {
    alert_id: 'ALT-009',
    service: 'checkout-api',
    alert_name: 'KubePodCrashLooping',
    severity: 'critical',
    metric: 'kube_pod_container_status_restarts_total',
    threshold: '3 restarts / 10m',
    current_value: '8 restarts',
    environment: 'production',
    timestamp: '18:02:00Z',
    labels: { exit_code: '137 (OOMKilled)' },
  },
];

let incidentsStore: Record<string, IncidentState> = {
  'INC-001': {
    incident_id: 'INC-001',
    title: 'Checkout API High Latency & 5xx Spikes',
    severity: 'P1',
    affected_services: ['checkout-api'],
    correlated_alerts: ['ALT-001', 'ALT-002', 'ALT-004', 'ALT-007', 'ALT-009'],
    status: 'AWAITING_APPROVAL',
    summary:
      'Production P1 Outage: checkout-api experiencing concurrent memory exhaustion (>94%), elevated 5xx error cascade (18.4%), and pod crash-looping following release v2.8.1 rollout.',
    confidence: 0.94,
    created_at: '2026-09-13T18:01:12Z',
    updated_at: '2026-09-13T18:05:15Z',
    root_cause:
      'Memory leak introduced in checkout-api v2.8.1 transaction deduplication cache, causing catastrophic JVM garbage collection pauses, worker thread starvation, and OOMKilled container terminations.',
    recommended_runbook: 'ROLLBACK_DEPLOYMENT',
    evidence: [
      {
        id: 'METRIC-001',
        source: 'prometheus_cluster_prod',
        title: 'Container Memory & Latency Escalation',
        finding:
          'Memory escalated from 62% -> 71% -> 82% -> 94.2%. P99 latency degraded from 480ms to 4.82s. 5xx rate peaked at 18.4%.',
        timestamp: '18:01:12Z',
        verified: true,
      },
      {
        id: 'LOG-021',
        source: 'application_logs',
        title: 'Heap Allocation Failure & OutOfMemoryError',
        finding:
          'Repeated OutOfMemoryError: Java heap space at com.sentinel.checkout.cache.SessionCache.put; GC overhead limit exceeded.',
        timestamp: '18:00:44Z',
        verified: true,
      },
      {
        id: 'DEPLOY-009',
        source: 'argocd_audit_trail',
        title: 'Production Release v2.8.1 Rollout',
        finding:
          'Deployment v2.8.1 completed at 17:55:00Z (6 mins before degradation). Changelog: feat(cache): introduce in-memory transaction deduplication buffer.',
        timestamp: '17:55:00Z',
        verified: true,
      },
      {
        id: 'TRACE-017',
        source: 'opentelemetry_collector',
        title: 'GC Freeze Dominating Span Latency',
        finding:
          'Distributed trace tr-89b1c shows a 4,650ms allocation freeze inside checkout-api during cache_transaction_session span.',
        timestamp: '18:01:30Z',
        verified: true,
      },
    ],
    hypotheses: [
      {
        hypothesis: 'Memory leak in checkout-api release v2.8.1 (in-memory transaction buffer)',
        probability: 0.94,
        status: 'CONFIRMED_PRIMARY',
        supporting_evidence: ['METRIC-001', 'LOG-021', 'DEPLOY-009', 'TRACE-017'],
      },
      {
        hypothesis: 'External upstream payment gateway timeout causing socket backlog',
        probability: 0.04,
        status: 'DISPROVED',
        supporting_evidence: ['TRACE-017 indicates error occurred prior to external gateway dispatch'],
      },
      {
        hypothesis: 'Sudden traffic volume spike exceeding provisioned capacity',
        probability: 0.02,
        status: 'DISPROVED',
        supporting_evidence: ['RPS telemetry remained steady at normal baseline 1,200 req/s'],
      },
    ],
    proposed_action: {
      id: 'ACT-77189A',
      incident_id: 'INC-001',
      action: 'ROLLBACK_DEPLOYMENT',
      target: 'checkout-api',
      from_version: 'v2.8.1',
      to_version: 'v2.8.0',
      risk: 'HIGH_RISK',
      environment: 'production',
      reason:
        'Immediate rollback from degraded release v2.8.1 to stable baseline release v2.8.0 to eliminate memory leak in transaction cache.',
      requires_human_approval: true,
      governance_result: {
        decision: 'REQUIRES_APPROVAL',
        risk: 'HIGH_RISK',
        reason:
          "Action 'ROLLBACK_DEPLOYMENT' is classified as HIGH_RISK against target 'checkout-api' in 'production'. Mandatory human authorization required by Rule 4.",
        requires_human_approval: true,
        evaluated_rules: [
          'RULE-001: Action existence and allowlist check',
          'RULE-002: Shell injection & arbitrary command prevention',
          'RULE-008: Approved operational runbook verification',
          'RULE-007: Mandatory empirical evidence verification',
          'RULE-006: Diagnostic confidence barrier (0.94 >= 0.90)',
          'RULE-004: Production tier high-risk operations require Human-in-the-Loop approval',
        ],
        safe_ai_status: 'PASS_AWAITING_HITL',
      },
      approval_status: 'PENDING',
      execution_status: 'NOT_EXECUTED',
      parameters: {
        from_version: 'v2.8.1',
        to_version: 'v2.8.0',
        strategy: 'rolling-revert',
      },
    },
    timeline: [
      { time: '18:01:12Z', event: 'Alert received: ContainerMemoryUtilizationHigh (94.2%)', actor: 'Prometheus', badge: 'ALERT' },
      { time: '18:01:30Z', event: 'Triage completed: Correlated 5 alerts across checkout-api; declared P1 Outage', actor: 'Triage Agent', badge: 'TRIAGE' },
      { time: '18:02:15Z', event: 'Alerts correlated: Memory spike + 5xx cascade + crash looping linked', actor: 'Triage Agent', badge: 'CORRELATE' },
      { time: '18:03:00Z', event: 'Diagnostic started: Fetched METRIC-001, LOG-021, DEPLOY-009, TRACE-017', actor: 'Diagnostic Agent', badge: 'EVIDENCE' },
      { time: '18:04:15Z', event: 'Root cause identified: Transaction cache leak in release v2.8.1 (Confidence 94%)', actor: 'Diagnostic Agent', badge: 'DIAGNOSED' },
      { time: '18:05:00Z', event: 'Remediation proposed: ROLLBACK_DEPLOYMENT v2.8.1 -> v2.8.0', actor: 'Remediation Agent', badge: 'PROPOSED' },
      { time: '18:05:15Z', event: 'Governance check: Cleared Safe AI; gated behind SRE authorization (Rule 4)', actor: 'Policy Engine', badge: 'GOVERNANCE' },
    ],
    telemetry: [
      { timestamp: '17:50', memory_pct: 62.1, latency_ms: 480, error_rate_pct: 0.8, stage: 'Nominal Baseline' },
      { timestamp: '17:55', memory_pct: 71.4, latency_ms: 1200, error_rate_pct: 3.4, stage: 'Deploy v2.8.1' },
      { timestamp: '18:00', memory_pct: 82.0, latency_ms: 2800, error_rate_pct: 8.7, stage: 'GC Overhead Warning' },
      { timestamp: '18:05', memory_pct: 94.2, latency_ms: 4820, error_rate_pct: 18.4, stage: 'OOM Outage Peak' },
    ],
    recovery_metrics: {
      before: {
        memory_pct: 94.2,
        latency_s: 4.82,
        error_rate_pct: 18.4,
        restarts: 8,
      },
      after: {
        memory_pct: 71.2,
        latency_ms: 620,
        error_rate_pct: 1.2,
        restarts: 0,
      },
    },
  },
};

let auditEventsStore: any[] = [
  {
    event_id: 'AUD-001',
    timestamp: '2026-09-13T18:01:15Z',
    incident_id: 'INC-001',
    actor: 'triage_agent',
    event_type: 'ALERT_INGESTED_AND_CORRELATED',
    input_reference: 'ALT-001, ALT-002, ALT-004, ALT-007, ALT-009',
    decision: 'Correlated 5 signals. Assigned P1 severity to checkout-api outage.',
    confidence: 0.96,
    policy_result: 'PASS',
    details: { affected_services: ['checkout-api'], deduplicated_count: 5 },
  },
  {
    event_id: 'AUD-002',
    timestamp: '2026-09-13T18:03:00Z',
    incident_id: 'INC-001',
    actor: 'diagnostic_agent',
    event_type: 'EVIDENCE_FETCHED',
    input_reference: 'Prometheus, Elasticsearch, ArgoCD, OpenTelemetry',
    decision: 'Retrieved and verified METRIC-001, LOG-021, DEPLOY-009, TRACE-017 evidence objects.',
    confidence: 1.0,
    policy_result: 'PASS',
    details: { verified_evidence_count: 4 },
  },
  {
    event_id: 'AUD-003',
    timestamp: '2026-09-13T18:04:15Z',
    incident_id: 'INC-001',
    actor: 'diagnostic_agent',
    event_type: 'ROOT_CAUSE_IDENTIFIED',
    input_reference: 'LOG-021 (SessionCache.put OOM), DEPLOY-009 (v2.8.1 rollout)',
    decision: 'Confirmed root cause: Unbounded transaction cache memory leak introduced in v2.8.1.',
    confidence: 0.94,
    policy_result: 'PASS',
    details: { primary_hypothesis: 'v2.8.1 Memory Leak', probability: 0.94 },
  },
  {
    event_id: 'AUD-004',
    timestamp: '2026-09-13T18:05:00Z',
    incident_id: 'INC-001',
    actor: 'remediation_agent',
    event_type: 'RUNBOOK_PROPOSED',
    input_reference: 'Diagnosis INC-001',
    decision: 'Selected runbook ROLLBACK_DEPLOYMENT (target: checkout-api, v2.8.1 -> v2.8.0).',
    confidence: 0.95,
    policy_result: 'PASS',
    details: { runbook: 'ROLLBACK_DEPLOYMENT', risk: 'HIGH_RISK' },
  },
  {
    event_id: 'AUD-005',
    timestamp: '2026-09-13T18:05:15Z',
    incident_id: 'INC-001',
    actor: 'policy_engine',
    event_type: 'GOVERNANCE_EVALUATED',
    input_reference: 'Action ACT-77189A',
    decision: 'Policy Decision: REQUIRES_APPROVAL. Production + HIGH_RISK gated behind Human Approval (Rule 4).',
    confidence: 1.0,
    policy_result: 'PASS_AWAITING_HITL',
    details: { rule_applied: 'RULE-004', safe_ai_status: 'PASS_AWAITING_HITL' },
  },
  {
    event_id: 'AUD-006',
    timestamp: '2026-09-13T18:05:20Z',
    incident_id: 'INC-001',
    actor: 'hitl_controller',
    event_type: 'HUMAN_APPROVAL_REQUESTED',
    input_reference: 'Request HITL-89A12',
    decision: 'Dispatched notification to on-call SRE lead. Awaiting authorization.',
    confidence: 1.0,
    policy_result: 'PASS_AWAITING_HITL',
  },
];

// Helper to log audit events
function addAuditEvent(
  incident_id: string,
  actor: string,
  event_type: string,
  decision: string,
  confidence: number = 1.0,
  policy_result: string = 'PASS',
  input_ref: string = '',
  details: any = {}
) {
  const event = {
    event_id: `AUD-${String(auditEventsStore.length + 1).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    incident_id,
    actor,
    event_type,
    input_reference: input_ref,
    decision,
    confidence,
    policy_result,
    details,
  };
  auditEventsStore.unshift(event);
  return event;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SentinelOps AI',
    simulation_mode: true,
    version: '1.0.0',
    agents_ready: ['triage_agent', 'diagnostic_agent', 'remediation_agent', 'rca_agent'],
    governance_engine: 'online',
  });
});

// Ingest alerts
app.post('/api/alerts', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [req.body];
  for (const a of incoming) {
    alertsStore.unshift(a);
  }
  res.json({
    success: true,
    count: incoming.length,
    message: `Ingested ${incoming.length} alerts into SentinelOps queue.`,
  });
});

// List all incidents
app.get('/api/incidents', (req, res) => {
  res.json({
    incidents: Object.values(incidentsStore),
    total: Object.keys(incidentsStore).length,
  });
});

// Get single incident
app.get('/api/incidents/:id', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(inc);
});

// Trigger triage
app.post('/api/incidents/:id/triage', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  inc.status = 'TRIAGED';
  inc.updated_at = new Date().toISOString();
  addAuditEvent(inc.incident_id, 'triage_agent', 'TRIAGE_RE_EVALUATED', 'Alert correlation re-calculated; P1 severity confirmed.');
  res.json(inc);
});

// Trigger diagnose
app.post('/api/incidents/:id/diagnose', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  inc.status = 'DIAGNOSED';
  inc.updated_at = new Date().toISOString();
  addAuditEvent(inc.incident_id, 'diagnostic_agent', 'DIAGNOSIS_VERIFIED', 'Diagnostic hypotheses re-validated against LOG-021 & DEPLOY-009.');
  res.json(inc);
});

// Propose remediation
app.post('/api/incidents/:id/remediation', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  inc.status = 'AWAITING_APPROVAL';
  inc.updated_at = new Date().toISOString();
  res.json(inc.proposed_action);
});

// Approve remediation action (HITL)
app.post('/api/actions/:id/approve', (req, res) => {
  const actionId = req.params.id;
  const inc = Object.values(incidentsStore).find((i) => i.proposed_action?.id === actionId);
  if (!inc || !inc.proposed_action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  // Update action & incident state
  inc.proposed_action.approval_status = 'APPROVED';
  inc.proposed_action.execution_status = 'COMPLETED';
  inc.proposed_action.executed_at = new Date().toISOString();
  inc.proposed_action.approved_by = 'SRE Lead (Lead Operator)';
  inc.status = 'RESOLVED';
  inc.updated_at = new Date().toISOString();

  // Add timeline steps
  inc.timeline.push(
    { time: '18:06:00Z', event: 'Human approval granted by SRE Lead (Lead Operator)', actor: 'Human Operator', badge: 'APPROVED' },
    { time: '18:06:45Z', event: 'Mock rollback executed: v2.8.1 -> v2.8.0. Memory returned to 71.2%, Latency to 620ms', actor: 'Mock Executor', badge: 'EXECUTED' },
    { time: '18:07:30Z', event: 'Incident marked RESOLVED. All health checks nominal.', actor: 'SentinelOps Orchestrator', badge: 'RESOLVED' },
    { time: '18:08:00Z', event: 'Blameless RCA postmortem generated with 3 prevention items', actor: 'RCA Agent', badge: 'RCA' }
  );

  // Extend telemetry with recovery data
  inc.telemetry.push(
    { timestamp: '18:07', memory_pct: 83.5, latency_ms: 2100, error_rate_pct: 7.1, stage: 'Rollback In Progress' },
    { timestamp: '18:08', memory_pct: 74.0, latency_ms: 890, error_rate_pct: 2.4, stage: 'Stabilizing' },
    { timestamp: '18:10', memory_pct: 71.2, latency_ms: 620, error_rate_pct: 1.2, stage: 'Resolved & Baseline' }
  );

  // Generate Blameless RCA
  inc.rca = {
    rca_id: `RCA-${inc.incident_id}`,
    incident_id: inc.incident_id,
    title: `Blameless Postmortem: ${inc.summary}`,
    generated_at: new Date().toISOString(),
    severity: inc.severity,
    impact:
      'During the 6-minute degradation window, approximately 18.4% of checkout transactions failed with HTTP 500 errors. Approximately 240 customer checkout operations experienced timeouts before governed rollback restored nominal latency.',
    detection:
      'Prometheus alert ContainerMemoryUtilizationHigh (>90%) fired at 18:01:12Z, correlated with Http5xxRateElevated by SentinelOps Triage Agent within 18 seconds.',
    timeline: inc.timeline,
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
  };

  addAuditEvent(inc.incident_id, 'human_operator', 'HUMAN_APPROVED', 'SRE Operator authorized ROLLBACK_DEPLOYMENT to v2.8.0');
  addAuditEvent(inc.incident_id, 'mock_executor', 'EXECUTION_COMPLETED', 'Simulated rollback completed. Telemetry returned to nominal thresholds.');
  addAuditEvent(inc.incident_id, 'rca_agent', 'RCA_GENERATED', 'Blameless postmortem generated with 3 preventative action items.');

  res.json({
    success: true,
    action: inc.proposed_action,
    incident: inc,
    message: 'Rollback approved and executed safely. Incident resolved.',
  });
});

// Reject remediation action (HITL)
app.post('/api/actions/:id/reject', (req, res) => {
  const actionId = req.params.id;
  const inc = Object.values(incidentsStore).find((i) => i.proposed_action?.id === actionId);
  if (!inc || !inc.proposed_action) {
    return res.status(404).json({ error: 'Action not found' });
  }

  inc.proposed_action.approval_status = 'REJECTED';
  inc.status = 'REQUIRES_HUMAN';
  inc.updated_at = new Date().toISOString();

  inc.timeline.push({
    time: new Date().toLocaleTimeString() + 'Z',
    event: 'Remediation action rejected by SRE Operator. Escalated to on-call engineering channel.',
    actor: 'Human Operator',
    badge: 'REJECTED',
  });

  addAuditEvent(inc.incident_id, 'human_operator', 'HUMAN_REJECTED', 'Operator rejected proposal. Incident transferred to manual handling.');

  res.json({
    success: true,
    action: inc.proposed_action,
    message: 'Action rejected. Incident remains in manual escalation.',
  });
});

// Get incident timeline
app.get('/api/incidents/:id/timeline', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  res.json({ timeline: inc.timeline });
});

// Get incident audit trail
app.get('/api/incidents/:id/audit', (req, res) => {
  const events = auditEventsStore.filter((e) => e.incident_id === req.params.id);
  res.json({ audit_events: events });
});

// Global audit trail
app.get('/api/audit', (req, res) => {
  const { incident_id } = req.query;
  if (incident_id) {
    return res.json({ audit_events: auditEventsStore.filter((e) => e.incident_id === incident_id) });
  }
  res.json({ audit_events: auditEventsStore });
});

// Get RCA report
app.get('/api/incidents/:id/rca', (req, res) => {
  const inc = incidentsStore[req.params.id];
  if (!inc || !inc.rca) {
    return res.status(404).json({ error: 'RCA not generated yet. Incident must be resolved first.' });
  }
  res.json(inc.rca);
});

// CRITICAL SAFETY DEMO ENDPOINT: Dangerous Action
app.post('/api/demo/dangerous-action', (req, res) => {
  const dangerousProposal = {
    action: 'DROP_DATABASE',
    target: 'checkout_prod',
    environment: 'PRODUCTION',
    risk: 'DESTRUCTIVE',
    reason: 'Purge all tables in checkout_prod to clear suspected cache state.',
    proposed_by: 'simulated_rogue_agent',
  };

  const governanceDecision = {
    decision: 'BLOCKED',
    risk: 'DESTRUCTIVE',
    environment: 'PRODUCTION',
    target: 'checkout_prod',
    action: 'DROP_DATABASE',
    human_approval: 'REQUIRED',
    reason: 'Destructive production database operation is not permitted by autonomous agents.',
    executed: false,
    policy_checks: [
      { rule: 'RULE-001: Approved Runbook Allowlist', status: 'FAIL (Action not in approved runbook catalog)' },
      { rule: 'RULE-003: Destructive Action Containment', status: 'FAIL (Action classified as DESTRUCTIVE)' },
      { rule: 'RULE-005: Production Database Zero-Tolerance', status: 'FAIL (Permanent Zero-Tolerance Block on Production DB)' },
      { rule: 'RULE-009: Deterministic Sandbox Execution', status: 'ENFORCED (Execution completely blocked)' },
    ],
    safe_ai_status: 'BLOCK',
    timestamp: new Date().toISOString(),
  };

  addAuditEvent(
    'INC-SECURITY-PROBE',
    'policy_engine',
    'ACTION_BLOCKED',
    'Deterministic block of DROP_DATABASE against checkout_prod. Zero execution occurred.',
    1.0,
    'BLOCK',
    'Dangerous Action Simulation',
    governanceDecision
  );

  res.json({
    proposal: dangerousProposal,
    governance_result: governanceDecision,
    message: 'CRITICAL SAFETY GUARD ACTIVE: Destructive action successfully BLOCKED. Nothing was executed.',
  });
});

// SIMULATE P1 INCIDENT ENDPOINT
app.post('/api/demo/simulate-incident', (req, res) => {
  // Reset incident to active degradation state
  incidentsStore['INC-001'].status = 'AWAITING_APPROVAL';
  incidentsStore['INC-001'].proposed_action.approval_status = 'PENDING';
  incidentsStore['INC-001'].proposed_action.execution_status = 'NOT_EXECUTED';
  incidentsStore['INC-001'].telemetry = [
    { timestamp: '17:50', memory_pct: 62.1, latency_ms: 480, error_rate_pct: 0.8, stage: 'Nominal Baseline' },
    { timestamp: '17:55', memory_pct: 71.4, latency_ms: 1200, error_rate_pct: 3.4, stage: 'Deploy v2.8.1' },
    { timestamp: '18:00', memory_pct: 82.0, latency_ms: 2800, error_rate_pct: 8.7, stage: 'GC Overhead Warning' },
    { timestamp: '18:05', memory_pct: 94.2, latency_ms: 4820, error_rate_pct: 18.4, stage: 'OOM Outage Peak' },
  ];
  delete incidentsStore['INC-001'].rca;

  addAuditEvent('INC-001', 'orchestrator', 'INCIDENT_SIMULATION_TRIGGERED', 'Simulated Checkout API P1 outage re-triggered.');

  res.json({
    success: true,
    incident: incidentsStore['INC-001'],
    message: 'Simulated P1 incident activated. Ingestion -> Triage -> Diagnosis completed.',
  });
});

// Reset demo state
app.post('/api/demo/reset', (req, res) => {
  res.json({ success: true, message: 'Simulation state reset.' });
});

// Runbook catalog
app.get('/api/runbooks', (req, res) => {
  res.json({
    runbooks: [
      { id: 'RB-01', name: 'GET_LOGS', risk: 'READ_ONLY', description: 'Fetch structured logs without state modification' },
      { id: 'RB-02', name: 'GET_METRICS', risk: 'READ_ONLY', description: 'Query Prometheus TSDB telemetry metrics' },
      { id: 'RB-03', name: 'CLEAR_CACHE', risk: 'LOW_RISK', description: 'Flush and warm local key-value cache partitions' },
      { id: 'RB-04', name: 'RESTART_POD', risk: 'MEDIUM_RISK', description: 'Rolling pod restart to clear ephemeral memory leak' },
      { id: 'RB-05', name: 'SCALE_SERVICE', risk: 'MEDIUM_RISK', description: 'Increase replica count to distribute load' },
      { id: 'RB-06', name: 'ROLLBACK_DEPLOYMENT', risk: 'HIGH_RISK', description: 'Revert container image version in production' },
    ],
  });
});

// ---------------- VITE & STATIC MIDDLEWARE ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SentinelOps AI Server running on port ${PORT}`);
  });
}

startServer();
