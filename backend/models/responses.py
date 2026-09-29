from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from backend.models.schemas import AnalysisPlan, DatasetProfile

class UploadResponse(BaseModel):
    """Response returned upon successful file upload and profiling."""
    status: str = "success"
    dataset_id: str
    filename: str
    rows: int
    columns: int
    profile: DatasetProfile

class AnalysisRequest(BaseModel):
    """User inquiry targeting an uploaded dataset."""
    dataset_id: str = Field(description="Unique ID of previously uploaded dataset")
    question: str = Field(description="Natural language business or data question")

class DataAgentResult(BaseModel):
    """Deterministic outputs computed by the Data Agent via Pandas."""
    status: str = "success"
    agent: str = "Data Agent"
    engine: str = "Pandas"
    operation_performed: str
    calculated_values: Any = Field(description="Structured records, summary series, or scalar values computed by Pandas")
    summary_statistics: Optional[Dict[str, Any]] = None
    row_count_analyzed: int
    columns_used: List[str]
    execution_time_ms: float

class SQLAgentResult(BaseModel):
    """Deterministic outputs computed by the SQL Agent via DuckDB."""
    status: str = "success"
    agent: str = "SQL Agent"
    engine: str = "DuckDB"
    operation_performed: str
    generated_sql: str = Field(description="Sanitized, read-only SQL query executed on DuckDB")
    calculated_values: Any = Field(description="Structured records returned by DuckDB query execution")
    summary_statistics: Optional[Dict[str, Any]] = None
    rows_analyzed: int
    columns_used: List[str]
    execution_time_ms: float

class CrossVerificationResult(BaseModel):
    """Cross-engine comparison between Pandas (Data Agent) and DuckDB (SQL Agent)."""
    agree: bool = Field(description="True if Pandas and DuckDB produced identical numerical results")
    status: str = Field(description="'verified' if engines agree, 'discrepancy' if different, 'error' if execution failed")
    comparison_metric: Optional[str] = Field(default=None, description="The primary metric or dimension compared")
    compared_results: Dict[str, Any] = Field(default_factory=dict, description="Side-by-side comparison of results from both engines")
    discrepancy: Optional[str] = Field(default=None, description="Detailed explanation of any discrepancy found, or None if fully agreed")
    confidence: float = Field(default=1.0, description="Verification confidence score (1.0 for full parity)")

class AnalysisResponse(BaseModel):
    """Unified response containing the full Manager -> Data Agent & SQL Agent lifecycle."""
    question: str
    plan: AnalysisPlan
    analysis: DataAgentResult = Field(description="Deterministic Pandas Data Agent calculation")
    sql_analysis: SQLAgentResult = Field(description="Deterministic DuckDB SQL Agent calculation")
    verification: CrossVerificationResult = Field(description="Cross-engine verification comparing Pandas and DuckDB results")
    answer: str = Field(description="Synthesized natural language explanation of the computed result")
    evidence: List[str] = Field(description="Bullet points of verified numerical evidence directly from engine output")
    agent: str = "Data Agent + SQL Agent"
    dataset_id: str
    execution_time_ms: float

class HealthResponse(BaseModel):
    """API Health Check response."""
    status: str = "ok"
    version: str = "1.0.0"
    service: str = "AutonomousAI Multi-Agent Backend"
    stage: str = "Stage 2 (Manager + Data Agent + SQL Agent)"
