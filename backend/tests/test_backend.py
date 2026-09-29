import io
import os
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.dataset_service import dataset_service
from backend.services.sql_service import sql_service
from backend.agents.manager_agent import manager_agent
from backend.agents.data_agent import data_agent
from backend.agents.sql_agent import sql_agent
from backend.api.analyze import compare_agent_results
from backend.models.schemas import AnalysisPlan, SortConfig, FilterCondition

client = TestClient(app)

SAMPLE_30_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_30_products.csv")

def get_30_row_df() -> pd.DataFrame:
    """Loads the 30-row sample products dataset."""
    return pd.read_csv(SAMPLE_30_CSV_PATH)

@pytest.fixture
def uploaded_30_row_dataset_id():
    """Uploads the 30-row dataset and yields the dataset ID."""
    with open(SAMPLE_30_CSV_PATH, "rb") as f:
        file_bytes = f.read()
    files = {"file": ("sample_30_products.csv", io.BytesIO(file_bytes), "text/csv")}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    return data["dataset_id"]

def test_health_check():
    """Verify GET /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()

def test_dataset_upload_30_rows(uploaded_30_row_dataset_id):
    """Verify upload and profile of 30-row dataset."""
    response = client.get(f"/api/dataset/{uploaded_30_row_dataset_id}")
    assert response.status_code == 200
    profile = response.json()
    assert profile["row_count"] == 30
    assert "Revenue" in profile["numeric_columns"]
    assert "Product" in profile["categorical_columns"]

def test_data_agent_returns_phone_11000_on_30_row_dataset():
    """Verify Data Agent (Pandas) returns Phone = 11000 for the 30-row sample dataset."""
    df = get_30_row_df()
    plan = AnalysisPlan(
        objective="Find product with highest revenue",
        metric="Revenue",
        operation="sum",
        group_by=["Product"],
        sort=SortConfig(column="Revenue", direction="desc"),
        limit=1
    )
    result = data_agent.execute(df, plan)
    assert result.status == "success"
    assert result.agent == "Data Agent"
    assert result.engine == "Pandas"
    assert len(result.calculated_values) == 1
    top_record = result.calculated_values[0]
    assert top_record["Product"] == "Phone"
    assert float(top_record["Revenue"]) == 11000.0

def test_sql_agent_returns_phone_11000_on_30_row_dataset():
    """Verify SQL Agent (DuckDB) returns Phone = 11000 for the 30-row sample dataset."""
    df = get_30_row_df()
    plan = AnalysisPlan(
        objective="Find product with highest revenue",
        metric="Revenue",
        operation="sum",
        group_by=["Product"],
        sort=SortConfig(column="Revenue", direction="desc"),
        limit=1
    )
    result = sql_agent.execute(df, plan)
    assert result.status == "success"
    assert result.agent == "SQL Agent"
    assert "SELECT" in result.generated_sql
    assert "GROUP BY" in result.generated_sql
    assert len(result.calculated_values) == 1
    top_record = result.calculated_values[0]
    assert top_record["Product"] == "Phone"
    assert float(top_record["Revenue"]) == 11000.0

def test_cross_verification_reports_agreement_on_30_row_dataset():
    """Verify cross-engine verification confirms mathematical parity between Pandas and DuckDB."""
    df = get_30_row_df()
    plan = AnalysisPlan(
        objective="Find product with highest revenue",
        metric="Revenue",
        operation="sum",
        group_by=["Product"],
        sort=SortConfig(column="Revenue", direction="desc"),
        limit=5
    )
    data_res = data_agent.execute(df, plan)
    sql_res = sql_agent.execute(df, plan)
    verification = compare_agent_results(data_res, sql_res, plan)

    assert verification.agree is True
    assert verification.status == "verified"
    assert verification.discrepancy is None
    assert verification.confidence == 1.0
    assert verification.compared_results["pandas"][0]["Product"] == "Phone"
    assert verification.compared_results["sql"][0]["Product"] == "Phone"
    assert float(verification.compared_results["pandas"][0]["Revenue"]) == 11000.0
    assert float(verification.compared_results["sql"][0]["Revenue"]) == 11000.0

def test_destructive_sql_remains_blocked():
    """Verify that destructive SQL (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE) is strictly blocked."""
    destructive_commands = [
        "DROP TABLE dataset;",
        "DELETE FROM dataset WHERE 1=1;",
        "INSERT INTO dataset VALUES ('Phone', 50000);",
        "UPDATE dataset SET Revenue = 0;",
        "ALTER TABLE dataset DROP COLUMN Revenue;",
        "TRUNCATE TABLE dataset;",
        "SELECT * FROM dataset; DROP TABLE dataset;",
        "EXEC sp_executesql 'SELECT 1';",
    ]
    for cmd in destructive_commands:
        with pytest.raises(ValueError):
            sql_service.validate_sql(cmd)

def test_api_analyze_end_to_end_30_row_dataset(uploaded_30_row_dataset_id):
    """Verify end-to-end /api/analyze execution: Manager -> Data Agent + SQL Agent -> Cross-Verification."""
    payload = {
        "dataset_id": uploaded_30_row_dataset_id,
        "question": "Which product generated the most revenue?"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Plan
    assert "plan" in data
    assert data["plan"]["metric"] == "Revenue"
    assert "Product" in data["plan"]["group_by"]

    # 2. Data Agent (Pandas)
    assert data["analysis"]["agent"] == "Data Agent"
    assert data["analysis"]["engine"] == "Pandas"
    assert data["analysis"]["calculated_values"][0]["Product"] == "Phone"
    assert float(data["analysis"]["calculated_values"][0]["Revenue"]) == 11000.0

    # 3. SQL Agent (DuckDB)
    assert data["sql_analysis"]["agent"] == "SQL Agent"
    assert data["sql_analysis"]["engine"] in ["DuckDB", "SQLite (fallback)"]
    assert "SELECT" in data["sql_analysis"]["generated_sql"]
    assert data["sql_analysis"]["calculated_values"][0]["Product"] == "Phone"
    assert float(data["sql_analysis"]["calculated_values"][0]["Revenue"]) == 11000.0

    # 4. Cross-Verification
    assert data["verification"]["agree"] is True
    assert data["verification"]["status"] == "verified"
    assert data["verification"]["discrepancy"] is None

    # 5. Answer & Evidence
    assert "Phone" in data["answer"] or "11,000" in data["answer"]
    assert any("Cross-Engine Verification" in ev for ev in data["evidence"])
    assert any("SQL Execution" in ev for ev in data["evidence"])

def test_missing_column_graceful_handling():
    """Verify Data Agent gracefully handles columns not in dataset."""
    df = get_30_row_df()
    plan = AnalysisPlan(
        objective="Query non-existent column",
        metric="NonExistentMetric",
        operation="sum",
        group_by=["NonExistentDimension"],
        limit=5
    )
    result = data_agent.execute(df, plan)
    assert result.status == "success"

def test_invalid_dataset_id():
    """Verify 404 error on nonexistent dataset."""
    response = client.get("/api/dataset/non-existent-id-99999")
    assert response.status_code == 404

    payload = {
        "dataset_id": "non-existent-id-99999",
        "question": "What is the revenue?"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 404
