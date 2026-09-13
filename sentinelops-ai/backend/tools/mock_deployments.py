"""
SentinelOps AI Mock Deployments Tool
Queries GitOps / ArgoCD deployment audit history for target microservices.
"""
from typing import Dict, Any

class MockDeploymentsTool:
    @staticmethod
    def get_recent_deployments(service_name: str = "checkout-api") -> Dict[str, Any]:
        return {
            "evidence_id": "DEPLOY-009",
            "source": "argocd_audit_trail",
            "service": service_name,
            "recent_deployments": [
                {
                    "release": "checkout-api-v2.8.1",
                    "version": "v2.8.1",
                    "deployed_at": "17:55:00Z (6 minutes prior to initial alert)",
                    "deployed_by": "ci-cd-pipeline-prod",
                    "commit_hash": "a4f910e",
                    "commit_message": "feat(cache): introduce in-memory transaction deduplication buffer",
                    "previous_version": "v2.8.0",
                    "status": "HEALTHY_UNTIL_CRASH"
                },
                {
                    "release": "checkout-api-v2.8.0",
                    "version": "v2.8.0",
                    "deployed_at": "3 days ago",
                    "deployed_by": "ci-cd-pipeline-prod",
                    "commit_hash": "c8b1129",
                    "commit_message": "fix(db): connection pool tune max_overflow=20",
                    "previous_version": "v2.7.9",
                    "status": "STABLE_BASELINE"
                }
            ],
            "finding": "Deployment v2.8.1 completed at 17:55:00Z, immediately preceding the degradation slope."
        }
