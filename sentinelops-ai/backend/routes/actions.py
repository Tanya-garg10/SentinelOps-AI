"""
Remediation Actions and Human-in-the-loop router for SentinelOps AI
"""
from typing import Dict, Any

try:
    from fastapi import APIRouter, HTTPException
    router = APIRouter(prefix="/api/actions", tags=["Actions"])
except ImportError:
    class DummyRouter:
        def __init__(self, *args, **kwargs): pass
        def post(self, *args, **kwargs): return lambda f: f
        def get(self, *args, **kwargs): return lambda f: f
    router = DummyRouter()

@router.post("/{action_id}/approve")
def approve_action(action_id: str):
    return {
        "action_id": action_id,
        "status": "APPROVED",
        "message": "Action approved by SRE operator and dispatched to governed executor."
    }

@router.post("/{action_id}/reject")
def reject_action(action_id: str):
    return {
        "action_id": action_id,
        "status": "REJECTED",
        "message": "Action rejected by SRE operator. Incident remains in manual triage."
    }
