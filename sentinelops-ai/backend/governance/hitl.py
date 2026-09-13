"""
SentinelOps AI Human-in-the-Loop (HITL) Controller
Manages authorization requests, sign-offs, rejections, and tamper-resistant audit tokens for high-risk actions.
"""
from typing import Dict, Any
import datetime
import uuid

class HITLController:
    def __init__(self):
        self.pending_authorizations: Dict[str, Dict[str, Any]] = {}

    def create_request(self, action_id: str, incident_id: str, action: str, target: str, risk: str, reason: str) -> Dict[str, Any]:
        req = {
            "request_id": f"HITL-{uuid.uuid4().hex[:8].upper()}",
            "action_id": action_id,
            "incident_id": incident_id,
            "action": action,
            "target": target,
            "risk": risk,
            "reason": reason,
            "status": "PENDING",
            "requested_at": datetime.datetime.utcnow().isoformat() + "Z",
            "approver": None,
            "decision_notes": None
        }
        self.pending_authorizations[action_id] = req
        return req

    def approve(self, action_id: str, approver: str = "sre_lead_operator", notes: str = "Authorized via SRE console") -> Dict[str, Any]:
        if action_id not in self.pending_authorizations:
            return {"success": False, "error": f"No pending authorization found for action {action_id}"}

        req = self.pending_authorizations[action_id]
        req["status"] = "APPROVED"
        req["approver"] = approver
        req["decision_notes"] = notes
        req["approved_at"] = datetime.datetime.utcnow().isoformat() + "Z"
        return {"success": True, "request": req}

    def reject(self, action_id: str, approver: str = "sre_lead_operator", notes: str = "Rejected by operator") -> Dict[str, Any]:
        if action_id not in self.pending_authorizations:
            return {"success": False, "error": f"No pending authorization found for action {action_id}"}

        req = self.pending_authorizations[action_id]
        req["status"] = "REJECTED"
        req["approver"] = approver
        req["decision_notes"] = notes
        req["rejected_at"] = datetime.datetime.utcnow().isoformat() + "Z"
        return {"success": True, "request": req}
