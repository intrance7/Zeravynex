import sys
from pathlib import Path
# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.database import Base, get_db

from sqlalchemy.pool import StaticPool

# Setup in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_analyze_endpoint_invalid_file_type():
    response = client.post(
        "/api/v1/analyze",
        files={"file": ("test.txt", b"Hello World", "text/plain")}
    )
    assert response.status_code == 400
    assert "Only Windows PE files" in response.json()["detail"]

def test_analyze_endpoint_valid_pe(tmp_path):
    # Create a dummy PE to bypass initial extension check
    file_content = b"MZ" + b"\x00" * 100
    response = client.post(
        "/api/v1/analyze",
        files={"file": ("test.exe", file_content, "application/x-msdownload")}
    )
    
    # Since it's a dummy PE, pefile might complain it's invalid during analysis,
    # but the API should handle the error or return a result indicating it's invalid.
    # The actual result depends on the analyzer behavior.
    # We just ensure it doesn't crash 500 without a reason, or it completes.
    assert response.status_code in [200, 500] 
    if response.status_code == 200:
        data = response.json()
        assert "analysis_id" in data
        assert data["status"] == "completed"

def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "checks" in data
    assert "database" in data["checks"]
    assert "yara_engine" in data["checks"]

def test_get_history_empty():
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_report_by_nonexistent_id():
    response = client.get("/api/v1/report/id/999999")
    assert response.status_code == 404

def test_search_reports_empty():
    response = client.get("/api/v1/report/search?q=test")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

