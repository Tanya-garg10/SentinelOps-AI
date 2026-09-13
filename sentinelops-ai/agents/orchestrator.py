"""
SentinelOps AI Multi-Agent Orchestrator
Coordinates the governed SRE lifecycle across Triage, Diagnostic, Remediation, and RCA agents.
Enforces deterministic policy checkpoints and AIMS audit logging at every step.
"""
from typing import Dict, Any, List
import datetime
import uuid
import os

try:
    from agents.triage_agent import TriageAgent
    from agents.diagnostic_agent import DiagnosticAgent
    from agents.remediation_agent import RemediationAgent
    from agents.rca_agent import RCAAgent
    from backend.governance.policy_engine import PolicyEngine, PolicyDecision
    from backend.governance.hitl import HITLController
    from backend.tools.mock_metrics import MockMetricsTool
    from backend.tools.mock_logs import MockLogsTool
    from backend.tools.mock_traces import MockTracesTool
    from backend.tools.mock_deployments import MockDeploymentsTool
    from backend.tools.mock_executor import MockExecutor
except (ImportError, ValueError):
    from .triage_agent import TriageAgent
    from .diagnostic_agent import DiagnosticAgent
    from .remediation_agent import RemediationAgent
    from .rca_agent import RCAAgent
    from ..backend.governance.policy_engine import PolicyEngine, PolicyDecision
    from ..backend.governance.hitl import HITLController
    from ..backend.tools.mock_metrics import MockMetricsTool
    from ..backend.tools.mock_logs import MockLogsTool
    from ..backend.tools.mock_traces import MockTracesTool
    from ..backend.tools.mock_deployments import MockDeploymentsTool
    from ..backend.tools.mock_executor import MockExecutor

class Orchestrator:
    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode
        self.triage_agent = TriageAgent(demo_mode)
        self.diagnostic_agent = DiagnosticAgent(demo_mode)
        self.remediation_agent = RemediationAgent(demo_mode)
        self.rca_agent = RCAAgent(demo_mode)
        self.policy_engine = PolicyEngine(demo_mode)
        self.hitl_controller = HITLController()

        self.audit_log: List[Dict[str, Any]] = []
        self.incidents: Dict[str, Dict[str, Any]] = {}
        self.actions: Dict[str, Dict[str, Any]] = {}

    def log_audit_event(
        self,
        incident_id: str,
        actor: str,
        event_type: str,
        decision: str,
        confidence: float = 1.0,
        policy_result: str = "PASS",
        input_reference: str = "",
        details: Any = None
    ) -> Dict[str, Any]:
        event_id = f"AUD-{len(self.audit_log) + 1:03d}"
        event = {
            "event_id": event_id,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "incident_id": incident_id,
            "actor": actor,
            "event_type": event_type,
            "input_reference": input_reference,
            "decision": decision,
            "confidence": confidence,
            "policy_result": policy_result,
            "details": details or {}
        }
        self.audit_log.append(event)
        return event

    def trigger_incident_simulation(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Full end-to-end simulated run of the Checkout Outage scenario.
        """
        # 1. Triage
        triage_res = self.triage_agent.run(alerts)
        incident_id = triage_res["incident_id"]

        self.log_audit_event(
            incident_id=incident_id,
            actor="triage_agent",
            event_type="ALERT_INGESTED_AND_CORRELATED",
            decision=f"Severity {triage_res['severity']} declared for {', '.join(triage_res['affected_services'])}",
            confidence=triage_res["confidence"],
            policy_result="PASS",
            input_reference="sample_alerts.json"
        )

        # 2. Gather Evidence
        telemetry = MockMetricsTool.get_telemetry()
        logs = MockLogsTool.query_logs()
        traces = MockTracesTool.get_distributed_trace()
        deployments = MockDeploymentsTool.get_recent_deployments()

        self.log_audit_event(
            incident_id=incident_id,
            actor="diagnostic_agent",
            event_type="EVIDENCE_FETCHED",
            decision="Retrieved METRIC-001, LOG-021, TRACE-017, DEPLOY-009 evidence objects",
            confidence=1.0,
            policy_result="PASS",
            input_reference="tools.mock_telemetry"
        )

        # 3. Diagnose
        diagnosis = self.diagnostic_agent.run(triage_res, telemetry, logs, traces, deployments)
        self.log_audit_event(
            incident_id=incident_id,
            actor="diagnostic_agent",
            event_type="ROOT_CAUSE_IDENTIFIED",
            decision=diagnosis["root_cause"],
            confidence=diagnosis["confidence"],
            policy_result="PASS",
            input_reference="LOG-021, DEPLOY-009"
        )

        # 4. Remediation Proposal
        proposal = self.remediation_agent.run(diagnosis, "checkout-api", "production")
        action_id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
        proposal["id"] = action_id
        proposal["incident_id"] = incident_id

        self.log_audit_event(
            incident_id=incident_id,
            actor="remediation_agent",
            event_type="RUNBOOK_PROPOSED",
            decision=f"Proposed runbook {proposal['action']} (Target: {proposal['target']})",
            confidence=0.95,
            policy_result="PASS",
            input_reference="diagnosis"
        )

        # 5. Governance Evaluation
        gov_eval = self.policy_engine.evaluate(
            action=proposal["action"],
            target=proposal["target"],
            environment="production",
            confidence=diagnosis["confidence"],
            evidence=diagnosis["evidence"],
            params=proposal.get("parameters", {})
        )
        proposal["governance_result"] = gov_eval

        self.log_audit_event(
            incident_id=incident_id,
            actor="policy_engine",
            event_type="GOVERNANCE_EVALUATED",
            decision=f"Policy Decision: {gov_eval['decision']} (Requires HITL: {gov_eval['requires_human_approval']})",
            confidence=1.0,
            policy_result=gov_eval["safe_ai_status"],
            input_reference="Action: " + proposal["action"],
            details=gov_eval
        )

        # 6. HITL Request
        hitl_req = None
        if gov_eval["requires_human_approval"]:
            hitl_req = self.hitl_controller.create_request(
                action_id=action_id,
                incident_id=incident_id,
                action=proposal["action"],
                target=proposal["target"],
                risk=proposal["risk"],
                reason=gov_eval["reason"]
            )
            self.log_audit_event(
                incident_id=incident_id,
                actor="hitl_controller",
                event_type="HUMAN_APPROVAL_REQUESTED",
                decision="Execution gated behind SRE authorization",
                confidence=1.0,
                policy_result="PASS",
                input_reference=f"Request {hitl_req['request_id']}"
            )

        # Store in state
        incident_record = {
            "incident_id": incident_id,
            "title": "Checkout API High Latency & 5xx Error Spike",
            "severity": triage_res["severity"],
            "affected_services": triage_res["affected_services"],
            "correlated_alerts": triage_res["correlated_alerts"],
            "status": "AWAITING_APPROVAL" if gov_eval["requires_human_approval"] else "RESOLVED",
            "summary": triage_res["summary"],
            "confidence": diagnosis["confidence"],
            "root_cause": diagnosis["root_cause"],
            "recommended_runbook": diagnosis["recommended_runbook"],
            "evidence": diagnosis["evidence"],
            "hypotheses": diagnosis["hypotheses"],
            "proposed_action": proposal,
            "hitl_request": hitl_req,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z"
        }

        self.incidents[incident_id] = incident_record
        self.actions[action_id] = proposal

        return incident_record
