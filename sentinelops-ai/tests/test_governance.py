"""
Unit tests for SentinelOps AI Governance Engine and Policy Enforcement.
"""
import unittest
import sys
import os

# Ensure import paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.governance.policy_engine import PolicyEngine, PolicyDecision
from backend.governance.action_classifier import ActionClassifier, RiskLevel
from backend.governance.hitl import HITLController

class TestGovernanceEngine(unittest.TestCase):
    def setUp(self):
        self.policy_engine = PolicyEngine(demo_mode=True)
        self.hitl = HITLController()
        self.mock_evidence = [
            {"id": "METRIC-001", "finding": "Memory 94%"},
            {"id": "LOG-021", "finding": "OutOfMemoryError"}
        ]

    def test_destructive_action_blocked(self):
        """Rule 5 & 3: DROP_DATABASE must be deterministically BLOCKED."""
        result = self.policy_engine.evaluate(
            action="DROP_DATABASE",
            target="checkout_prod",
            environment="production",
            confidence=0.99,
            evidence=self.mock_evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.BLOCKED)
        self.assertEqual(result["risk"], RiskLevel.DESTRUCTIVE.value)
        self.assertIn("Destructive", result["reason"])
        self.assertFalse(result["requires_human_approval"])

    def test_unknown_action_blocked(self):
        """Rule 1 & 8: Unrecognized action outside approved runbooks must be BLOCKED."""
        result = self.policy_engine.evaluate(
            action="ARBITRARY_UNAPPROVED_RUNBOOK",
            target="checkout-api",
            environment="production",
            confidence=0.95,
            evidence=self.mock_evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.BLOCKED)
        self.assertIn("not recognized", result["reason"])

    def test_arbitrary_shell_command_blocked(self):
        """Rule 2: Command injection and shell tokens must be BLOCKED immediately."""
        result = self.policy_engine.evaluate(
            action="RM -RF /VAR/LOGS; REBOOT",
            target="checkout-api",
            environment="production",
            confidence=0.95,
            evidence=self.mock_evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.BLOCKED)
        self.assertIn("Arbitrary shell commands", result["reason"])

    def test_rollback_governance_requires_hitl(self):
        """Rule 4: Production + HIGH_RISK (ROLLBACK_DEPLOYMENT) requires Human Approval."""
        result = self.policy_engine.evaluate(
            action="ROLLBACK_DEPLOYMENT",
            target="checkout-api",
            environment="production",
            confidence=0.94,
            evidence=self.mock_evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.REQUIRES_APPROVAL)
        self.assertTrue(result["requires_human_approval"])
        self.assertEqual(result["risk"], RiskLevel.HIGH_RISK.value)

    def test_missing_evidence_requires_human(self):
        """Rule 7: Autonomous action without empirical evidence must require human intervention."""
        result = self.policy_engine.evaluate(
            action="ROLLBACK_DEPLOYMENT",
            target="checkout-api",
            environment="production",
            confidence=0.95,
            evidence=[]  # Empty evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.REQUIRES_HUMAN)
        self.assertIn("Evidence check failed", result["reason"])

    def test_low_confidence_diagnosis_requires_approval(self):
        """Rule 6: Confidence < 0.90 requires human confirmation."""
        result = self.policy_engine.evaluate(
            action="RESTART_POD",
            target="checkout-api",
            environment="production",
            confidence=0.82,  # Sub-threshold
            evidence=self.mock_evidence
        )
        self.assertEqual(result["decision"], PolicyDecision.REQUIRES_APPROVAL)
        self.assertTrue(result["requires_human_approval"])
        self.assertIn("confidence (0.82) is below", result["reason"])

    def test_hitl_approval_flow(self):
        """Tests approval cycle in HITL controller."""
        req = self.hitl.create_request("ACT-123", "INC-001", "ROLLBACK_DEPLOYMENT", "checkout-api", "HIGH_RISK", "Memory leak")
        self.assertEqual(req["status"], "PENDING")

        appr = self.hitl.approve("ACT-123", "lead_sre", "Checked rollback target")
        self.assertTrue(appr["success"])
        self.assertEqual(appr["request"]["status"], "APPROVED")
        self.assertEqual(appr["request"]["approver"], "lead_sre")

    def test_hitl_rejection_flow(self):
        """Tests rejection cycle in HITL controller."""
        req = self.hitl.create_request("ACT-456", "INC-001", "SCALE_SERVICE", "checkout-api", "MEDIUM_RISK", "Spike")
        rej = self.hitl.reject("ACT-456", "lead_sre", "Not needed, traffic subsiding")
        self.assertTrue(rej["success"])
        self.assertEqual(rej["request"]["status"], "REJECTED")

if __name__ == "__main__":
    unittest.main()
