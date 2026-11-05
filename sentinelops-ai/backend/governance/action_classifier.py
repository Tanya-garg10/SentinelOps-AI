"""
SentinelOps AI Action Classifier
Categorizes proposed remediation actions into deterministic risk tiers and enforces allowlist restrictions.
"""
import re
from typing import Dict, Any, Tuple
from enum import Enum

class RiskLevel(str, Enum):
    READ_ONLY = "READ_ONLY"
    LOW_RISK = "LOW_RISK"
    MEDIUM_RISK = "MEDIUM_RISK"
    HIGH_RISK = "HIGH_RISK"
    DESTRUCTIVE = "DESTRUCTIVE"
    UNKNOWN = "UNKNOWN"

class ActionClassifier:
    # Strict allowlist of approved operational runbooks
    APPROVED_RUNBOOKS = {
        "GET_LOGS": RiskLevel.READ_ONLY,
        "GET_METRICS": RiskLevel.READ_ONLY,
        "GET_TRACES": RiskLevel.READ_ONLY,
        "CLEAR_CACHE": RiskLevel.LOW_RISK,
        "RESTART_POD": RiskLevel.MEDIUM_RISK,
        "SCALE_SERVICE": RiskLevel.MEDIUM_RISK,
        "DRAIN_TRAFFIC": RiskLevel.HIGH_RISK,
        "ROLLBACK_DEPLOYMENT": RiskLevel.HIGH_RISK,
    }

    # Prohibited destructive actions that are permanently blocked or routed to strict manual intervention
    PROHIBITED_ACTIONS = {
        "DROP_DATABASE": RiskLevel.DESTRUCTIVE,
        "DELETE_NAMESPACE": RiskLevel.DESTRUCTIVE,
        "DELETE_PRODUCTION_DATA": RiskLevel.DESTRUCTIVE,
        "REBOOT_PRODUCTION_NODE": RiskLevel.DESTRUCTIVE,
        "TRUNCATE_TABLE": RiskLevel.DESTRUCTIVE,
        "DISABLE_AUTH": RiskLevel.DESTRUCTIVE,
    }

    @staticmethod
    def normalize_action_name(action_name: Any) -> str:
        if action_name is None:
            return ""

        normalized = str(action_name).strip()
        normalized = re.sub(r"[^A-Z0-9]+", "_", normalized.upper())
        normalized = re.sub(r"_+", "_", normalized).strip("_")
        return normalized

    @classmethod
    def classify(cls, action_name: str) -> Tuple[bool, RiskLevel, str]:
        normalized = cls.normalize_action_name(action_name)

        # Check for arbitrary command injection patterns
        shell_keywords = [
            "SH",
            "BASH",
            "EXEC",
            "RM",
            "CURL",
            "WGET",
            "SUDO",
            "PIP",
            "NPM",
            "YARN",
            "KUBECTL",
            "SSH",
            "POWERSHELL",
            "CMD",
            "NETCAT",
            "TELNET",
        ]
        shell_syntax = [";", "&&", "||", "|", "$(", "`", "<", ">"]
        if any(kw in normalized for kw in shell_keywords) or any(token in str(action_name or "") for token in shell_syntax):
            return False, RiskLevel.DESTRUCTIVE, "Arbitrary shell commands and unvalidated syntax are strictly prohibited."

        if normalized in cls.PROHIBITED_ACTIONS:
            return False, RiskLevel.DESTRUCTIVE, "Destructive production database operation is not permitted by autonomous agents."

        if normalized in cls.APPROVED_RUNBOOKS:
            return True, cls.APPROVED_RUNBOOKS[normalized], "Action matches approved runbook catalog."

        return False, RiskLevel.UNKNOWN, f"Action '{action_name}' is not recognized in approved runbooks."
