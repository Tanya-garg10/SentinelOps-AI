"""
SentinelOps AI Mock Logs Tool
Queries structured logs from Elasticsearch/CloudWatch with regex pattern matching.
"""
from typing import Dict, Any, List

class MockLogsTool:
    @staticmethod
    def query_logs(service_name: str = "checkout-api", limit: int = 10) -> Dict[str, Any]:
        return {
            "evidence_id": "LOG-021",
            "source": "application_logs",
            "service": service_name,
            "total_matches": 142,
            "critical_entries": [
                {
                    "log_id": "LOG-018",
                    "timestamp": "17:58:10Z",
                    "level": "INFO",
                    "message": "Checkout service initialized version v2.8.1 with new memory-resident transaction cache"
                },
                {
                    "log_id": "LOG-021",
                    "timestamp": "18:00:44Z",
                    "level": "ERROR",
                    "message": "java.lang.OutOfMemoryError: Java heap space at com.sentinel.checkout.cache.SessionCache.put(SessionCache.java:142)"
                },
                {
                    "log_id": "LOG-024",
                    "timestamp": "18:01:05Z",
                    "level": "WARN",
                    "message": "GC overhead limit exceeded: Full GC took 3240ms, reclaimed only 12MB out of 4096MB"
                },
                {
                    "log_id": "LOG-029",
                    "timestamp": "18:01:35Z",
                    "level": "FATAL",
                    "message": "Heap allocation failed in worker thread. Node kernel initiated OOM-killer (exit code 137)"
                }
            ],
            "finding": "Explicit OutOfMemoryError and repeated GC overhead limit exceeded errors originating from SessionCache.put."
        }
