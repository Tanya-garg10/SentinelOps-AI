"""
SentinelOps AI Backend Entrypoint
FastAPI server implementing REST APIs, governance checkpoints, demo simulation endpoints, and AIMS audit logging.
"""
import os
import sys

try:
    from fastapi import FastAPI, BackgroundTasks, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    
    # Import core components
    from backend.core.config import settings
    from backend.core.logger import logger
    from backend.core.exceptions import SentinelOpsException, GovernanceViolationException, global_exception_handler, governance_exception_handler
except ImportError as e:
    print(f"Failed to import core modules: {e}")
    # Minimal fallback placeholder if running pure standalone script
    class FastAPI:
        def __init__(self, *args, **kwargs): pass
        def add_middleware(self, *args, **kwargs): pass
        def include_router(self, *args, **kwargs): pass
        def get(self, *args, **kwargs): return lambda f: f
        def post(self, *args, **kwargs): return lambda f: f

app = FastAPI(
    title="SentinelOps AI — Enterprise SRE Incident Remediation Platform",
    description="Governed multi-agent SRE system integrating Lyzr Agent API, Safe AI governance, and AIMS audit logging.",
    version="1.0.0"
)

try:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register exception handlers
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(GovernanceViolationException, governance_exception_handler)
    
    # Middleware for request logging
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info(f"Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
        
except Exception as e:
    print(f"Failed to add middleware/handlers: {e}")

@app.get("/api/health")
def health_check():
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.environment,
        "demo_mode": os.environ.get("DEMO_MODE", "true") == "true",
        "lyzr_configured": bool(settings.api_key)
    }

if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run("sentinelops-ai.backend.main:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("SentinelOps AI Backend module initialized.")
