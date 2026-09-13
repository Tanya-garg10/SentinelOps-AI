"""
SentinelOps AI Pydantic & Data Models
Defines validated schemas for Incidents, Alerts, Evidence, Remediation, Audit, and RCA.
"""
from typing import List, Dict, Any, Optional
from enum import Enum
import datetime

# Conditional Pydantic import with clean dataclass fallback
try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(*args, **kwargs):
        return kwargs.get("default", None)

class SeverityLevel(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"

class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    TRIAGED = "TRIAGED"
    DIAGNOSING = "DIAGNOSING"
    DIAGNOSED = "DIAGNOSED"
    REMEDIATION_PROPOSED = "REMEDIATION_PROPOSED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    REMEDIATING = "REMEDIATING"
    RESOLVED = "RESOLVED"
    REQUIRES_HUMAN = "REQUIRES_HUMAN"
    BLOCKED = "BLOCKED"

class RiskClassification(str, Enum):
    READ_ONLY = "READ_ONLY"
    LOW_RISK = "LOW_RISK"
    MEDIUM_RISK = "MEDIUM_RISK"
    HIGH_RISK = "HIGH_RISK"
    DESTRUCTIVE = "DESTRUCTIVE"

class Alert(BaseModel):
    alert_id: str
    service: str
    alert_name: str
    severity: str
    metric: Optional[str] = None
    threshold: Optional[str] = None
    current_value: Optional[str] = None
    environment: str = "production"
    timestamp: str
    labels: Dict[str, str] = {}

class Evidence(BaseModel):
    id: str
    source: str
    title: str
    finding: str
    timestamp: Optional[str] = None
    verified: bool = True

class RemediationAction(BaseModel):
    id: str
    incident_id: str
    action: str
    target: str
    from_version: Optional[str] = None
    to_version: Optional[str] = None
    risk: RiskClassification
    environment: str = "production"
    reason: str
    requires_human_approval: bool
    governance_result: Optional[Dict[str, Any]] = None
    approval_status: str = "PENDING"
    execution_status: str = "NOT_EXECUTED"
    executed_at: Optional[str] = None
    approved_by: Optional[str] = None

class AuditEvent(BaseModel):
    event_id: str
    timestamp: str
    incident_id: str
    actor: str
    event_type: str
    input_reference: str
    decision: str
    confidence: float
    policy_result: str
    details: Optional[Dict[str, Any]] = None

class RCAReport(BaseModel):
    rca_id: str
    incident_id: str
    title: str
    generated_at: str
    severity: str
    impact: str
    detection: str
    timeline: List[Dict[str, str]]
    root_cause: str
    contributing_factors: List[str]
    remediation: str
    prevention: List[str]
    action_items: List[Dict[str, str]]
    blameless_statement: str

class Incident(BaseModel):
    incident_id: str
    title: str
    severity: SeverityLevel
    affected_services: List[str]
    correlated_alerts: List[str]
    status: IncidentStatus
    summary: str
    confidence: float
    created_at: str
    updated_at: str
    root_cause: Optional[str] = None
    recommended_runbook: Optional[str] = None
    evidence: List[Evidence] = []
    proposed_action: Optional[RemediationAction] = None
    rca: Optional[RCAReport] = None
