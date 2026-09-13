# SentinelOps AI

> **“Investigate incidents autonomously. Remediate safely. Prove everything.”**
>
> *“SentinelOps can investigate autonomously, but it cannot become the incident.”*

**SentinelOps AI** is a governed multi-agent SRE system designed for the **HiDevs Agent Arena PS03: “Enterprise Cloud Incident Triage & Runbook Remediation Agent”**. It investigates cloud infrastructure incidents, diagnoses evidence-backed root causes, proposes safe runbook remediation, blocks destructive operations behind deterministic policy governance and human approval, and generates auditable AIMS postmortems.

---

## 1. Project Title
**SentinelOps AI — Enterprise Cloud Incident Triage & Runbook Remediation Platform**

## 2. Problem
Modern cloud-native systems generate overwhelming alert storms during degradation events. When P1 outages strike:
- On-call SREs face cognitive overload correlating thousands of distributed telemetry signals across logs, metrics, traces, and GitOps deployments.
- Average MTTR (Mean Time to Resolution) suffers while engineers isolate the degradation trigger.
- Autonomous AI tooling without guardrails is dangerous: an unsupervised LLM executing arbitrary shell commands or database mutations risks converting a minor degradation into a catastrophic corporate outage.

## 3. Solution
SentinelOps AI delivers a **governed multi-agent operational platform**:
1. **Autonomous Ingestion & Triage**: Correlates alerts and determines P1–P4 severity in seconds.
2. **Empirical Evidence-Backed Diagnosis**: Synthesizes logs, Prometheus metrics, OpenTelemetry spans, and ArgoCD deployment history.
3. **Constrained Remediation Catalog**: Proposes runbooks exclusively from an approved operational catalog (never arbitrary shell scripts).
4. **Deterministic Governance & Safe AI Engine**: Sits strictly outside the LLM to classify risk, block unapproved actions, and enforce Human-in-the-Loop (HITL) gates.
5. **Safe Mock Execution & Recovery Verification**: Simulates remediation and captures before-and-after telemetry.
6. **AIMS Audit Trail & Blameless RCA**: Logs tamper-evident audit events and produces blameless postmortems.

## 4. Why SentinelOps
| Feature | Traditional On-Call / Bots | SentinelOps AI |
| :--- | :--- | :--- |
| **Alert Triage** | Manual paging, Slack noise | Automated deduplication, correlation & P1-P4 classification |
| **Diagnostic Grounding**| Guesswork / Grep logs | Multi-modal correlation tied to verified Evidence IDs (METRIC, LOG, TRACE, DEPLOY) |
| **Remediation Safety** | Risky bash scripts or slow manual approvals | Deterministic Policy Engine outside the LLM; strictly bounded runbook catalog |
| **Destructive Containment**| Vulnerable to accidental execution | Zero-tolerance automated blocking of `DROP_DATABASE`, `DELETE_NAMESPACE`, etc. |
| **Auditability** | Disjointed chat logs | Structured AIMS-compatible event stream (`AUD-001`...) |
| **Post-Incident Review**| Delayed manual write-ups | Automated blameless RCA postmortem generated with actionable preventative items |

## 5. Architecture
```
                                 [ Incoming Cloud Alerts ]
                                             │
                                             ▼
                                   ┌───────────────────┐
                                   │   TRIAGE AGENT    │
                                   │ (Lyzr Agent SDK)  │
                                   └─────────┬─────────┘
                                             │ P1 / P2 Severity + Correlated IDs
                                             ▼
                                   ┌───────────────────┐
                                   │ DIAGNOSTIC AGENT  │ ◄── [ Prometheus Metrics ]
                                   │ (Lyzr Agent SDK)  │ ◄── [ Application Logs ]
                                   └─────────┬─────────┘ ◄── [ OpenTelemetry Traces ]
                                             │ Evidence-backed Root Cause (LOG-021, DEPLOY-009)
                                             ▼
                                   ┌───────────────────┐
                                   │ REMEDIATION AGENT │ ── Approved Runbooks Catalog Only
                                   │ (Lyzr Agent SDK)  │    (No arbitrary shell execution)
                                   └─────────┬─────────┘
                                             │ Proposed Action: ROLLBACK_DEPLOYMENT
                                             ▼
                       ═══════════════════════════════════════════════
                               DETERMINISTIC GOVERNANCE LAYER
                       ═══════════════════════════════════════════════
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │  Action Classifier  │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │    Policy Engine    │ (10 Deterministic SRE Rules)
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │   Lyzr Safe AI      │
                                  └──────────┬──────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            [ High Risk / Low Conf ]                     [ Destructive / Prohibited ]
                        │                                         │
                        ▼                                         ▼
            ┌───────────────────────┐                    ┌───────────────────┐
            │  HITL Operator Gate   │                    │    🔴 BLOCKED     │
            │  (Approve / Reject)   │                    │ (Zero Execution)  │
            └───────────┬───────────┘                    └───────────────────┘
                        │
                        ▼ (If Approved)
            ┌───────────────────────┐
            │     Mock Executor     │ (Simulates safe rollback; restores telemetry)
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │       RCA Agent       │ (Generates blameless postmortem & action items)
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   AIMS Audit Trail    │ (Complete immutable decision log)
            └───────────────────────┘
```

## 6. Multi-Agent Workflow
1. **Triage Agent**: Ingests raw Prometheus/alertmanager alerts, deduplicates by service and namespace signature, correlates multi-metric alerts, and determines incident severity (P1-P4).
2. **Diagnostic Agent**: Queries mock tools for telemetry, logs, traces, and GitOps deployments. Formulates hypotheses, disproves competing explanations, and grounds the root cause in explicit evidence IDs (`LOG-021`, `DEPLOY-009`, `METRIC-001`, `TRACE-017`). If evidence is insufficient, flags `REQUIRES_HUMAN`.
3. **Remediation Agent**: Selects an action exclusively from the approved runbook list (`ROLLBACK_DEPLOYMENT`, `RESTART_POD`, `SCALE_SERVICE`, `CLEAR_CACHE`). Categorizes risk tier (`READ_ONLY`, `LOW_RISK`, `MEDIUM_RISK`, `HIGH_RISK`, `DESTRUCTIVE`). Never outputs arbitrary shell commands.
4. **RCA Agent**: Once recovery telemetry confirms incident resolution, generates a blameless postmortem detailing summary, impact, timeline, root cause, contributing factors, remediation, and preventative action items.

## 7. Lyzr Integration
The system integrates **Lyzr Agent API / SDK**:
- Agent configurations define role separation, temperature bounds, and structured JSON schemas in `agents/configs/agent_configs.json`.
- In live deployments with credentials, agents call the Lyzr Agent API with structured Pydantic tool schemas.
- When credentials are unavailable or `DEMO_MODE=true`, SentinelOps uses its built-in deterministic simulation engine so judges and evaluators can experience the full end-to-end flow with zero external dependencies.

## 8. Safe AI Governance
SentinelOps enforces a deterministic policy engine **outside of the LLM**. Every proposal must satisfy 10 SRE rules:
1. **Unknown action** → BLOCK
2. **Arbitrary shell command** → BLOCK
3. **Destructive action** → BLOCK or HITL
4. **Production + HIGH_RISK** → HITL (Human Approval Required)
5. **Production + DESTRUCTIVE** → BLOCK
6. **Confidence < 0.90** → HITL
7. **Missing evidence** → REQUIRES_HUMAN
8. **Action outside approved runbooks** → BLOCK
9. **Approved action** → execute only through mock executor
10. **Every decision** → logged in AIMS audit stream

## 9. Human-in-the-Loop (HITL)
High-risk production operations (e.g. rolling back a tier-1 service) cannot execute autonomously. SentinelOps freezes the remediation pipeline and prompts authorized operators with:
- Target service & proposed version transition (`v2.8.1` → `v2.8.0`)
- Supporting evidence and diagnostic confidence
- Safe AI policy verification badge
- One-click **Approve** or **Reject** controls

## 10. AIMS / Audit Architecture
Every agent invocation, decision, policy evaluation, human override, and executor output emits a structured audit record:
```json
{
  "event_id": "AUD-001",
  "timestamp": "2026-09-13T18:01:12Z",
  "incident_id": "INC-001",
  "actor": "diagnostic_agent",
  "event_type": "ROOT_CAUSE_IDENTIFIED",
  "input_reference": "LOG-021, DEPLOY-009",
  "decision": "Memory leak introduced in checkout-api v2.8.1 transaction cache",
  "confidence": 0.94,
  "policy_result": "PASS"
}
```

## 11. Demo Scenario: Checkout API Outage
- **Initial Telemetry**:
  - Memory utilization: `62%` → `71%` → `82%` → `94%`
  - Latency P99: `480ms` → `1.2s` → `2.8s` → `4.82s`
  - HTTP 5xx: `0.8%` → `3.4%` → `8.7%` → `18.4%`
  - Deployment: `v2.8.0` → `v2.8.1` at 17:55Z
- **Diagnostic Finding**: `LOG-021` (`OutOfMemoryError`) and `DEPLOY-009` confirm transaction cache leak in `v2.8.1`.
- **Governed Remediation**: Proposes `ROLLBACK_DEPLOYMENT` (`v2.8.1` → `v2.8.0`). Policy engine requires human approval.
- **Recovery Telemetry**:
  - Memory: `71.2%`
  - Latency: `620ms`
  - HTTP 5xx: `1.2%`
  - Status: `RESOLVED`

## 12. Critical Safety Demo: Dangerous Action
Clicking **“Test Dangerous Action”** tests system containment:
- Agent proposes: `DROP_DATABASE checkout_prod`
- Policy engine evaluates Rule 5 & Rule 3
- Result: **🔴 BLOCKED**
- Reason: *“Destructive production database operation is not permitted by autonomous agents.”*
- Zero execution occurs; an audit event is registered.

## 13. Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion.
- **Backend**: Python 3.10, FastAPI, Pydantic, Express / Node.js orchestration proxy.
- **AI / Multi-Agent**: Lyzr Agent API & SDK architecture, Lyzr Safe AI governance, structured JSON outputs.
- **Observability**: Prometheus metrics format, OpenTelemetry trace spans, CloudWatch logs simulator, AIMS audit trail.

## 14. Repository Structure
```
sentinelops/
├── src/                          # React Frontend
│   ├── components/              # React components
│   │   ├── AgentsView.tsx
│   │   ├── AlertsView.tsx
│   │   ├── AuditTrailView.tsx
│   │   ├── DangerousActionModal.tsx
│   │   ├── GovernanceView.tsx
│   │   ├── IncidentDetailView.tsx
│   │   ├── RCAListView.tsx
│   │   ├── RunbooksView.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatsCards.tsx
│   │   ├── TopBar.tsx
│   │   └── WorkflowStepper.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
├── sentinelops-ai/               # Python Backend
│   ├── agents/
│   │   ├── triage_agent.py
│   │   ├── diagnostic_agent.py
│   │   ├── remediation_agent.py
│   │   ├── rca_agent.py
│   │   ├── orchestrator.py
│   │   └── configs/
│   │       └── agent_configs.json
│   ├── backend/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── alerts.py
│   │   │   ├── incidents.py
│   │   │   ├── actions.py
│   │   │   └── audit.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   └── incident_service.py
│   │   ├── governance/
│   │   │   ├── policy_engine.py
│   │   │   ├── action_classifier.py
│   │   │   └── hitl.py
│   │   └── tools/
│   │       ├── mock_metrics.py
│   │       ├── mock_logs.py
│   │       ├── mock_traces.py
│   │       ├── mock_deployments.py
│   │       └── mock_executor.py
│   ├── data/
│   │   ├── alerts/
│   │   ├── logs/
│   │   ├── metrics/
│   │   ├── deployments/
│   │   └── scenarios/
│   ├── tests/
│   │   ├── test_governance.py
│   │   └── test_agents.py
│   ├── run_python_tests.py
│   ├── docker-compose.yml
│   └── requirements.txt
├── package.json                  # Node.js dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── server.ts                    # Express server
├── index.html                   # Entry HTML
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 15. Local Setup

### Running Full-Stack Web Platform (Port 3000)
```bash
# 1. Install frontend dependencies
npm install

# 2. Install Python backend dependencies
cd sentinelops-ai
pip install -r requirements.txt
cd ..

# 3. Launch full-stack platform
npm run dev
# Application accessible at http://localhost:3000
```

### Running Standalone Python Backend
```bash
cd sentinelops-ai
pip install -r requirements.txt
python3 -m backend.main
```

### Running with Docker Compose
```bash
cd sentinelops-ai
docker-compose up --build
```

## 16. Environment Variables
```env
# Optional fallback / enrichment model
GEMINI_API_KEY=""

# Application Host URL
APP_URL="http://localhost:3000"

# Lyzr Agent API & Safe AI
LYZR_API_KEY="lyzr_live_demo_key"
LYZR_AGENT_ID="agent_sentinelops_sre_01"
LYZR_ENVIRONMENT_ID="env_cloud_prod_01"

# Database & Runtime
DATABASE_URL="sqlite:///./sentinelops.db"
DEMO_MODE="true"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 17. API Documentation
- `POST /api/alerts` — Ingest raw infrastructure alerts.
- `GET /api/incidents` — List all active and historic incidents.
- `GET /api/incidents/{id}` — Get comprehensive incident state.
- `POST /api/incidents/{id}/triage` — Trigger Triage Agent correlation.
- `POST /api/incidents/{id}/diagnose` — Trigger Diagnostic Agent evidence investigation.
- `POST /api/incidents/{id}/remediation` — Propose governed runbook action.
- `POST /api/actions/{id}/approve` — Operator authorization for high-risk action.
- `POST /api/actions/{id}/reject` — Operator rejection of proposed action.
- `GET /api/incidents/{id}/timeline` — Retrieve chronological incident timeline.
- `GET /api/incidents/{id}/audit` — Retrieve AIMS audit events for incident.
- `GET /api/incidents/{id}/rca` — Retrieve blameless postmortem report.
- `POST /api/demo/simulate-incident` — Trigger P1 Checkout Outage simulation.
- `POST /api/demo/dangerous-action` — Test Governance Engine containment (`DROP_DATABASE`).

## 18. Testing
SentinelOps AI includes a comprehensive unit test suite covering 13 governance and multi-agent assertions:
```bash
# Run all tests using Python standard unittest
PYTHONPATH=sentinelops-ai python3 -m unittest discover -s sentinelops-ai/tests -v
```
Test cases verified:
- P1 Severity Classification & Multi-Alert Correlation
- Evidence-Backed Root Cause Identification
- Evidence Requirement Rejection (`REQUIRES_HUMAN`)
- Remediation Runbook Catalog Allowlist
- Arbitrary Shell Command & Token Injection Blocking
- Destructive Action Policy Containment (`DROP_DATABASE` → `BLOCKED`)
- Unknown Action Blocking
- Production + High Risk HITL Requirement
- Low-Confidence (<0.90) Gate Requirement
- Human Approval & Rejection State Transitions
- Blameless RCA Generation & Preventative Action Items

## 19. Screenshots & Visual Interface
The web interface provides an enterprise dark-mode SRE console:
- **Top Metrics Strip**: Live system status, active incident counter, P1/P2 indicators, average agent confidence.
- **Workflow Stepper**: Visual progression from Alert Ingestion → Triage → Diagnosis → Remediation → Governance → HITL → Execution → RCA.
- **Decision Dependency Graph**: Interactive causal graph linking deployment trigger to memory spike, GC pauses, latency, and checkout failure.
- **Evidence Cards Grid**: Inspect verified telemetry evidence (`METRIC-001`, `LOG-021`, `DEPLOY-009`, `TRACE-017`).
- **Telemetry Charts**: Real-time Recharts visualization showing degradation curve and post-rollback recovery.
- **AIMS Audit Log**: Live audit ledger recording every agent deliberation and policy checkpoint.

## 20. Future Scope
- Live bidirectional Kubernetes operator via CRD controllers.
- Multi-cloud federation (AWS CloudWatch, GCP Cloud Monitoring, Datadog).
- Multi-signature cryptographic approval consensus for mission-critical core database migrations.
- Continuous blameless postmortem indexing with semantic vector search for historical similarity analysis.
