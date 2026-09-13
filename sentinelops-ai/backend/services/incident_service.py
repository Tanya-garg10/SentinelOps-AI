"""
SentinelOps AI Incident Management Service
Handles persistence, orchestration dispatch, governance gating, and mock remediation execution.
"""
from typing import Dict, Any, List, Optional
import datetime
import uuid

from ..governance.policy_engine import PolicyEngine, PolicyDecision
from ..governance.hitl import HITLController
from ..tools.mock_metrics import MockMetricsTool
from ..tools.mock_logs import MockLogsTool
from ..tools.mock_traces import MockTracesTool
from ..tools.mock_deployments import MockDeploymentsTool
from ..tools.mock_executor import MockExecutor

class IncidentService:
    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode
        self.policy_engine = PolicyEngine(demo_mode)
        self.hitl_controller = HITLController()
        self.incidents: Dict[str, Dict[str, Any]] = {}
        self.alerts: List[Dict[str, Any]] = []
        self.audit_events: List[Dict[str, Any]] = []
        self.actions: Dict[str, Dict[str, Any]] = {}

    def log_audit(self, incident_id: str, actor: str, event_type: str, decision: str, confidence: float = 1.0, policy_result: str = "PASS", input_ref: str = "", details: Any = None) -> Dict[str, Any]:
        evt = {
            "event_id": f"AUD-{len(self.audit_events) + 1:03d}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "incident_id": incident_id,
            "actor": actor,
            "event_type": event_type,
            "input_reference": input_ref,
            "decision": decision,
            "confidence": confidence,
            "policy_result": policy_result,
            "details": details or {}
        }
        self.audit_events.append(evt)
        return evt

    def ingest_alerts(self, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for a in alerts:
            self.alerts.append(a)
        return self.alerts

    def get_incidents(self) -> List[Dict[str, Any]]:
        return list(self.incidents.values())

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self.incidents.get(incident_id)

    def get_audit_trail(self, incident_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if incident_id:
            return [e for e in self.audit_events if e.get("incident_id") == incident_id]
        return self.audit_events
