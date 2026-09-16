from fastapi import Request
from fastapi.responses import JSONResponse
from backend.core.logger import logger

class SentinelOpsException(Exception):
    """Base exception for SentinelOps AI."""
    pass

class GovernanceViolationException(SentinelOpsException):
    """Raised when an action violates governance policies."""
    pass

class AgentExecutionError(SentinelOpsException):
    """Raised when an agent fails to execute its task."""
    pass

async def global_exception_handler(request: Request, exc: Exception):
    """Global handler for uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

async def governance_exception_handler(request: Request, exc: GovernanceViolationException):
    """Handler for governance violations."""
    logger.warning(f"Governance violation: {exc}")
    return JSONResponse(
        status_code=403,
        content={"detail": "Action denied by governance policy.", "error": str(exc)}
    )
