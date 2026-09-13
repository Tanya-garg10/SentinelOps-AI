"""
Unit tests for SentinelOps AI Multi-Agent Lifecycle (Triage, Diagnostic, Remediation, RCA, Audit).
"""
import unittest
import sys
import os

# Set import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.triage_agent import TriageAgent
from agents.diagnostic_agent import DiagnosticAgent
from agents.remediation_agent import RemediationAgent
from agents.rca_agent import RCAAgent
from backend.tools.mock_metrics import MockMetricsTool
from backend.tools.mock_logs import MockLogsTool
from backend.tools.mock_traces import MockTracesTool
from backend.tools.mock_deployments import MockDeploymentsTool

class TestMultiAgentSystem(unittest.TestCase):
    def setUp(self):
        self.triage = TriageAgent(demo_mode=True)
        self.diagnostic = DiagnosticAgent(demo_mode=True)
        self.remediation = RemediationAgent(demo_mode=True)
        self.rca = RCAAgent(demo_mode=True)

        self.sample_alerts = [
            {
                "alert_id": "ALT-001",
                "service": "checkout-api",
                "alert_name": "ContainerMemoryUtilizationHigh",
                "severity": "critical",
                "labels": {"namespace": "ecommerce"}
            },
            {
                # Duplicate alert signature
                "alert_id": "ALT-002",
                "service": "checkout-api",
                "alert_name": "ContainerMemoryUtilizationHigh",
                "severity": "critical",
                "labels": {"namespace": "ecommerce"}
            },
            {
                "alert_id": "ALT-004",
                "service": "checkout-api",
                "alert_name": "Http5xxRateElevated",
                "severity": "critical",
                "labels": {"namespace": "ecommerce"}
            }
        ]

    def test_p1_classification_and_correlation(self):
        """Tests that concurrent memory + 5xx critical alerts result in P1 severity."""
        result = self.triage.run(self.sample_alerts)
        self.assertEqual(result["severity"], "P1")
        self.assertIn("checkout-api", result["affected_services"])
        self.assertGreaterEqual(result["confidence"], 0.90)
        self.assertIn("ALT-001", result["correlated_alerts"])
        self.assertIn("ALT-004", result["correlated_alerts"])

    def test_evidence_backed_diagnosis(self):
        """Tests that diagnosis identifies root cause and links verified evidence IDs."""
        telemetry = MockMetricsTool.get_telemetry()
        logs = MockLogsTool.query_logs()
        traces = MockTracesTool.get_distributed_trace()
        deployments = MockDeploymentsTool.get_recent_deployments()

        incident = {"incident_id": "INC-001", "service": "checkout-api"}
        diag = self.diagnostic.run(incident, telemetry, logs, traces, deployments)

        self.assertEqual(diag["status"], "DIAGNOSED")
        self.assertGreaterEqual(diag["confidence"], 0.90)
        evidence_ids = [e["id"] for e in diag["evidence"]]
        self.assertIn("METRIC-001", evidence_ids)
        self.assertIn("LOG-021", evidence_ids)
        self.assertIn("DEPLOY-009", evidence_ids)
        self.assertIn("TRACE-017", evidence_ids)
        self.assertEqual(diag["recommended_runbook"], "ROLLBACK_DEPLOYMENT")

    def test_evidence_requirement_rejection(self):
        """Tests that absence of empirical evidence forces REQUIRES_HUMAN."""
        incident = {"incident_id": "INC-002", "service": "checkout-api"}
        diag = self.diagnostic.run(incident, {}, {}, {}, {})
        self.assertEqual(diag["status"], "REQUIRES_HUMAN")
        self.assertLess(diag["confidence"], 0.50)

    def test_remediation_proposal_constraints(self):
        """Remediation agent must only select predefined runbooks and never output raw commands."""
        diagnosis = {"recommended_runbook": "ROLLBACK_DEPLOYMENT"}
        action = self.remediation.run(diagnosis, "checkout-api", "production")
        self.assertEqual(action["action"], "ROLLBACK_DEPLOYMENT")
        self.assertEqual(action["target"], "checkout-api")
        self.assertEqual(action["from_version"], "v2.8.1")
        self.assertEqual(action["to_version"], "v2.8.0")
        self.assertTrue(action["requires_human_approval"])

    def test_blameless_rca_generation(self):
        """Tests generation of complete blameless postmortem with preventive action items."""
        incident = {
            "incident_id": "INC-001",
            "summary": "Checkout API Memory Exhaustion Outage",
            "severity": "P1",
            "root_cause": "SessionCache memory leak in v2.8.1"
        }
        timeline = [{"time": "18:00", "event": "OOM detected", "actor": "Prometheus"}]
        evidence = [{"id": "LOG-021", "finding": "OOM error"}]
        exec_res = {"success": True}

        rca = self.rca.run(incident, timeline, evidence, exec_res)
        self.assertIn("blameless_statement", rca)
        self.assertGreaterEqual(len(rca["action_items"]), 2)
        self.assertGreaterEqual(len(rca["prevention"]), 2)
        self.assertEqual(rca["incident_id"], "INC-001")

if __name__ == "__main__":
    unittest.main()
