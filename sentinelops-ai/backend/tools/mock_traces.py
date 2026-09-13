"""
SentinelOps AI Mock Traces Tool
Queries distributed OpenTelemetry/Jaeger traces across microservice spans.
"""
from typing import Dict, Any

class MockTracesTool:
    @staticmethod
    def get_distributed_trace(trace_id: str = "tr-89b1c-checkout") -> Dict[str, Any]:
        return {
            "evidence_id": "TRACE-017",
            "source": "opentelemetry_collector",
            "trace_id": trace_id,
            "root_span": "/api/v1/checkout/process",
            "duration_ms": 4820,
            "spans": [
                {
                    "span_id": "span-01",
                    "service": "api-gateway",
                    "operation": "proxy_pass",
                    "duration_ms": 4820,
                    "status": "ERROR_500"
                },
                {
                    "span_id": "span-02",
                    "service": "checkout-api",
                    "operation": "validate_cart",
                    "duration_ms": 45,
                    "status": "OK"
                },
                {
                    "span_id": "span-03",
                    "service": "checkout-api",
                    "operation": "cache_transaction_session",
                    "duration_ms": 4650,
                    "status": "TIMED_OUT",
                    "error": "Thread blocked on GC allocation stall (4650ms)"
                }
            ],
            "finding": "Trace latency is dominated by a 4650ms GC freeze inside checkout-api during cache_transaction_session."
        }
