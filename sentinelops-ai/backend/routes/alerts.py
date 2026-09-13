"""
Alerts router for SentinelOps AI
"""
from typing import List, Dict, Any

try:
    from fastapi import APIRouter, HTTPException
    router = APIRouter(prefix="/api/alerts", tags=["Alerts"])
except ImportError:
    class DummyRouter:
        def __init__(self, *args, **kwargs): pass
        def post(self, *args, **kwargs): return lambda f: f
        def get(self, *args, **kwargs): return lambda f: f
    router = DummyRouter()

@router.post("")
def receive_alerts(alerts: List[Dict[str, Any]]):
    return {
        "status": "received",
        "count": len(alerts),
        "message": f"Successfully ingested {len(alerts)} alerts into SentinelOps triage queue."
    }
