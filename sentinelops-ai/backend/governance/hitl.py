"""
SentinelOps AI Human-in-the-Loop (HITL) Controller
Manages authorization requests, sign-offs, rejections, and tamper-resistant audit tokens for high-risk actions.
"""
from typing import Dict, Any, Optional
import datetime
import hashlib
import json
import uuid

UTC = datetime.timezone.utc

class HITLController:
    def __init__(self):
        self.pending_authorizations: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def _fingerprint_action(action: str, target: str, risk: str, reason: str, parameters: Optional[Dict[str, Any]] = None) -> str:
        payload = {
            "action": action,
            "target": target,
            "risk": risk,
            "reason": reason,
            "parameters": parameters or {},
        }
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def create_request(
        self,
        action_id: str,
        incident_id: str,
        action: str,
        target: str,
        risk: str,
        reason: str,
        action_parameters: Optional[Dict[str, Any]] = None,
        expires_in_seconds: int = 900,
    ) -> Dict[str, Any]:
        approval_token = uuid.uuid4().hex
        expires_at = (datetime.datetime.now(UTC) + datetime.timedelta(seconds=expires_in_seconds)).isoformat().replace("+00:00", "Z")
        req = {
            "request_id": f"HITL-{uuid.uuid4().hex[:8].upper()}",
            "action_id": action_id,
            "incident_id": incident_id,
            "action": action,
            "target": target,
            "risk": risk,
            "reason": reason,
            "status": "PENDING",
            "requested_at": datetime.datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            "expires_at": expires_at,
            "approver": None,
            "decision_notes": None,
            "approval_token": approval_token,
            "action_fingerprint": self._fingerprint_action(action, target, risk, reason, action_parameters),
            "parameters": action_parameters or {},
        }
        self.pending_authorizations[action_id] = req
        return req

    def validate_approval(
        self,
        action_id: str,
        action_details: Optional[Dict[str, Any]] = None,
        approval_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        if action_id not in self.pending_authorizations:
            return {"valid": False, "error": f"No pending authorization found for action {action_id}"}

        req = self.pending_authorizations[action_id]
        if req.get("status") != "PENDING":
            return {"valid": False, "error": f"Authorization for action {action_id} is no longer pending"}

        expires_at = req.get("expires_at")
        if expires_at:
            now_utc = datetime.datetime.now(UTC)
            expiry_dt = datetime.datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if now_utc > expiry_dt:
                req["status"] = "EXPIRED"
                req["decision_notes"] = "Approval expired before execution was authorized."
                return {"valid": False, "error": f"Approval for action {action_id} has expired"}

        if approval_token is not None and req.get("approval_token") != approval_token:
            return {"valid": False, "error": "Approval token is invalid or has already been consumed"}

        action_details = action_details or {}
        fingerprint = self._fingerprint_action(
            action_details.get("action", req.get("action")),
            action_details.get("target", req.get("target")),
            action_details.get("risk", req.get("risk")),
            action_details.get("reason", req.get("reason")),
            action_details.get("parameters", req.get("parameters")),
        )
        if fingerprint != req.get("action_fingerprint"):
            return {"valid": False, "error": "Action arguments changed after approval was issued"}

        return {"valid": True, "request": req}

    def approve(
        self,
        action_id: str,
        approver: str = "sre_lead_operator",
        notes: str = "Authorized via SRE console",
        approval_token: Optional[str] = None,
        action_details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if action_id not in self.pending_authorizations:
            return {"success": False, "error": f"No pending authorization found for action {action_id}"}

        validation = self.validate_approval(action_id, action_details=action_details, approval_token=approval_token)
        if not validation["valid"]:
            return {"success": False, "error": validation["error"], "request": self.pending_authorizations[action_id]}

        req = self.pending_authorizations[action_id]
        req["status"] = "APPROVED"
        req["approver"] = approver
        req["decision_notes"] = notes
        req["approved_at"] = datetime.datetime.now(UTC).isoformat().replace("+00:00", "Z")
        req["approval_token_consumed"] = True
        req["approval_token"] = None
        return {"success": True, "request": req}

    def reject(self, action_id: str, approver: str = "sre_lead_operator", notes: str = "Rejected by operator") -> Dict[str, Any]:
        if action_id not in self.pending_authorizations:
            return {"success": False, "error": f"No pending authorization found for action {action_id}"}

        req = self.pending_authorizations[action_id]
        if req.get("status") != "PENDING":
            return {"success": False, "error": f"Authorization for action {action_id} cannot be rejected because it is no longer pending", "request": req}

        req["status"] = "REJECTED"
        req["approver"] = approver
        req["decision_notes"] = notes
        req["rejected_at"] = datetime.datetime.now(UTC).isoformat().replace("+00:00", "Z")
        req["approval_token"] = None
        return {"success": True, "request": req}
