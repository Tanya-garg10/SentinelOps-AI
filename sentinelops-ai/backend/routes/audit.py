"""
Audit trail router for SentinelOps AI (AIMS-compatible)
"""
from typing import Optional

try:
    from fastapi import APIRouter
    router = APIRouter(prefix="/api/audit", tags=["Audit"])
except ImportError:
    class DummyRouter:
        def __init__(self, *args, **kwargs): pass
        def get(self, *args, **kwargs): return lambda f: f
    router = DummyRouter()

@router.get("")
def get_global_audit_trail(incident_id: Optional[str] = None):
    return {"audit_events": []}
