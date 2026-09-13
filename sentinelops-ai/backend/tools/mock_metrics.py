"""
SentinelOps AI Mock Metrics Tool
Retrieves real-time Prometheus / CloudWatch telemetry time-series.
"""
from typing import Dict, Any, List

class MockMetricsTool:
    @staticmethod
    def get_telemetry(service_name: str = "checkout-api") -> Dict[str, Any]:
        return {
            "evidence_id": "METRIC-001",
            "source": "prometheus_cluster_prod",
            "service": service_name,
            "metrics": {
                "memory_utilization": {
                    "current": "94.2%",
                    "progression": ["62%", "71%", "82%", "94%"],
                    "threshold": "90.0%"
                },
                "http_latency_p99": {
                    "current": "4.82s",
                    "progression": ["480ms", "1.2s", "2.8s", "4.82s"],
                    "threshold": "2.0s"
                },
                "http_5xx_rate": {
                    "current": "18.4%",
                    "progression": ["0.8%", "3.4%", "8.7%", "18.4%"],
                    "threshold": "5.0%"
                },
                "container_restarts": {
                    "restarts_last_10m": 8,
                    "last_exit_code": "137 (OOMKilled)"
                }
            },
            "summary": "Critical steep escalation in memory consumption correlated directly with P99 latency spikes (4.82s) and 5xx failure cascades (18.4%)."
        }
