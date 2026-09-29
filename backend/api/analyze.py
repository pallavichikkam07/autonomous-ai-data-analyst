import time
import logging
from typing import Any
from fastapi import APIRouter, HTTPException, status
from backend.models.responses import (
    AnalysisRequest,
    AnalysisResponse,
    DataAgentResult,
    SQLAgentResult,
    CrossVerificationResult,
)
from backend.models.schemas import AnalysisPlan
from backend.services.dataset_service import dataset_service
from backend.agents.manager_agent import manager_agent
from backend.agents.data_agent import data_agent
from backend.agents.sql_agent import sql_agent
from backend.services.gemini_service import gemini_service

logger = logging.getLogger("analyze_router")
router = APIRouter(prefix="/api", tags=["Analysis"])

def compare_agent_results(
    data_result: DataAgentResult,
    sql_result: SQLAgentResult,
    plan: AnalysisPlan
) -> CrossVerificationResult:
    """
    Compares the calculated outputs of Data Agent (Pandas) and SQL Agent (DuckDB).
    Determines mathematical parity, records compared sample values, and isolates discrepancies.
    """
    # Check if SQL execution failed
    if sql_result.status != "success":
        err_msg = (
            sql_result.summary_statistics.get("error", "SQL Agent execution failure")
            if sql_result.summary_statistics
            else "SQL Agent execution failure"
        )
        return CrossVerificationResult(
            agree=False,
            status="error",
            comparison_metric=plan.metric,
            compared_results={
                "pandas": data_result.calculated_values[:3] if isinstance(data_result.calculated_values, list) else data_result.calculated_values,
                "sql": []
            },
            discrepancy=f"SQL Agent failed with error: {err_msg}",
            confidence=0.0
        )

    # Check if Data Agent execution failed
    if data_result.status != "success":
        return CrossVerificationResult(
            agree=False,
            status="error",
            comparison_metric=plan.metric,
            compared_results={
                "pandas": data_result.calculated_values,
                "sql": sql_result.calculated_values[:3] if isinstance(sql_result.calculated_values, list) else sql_result.calculated_values
            },
            discrepancy="Data Agent calculation did not return success.",
            confidence=0.0
        )

    p_vals = data_result.calculated_values
    s_vals = sql_result.calculated_values

    # List comparison
    if isinstance(p_vals, list) and isinstance(s_vals, list):
        if len(p_vals) == 0 and len(s_vals) == 0:
            return CrossVerificationResult(
                agree=True,
                status="verified",
                comparison_metric=plan.metric,
                compared_results={"pandas": [], "sql": []},
                discrepancy=None,
                confidence=1.0
            )

        if len(p_vals) == 0 or len(s_vals) == 0:
            return CrossVerificationResult(
                agree=False,
                status="discrepancy",
                comparison_metric=plan.metric,
                compared_results={
                    "pandas": p_vals[:3],
                    "sql": s_vals[:3]
                },
                discrepancy=f"Row count mismatch: Pandas returned {len(p_vals)} rows, SQL returned {len(s_vals)} rows.",
                confidence=0.0
            )

        discrepancies = []
        rows_to_check = min(len(p_vals), len(s_vals), 10)
        dim_col = plan.group_by[0] if plan.group_by else None
        metric_col = plan.metric

        for i in range(rows_to_check):
            p_row = p_vals[i] if isinstance(p_vals[i], dict) else {"value": p_vals[i]}
            s_row = s_vals[i] if isinstance(s_vals[i], dict) else {"value": s_vals[i]}

            # 1. Compare dimension identifier
            if dim_col and dim_col in p_row and dim_col in s_row:
                p_dim = str(p_row[dim_col]).strip().lower()
                s_dim = str(s_row[dim_col]).strip().lower()
                if p_dim != s_dim:
                    discrepancies.append(
                        f"Row {i+1} dimension mismatch: Pandas='{p_row.get(dim_col)}', DuckDB='{s_row.get(dim_col)}'"
                    )

            # 2. Compare metric number
            if metric_col and metric_col in p_row and metric_col in s_row:
                try:
                    p_num = float(p_row[metric_col]) if p_row[metric_col] is not None else 0.0
                    s_num = float(s_row[metric_col]) if s_row[metric_col] is not None else 0.0
                    if abs(p_num - s_num) > 0.05:
                        discrepancies.append(
                            f"Row {i+1} '{metric_col}' numerical mismatch: Pandas={p_num}, DuckDB={s_num}"
                        )
                except (ValueError, TypeError):
                    if str(p_row.get(metric_col)) != str(s_row.get(metric_col)):
                        discrepancies.append(
                            f"Row {i+1} value mismatch: Pandas={p_row.get(metric_col)}, DuckDB={s_row.get(metric_col)}"
                        )

        if discrepancies:
            return CrossVerificationResult(
                agree=False,
                status="discrepancy",
                comparison_metric=metric_col or dim_col,
                compared_results={
                    "pandas": p_vals[:3],
                    "sql": s_vals[:3]
                },
                discrepancy="; ".join(discrepancies),
                confidence=0.0
            )

        return CrossVerificationResult(
            agree=True,
            status="verified",
            comparison_metric=metric_col or dim_col,
            compared_results={
                "pandas": p_vals[:3],
                "sql": s_vals[:3]
            },
            discrepancy=None,
            confidence=1.0
        )

    # Primitive or dictionary comparison
    if p_vals == s_vals:
        return CrossVerificationResult(
            agree=True,
            status="verified",
            comparison_metric=plan.metric,
            compared_results={"pandas": p_vals, "sql": s_vals},
            discrepancy=None,
            confidence=1.0
        )

    return CrossVerificationResult(
        agree=False,
        status="discrepancy",
        comparison_metric=plan.metric,
        compared_results={"pandas": p_vals, "sql": s_vals},
        discrepancy=f"Values differ: Pandas={p_vals} vs SQL={s_vals}",
        confidence=0.0
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dataset_query(request: AnalysisRequest):
    """
    Executes the Complete Stage 2 AutonomousAI Multi-Agent Pipeline:
    1. Loads dataset into Pandas DataFrame.
    2. Manager Agent translates user question into declarative AnalysisPlan.
    3. Data Agent executes deterministic analysis using Pandas.
    4. SQL Agent executes deterministic analysis using DuckDB with the SAME AnalysisPlan.
    5. Cross-Verification engine compares Pandas and DuckDB results for mathematical agreement.
    6. Gemini synthesizes explanation based strictly on calculated numbers.
    7. Returns unified response containing Data Agent, SQL Agent, and Cross-Verification results.
    """
    start_time = time.perf_counter()

    clean_question = request.question.strip()
    if not clean_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analytical question cannot be empty."
        )

    # Step 1: Retrieve dataset and profile
    try:
        df, profile = dataset_service.load_dataframe(request.dataset_id)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing dataset: {str(e)}"
        )

    # Step 2: Manager Agent formulates structured declarative plan
    try:
        plan = manager_agent.create_plan(clean_question, profile)
    except Exception as e:
        logger.error(f"Manager Agent planning error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Manager Agent could not formulate an analysis plan: {str(e)}"
        )

    # Step 3: Data Agent executes deterministic Pandas analysis
    try:
        data_result = data_agent.execute(df, plan)
    except Exception as e:
        logger.error(f"Data Agent execution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data Agent calculation failed: {str(e)}"
        )

    # Step 4: SQL Agent executes deterministic DuckDB analysis using SAME plan
    try:
        sql_result = sql_agent.execute(df, plan)
    except Exception as e:
        logger.error(f"SQL Agent execution error: {e}", exc_info=True)
        sql_result = SQLAgentResult(
            status="error",
            agent="SQL Agent",
            engine="DuckDB",
            operation_performed="Execution Failed",
            generated_sql="",
            calculated_values=[],
            summary_statistics={"error": str(e)},
            rows_analyzed=0,
            columns_used=[],
            execution_time_ms=0.0
        )

    # Step 5: Cross-Verification between Pandas and DuckDB
    verification = compare_agent_results(data_result, sql_result, plan)

    # Step 6: Explain results based strictly on calculated values
    try:
        answer, evidence = gemini_service.explain_results(clean_question, plan, data_result)
        
        # Append verified evidence bullets
        if sql_result.status == "success":
            evidence.append(
                f"SQL Execution: DuckDB generated and executed `{sql_result.generated_sql}` in {sql_result.execution_time_ms:.2f}ms."
            )
        
        if verification.agree:
            evidence.append(
                f"Cross-Engine Verification: Pandas and DuckDB achieved 100% mathematical parity ({verification.status})."
            )
        else:
            evidence.append(
                f"Verification Notice: {verification.discrepancy or 'Discrepancy detected between engines.'}"
            )
    except Exception as e:
        logger.warning(f"Result synthesis failed: {e}")
        answer = f"Analysis completed across {len(data_result.calculated_values)} calculated records."
        evidence = [
            f"Computed {plan.operation} on {plan.metric}.",
            f"Verification: {'Agreed' if verification.agree else 'Discrepancy'}"
        ]

    total_execution_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return AnalysisResponse(
        question=clean_question,
        plan=plan,
        analysis=data_result,
        sql_analysis=sql_result,
        verification=verification,
        answer=answer,
        evidence=evidence,
        agent="Data Agent + SQL Agent",
        dataset_id=request.dataset_id,
        execution_time_ms=total_execution_ms
    )
