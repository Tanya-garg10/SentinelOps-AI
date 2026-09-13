# SentinelOps AI

**SentinelOps AI** is a governed multi-agent SRE system for enterprise cloud incident triage and runbook remediation. It investigates cloud infrastructure incidents, diagnoses evidence-backed root causes, proposes safe runbook remediation, blocks destructive operations behind deterministic policy governance and human approval, and generates auditable postmortems.

## Features

- **Autonomous Alert Triage**: Correlates alerts and determines P1–P4 severity in seconds
- **Evidence-Backed Diagnosis**: Synthesizes logs, metrics, traces, and deployment history
- **Constrained Remediation**: Proposes runbooks exclusively from approved catalog
- **Deterministic Governance**: Policy engine outside LLM to classify risk and enforce Human-in-the-Loop gates
- **Safe Execution**: Simulates remediation and captures before-and-after telemetry
- **Audit Trail**: Complete decision log for accountability

## Architecture

```
Alerts → Triage Agent → Diagnostic Agent → Remediation Agent → Governance Engine → HITL/Block → Mock Executor → RCA Agent → Audit Trail
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Python 3.10, FastAPI, Pydantic, Express
- **AI**: Lyzr Agent API & SDK with Safe AI governance
- **Observability**: Prometheus metrics, OpenTelemetry traces, CloudWatch logs simulator

## Project Structure

```
sentinelops/
├── src/                          # React Frontend
│   ├── components/              # React components
│   ├── data/                    # Mock data
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── sentinelops-ai/               # Python Backend
│   ├── agents/                  # Multi-agent system
│   ├── backend/                 # FastAPI application
│   │   ├── governance/          # Policy engine, HITL, action classifier
│   │   ├── routes/              # API endpoints
│   │   ├── tools/               # Mock telemetry tools
│   │   └── services/            # Business logic
│   ├── data/                    # Sample data
│   ├── tests/                   # Unit tests
│   └── requirements.txt
├── package.json
├── vite.config.ts
├── server.ts
└── README.md
```

## Setup

### Full-Stack Web Platform
```bash
# Install dependencies
npm install
cd sentinelops-ai
pip install -r requirements.txt
cd ..

# Start application
npm run dev
# Visit http://localhost:3000
```

### Python Backend Only
```bash
cd sentinelops-ai
pip install -r requirements.txt
python3 -m backend.main
```

### Docker
```bash
cd sentinelops-ai
docker-compose up --build
```

## Environment Variables

```env
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
LYZR_API_KEY="lyzr_live_demo_key"
LYZR_AGENT_ID="agent_sentinelops_sre_01"
LYZR_ENVIRONMENT_ID="env_cloud_prod_01"
DATABASE_URL="sqlite:///./sentinelops.db"
DEMO_MODE="true"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## API Endpoints

- `POST /api/alerts` - Ingest infrastructure alerts
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/{id}` - Get incident details
- `POST /api/incidents/{id}/triage` - Trigger triage analysis
- `POST /api/incidents/{id}/diagnose` - Trigger diagnostic investigation
- `POST /api/incidents/{id}/remediation` - Propose remediation action
- `POST /api/actions/{id}/approve` - Approve high-risk action
- `POST /api/actions/{id}/reject` - Reject proposed action
- `GET /api/incidents/{id}/timeline` - Get incident timeline
- `GET /api/incidents/{id}/audit` - Get audit events
- `GET /api/incidents/{id}/rca` - Get postmortem report
- `POST /api/demo/simulate-incident` - Simulate incident
- `POST /api/demo/dangerous-action` - Test dangerous action blocking

## Testing

```bash
cd sentinelops-ai
PYTHONPATH=. python3 -m unittest discover -s tests -v
```

Tests cover:
- Alert triage and correlation
- Evidence-backed root cause identification
- Remediation runbook validation
- Destructive action blocking
- Human-in-the-Loop gates
- Audit trail generation

## Safety Features

- **Deterministic Policy Engine**: 10 SRE rules enforced outside LLM
- **Destructive Action Blocking**: Zero-tolerance for dangerous operations
- **Human-in-the-Loop**: Required for high-risk production changes
- **Evidence Grounding**: All decisions backed by telemetry evidence
- **Audit Trail**: Complete immutable decision log
