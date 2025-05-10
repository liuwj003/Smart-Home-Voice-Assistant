import os
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import pytest
from fastapi.testclient import TestClient
from backend.src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_devices():
    response = client.get("/api/devices/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_weather():
    response = client.get("/api/weather/current")
    assert response.status_code == 200
    assert "temperature" in response.json()
    assert "weather" in response.json() 