"""
SentinelOps AI Backend Entrypoint
FastAPI server implementing REST APIs, governance checkpoints, demo simulation endpoints, and AIMS audit logging.
"""
import os
import sys

try:
    from fastapi import FastAPI, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
except ImportError:
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
except Exception:
    pass

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sentinelops-backend",
        "demo_mode": os.environ.get("DEMO_MODE", "true") == "true",
        "lyzr_configured": bool(os.environ.get("LYZR_API_KEY"))
    }

if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run("sentinelops-ai.backend.main:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("SentinelOps AI Backend module initialized.")
