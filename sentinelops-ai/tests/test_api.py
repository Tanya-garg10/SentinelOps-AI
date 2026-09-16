import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_health_check_cors():
    response = client.options("/api/health", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    assert response.status_code == 200

# Testing the non-existent alerts endpoint mock logic directly from main isn't feasible here 
# without importing the router into main, but since it's a prototype, we just verify health check and app initialization.
