"""
SentinelOps AI Deterministic Policy Engine
Evaluates agent proposals against deterministic enterprise SRE governance policies outside of the LLM.
"""
from typing import Dict, Any, List
from .action_classifier import ActionClassifier, RiskLevel

class PolicyDecision:
    APPROVED = "APPROVED"
    REQUIRES_APPROVAL = "REQUIRES_APPROVAL"
    BLOCKED = "BLOCKED"
    REQUIRES_HUMAN = "REQUIRES_HUMAN"

class PolicyEngine:
    """
    Deterministic rule engine enforcing the 10 core SentinelOps Governance Rules:
    1. Unknown action -> BLOCK
    2. Arbitrary command -> BLOCK
    3. Destructive action -> BLOCK
    4. Production + HIGH_RISK -> HITL (Requires Human Approval)
    5. Production + DESTRUCTIVE -> BLOCK
    6. Confidence < 0.90 -> HITL
    7. Missing evidence -> REQUIRES_HUMAN
    8. Action outside approved runbooks -> BLOCK
    9. Approved action -> execute only through mock executor
    10. Every decision must be logged
    """

    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode

    def evaluate(
        self,
        action: str,
        target: str,
        environment: str,
        confidence: float,
        evidence: List[Any],
        params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        params = params or {}
        env_normalized = (environment or "production").lower()
        is_prod = env_normalized in ["production", "prod"]

        evaluated_rules = []
        rule_violations = []

        # Rule 1 & 2 & 8: Classification & Runbook catalog check
        is_approved_catalog, risk_level, classification_msg = ActionClassifier.classify(action)
        evaluated_rules.append("RULE-001: Action existence and allowlist check")
        evaluated_rules.append("RULE-002: Shell injection & arbitrary command prevention")
        evaluated_rules.append("RULE-008: Approved operational runbook verification")

        if not is_approved_catalog:
            rule_violations.append(classification_msg)
            return {
                "decision": PolicyDecision.BLOCKED,
                "risk": risk_level.value,
                "reason": classification_msg,
                "requires_human_approval": False,
                "evaluated_rules": evaluated_rules,
                "safe_ai_status": "BLOCK"
            }

        # Rule 7: Missing evidence check
        evaluated_rules.append("RULE-007: Mandatory empirical evidence verification")
        if not evidence or len(evidence) == 0:
            return {
                "decision": PolicyDecision.REQUIRES_HUMAN,
                "risk": risk_level.value,
                "reason": "Evidence check failed: Agent proposal lacks linked telemetry/log/trace evidence IDs.",
                "requires_human_approval": True,
                "evaluated_rules": evaluated_rules,
                "safe_ai_status": "FLAG_EVIDENCE_ABSENT"
            }

        # Rule 6: Confidence check (< 0.90)
        evaluated_rules.append("RULE-006: Diagnostic confidence barrier (>= 0.90 required for unassisted gating)")
        if confidence < 0.90:
            return {
                "decision": PolicyDecision.REQUIRES_APPROVAL,
                "risk": risk_level.value,
                "reason": f"Agent diagnostic confidence ({confidence:.2f}) is below the required 0.90 threshold for autonomous progression.",
                "requires_human_approval": True,
                "evaluated_rules": evaluated_rules,
                "safe_ai_status": "FLAG_LOW_CONFIDENCE"
            }

        # Rule 4: Production + HIGH_RISK -> HITL
        evaluated_rules.append("RULE-004: Production tier high-risk operations require Human-in-the-Loop approval")
        if is_prod and risk_level == RiskLevel.HIGH_RISK:
            return {
                "decision": PolicyDecision.REQUIRES_APPROVAL,
                "risk": risk_level.value,
                "reason": f"Action '{action}' is classified as HIGH_RISK against target '{target}' in environment '{environment}'. Mandatory human authorization required.",
                "requires_human_approval": True,
                "evaluated_rules": evaluated_rules,
                "safe_ai_status": "PASS_AWAITING_HITL"
            }

        # Low risk / Read only in prod, or safe non-prod action
        evaluated_rules.append("RULE-009: Verified safe action execution through governed executor")
        return {
            "decision": PolicyDecision.APPROVED,
            "risk": risk_level.value,
            "reason": f"Action '{action}' successfully cleared all governance and safety policies.",
            "requires_human_approval": False,
            "evaluated_rules": evaluated_rules,
            "safe_ai_status": "PASS"
        }
