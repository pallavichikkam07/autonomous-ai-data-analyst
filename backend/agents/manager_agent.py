import logging
from typing import Dict, Any, List
from backend.models.schemas import AnalysisPlan, DatasetProfile
from backend.services.gemini_service import gemini_service

logger = logging.getLogger("manager_agent")

class ManagerAgent:
    """
    Manager Agent (Orchestrator):
    - Interprets the user's analytical business question.
    - Inspects the dataset schema without reading raw rows into LLM context.
    - Formulates a structured, declarative AnalysisPlan for the Data Agent.
    - Strictly produces a Pydantic plan (NEVER executable Python code).
    """

    def __init__(self):
        self.name = "Manager Agent"
        self.role = "Analytical Strategy & Query Decomposition"

    def create_plan(self, question: str, profile: DatasetProfile) -> AnalysisPlan:
        """
        Translates a natural language question and dataset profile into an AnalysisPlan.
        Validates that all columns referenced in the plan actually exist in the dataset.
        """
        # Build concise schema summary for LLM context
        columns_brief = [
            {
                "name": col.name,
                "dtype": col.dtype,
                "sample_values": col.sample_values[:3]
            }
            for col in profile.columns
        ]

        schema_summary = {
            "filename": profile.filename,
            "row_count": profile.row_count,
            "numeric_columns": profile.numeric_columns,
            "categorical_columns": profile.categorical_columns,
            "date_columns": profile.date_columns,
            "columns_brief": columns_brief
        }

        # Request structured plan from Gemini service
        plan = gemini_service.generate_analysis_plan(question, schema_summary)

        # Validate and sanitize the plan against real dataset columns
        validated_plan = self._validate_and_sanitize_plan(plan, profile)
        return validated_plan

    def _validate_and_sanitize_plan(self, plan: AnalysisPlan, profile: DatasetProfile) -> AnalysisPlan:
        """
        Ensures all columns referenced in the plan exist in the dataset.
        Handles case-insensitive column matching.
        """
        existing_cols = {col.name.lower(): col.name for col in profile.columns}

        # Validate Metric
        if plan.metric:
            metric_clean = plan.metric.strip().lower()
            if metric_clean in existing_cols:
                plan.metric = existing_cols[metric_clean]
            else:
                # Find best fuzzy/numeric match or fallback
                matched = None
                for col in profile.numeric_columns:
                    if metric_clean in col.lower() or col.lower() in metric_clean:
                        matched = col
                        break
                plan.metric = matched or (profile.numeric_columns[0] if profile.numeric_columns else None)

        # Validate Group By Dimensions
        sanitized_group_by: List[str] = []
        for dim in plan.group_by:
            dim_clean = dim.strip().lower()
            if dim_clean in existing_cols:
                sanitized_group_by.append(existing_cols[dim_clean])
            else:
                for col in profile.categorical_columns:
                    if dim_clean in col.lower() or col.lower() in dim_clean:
                        sanitized_group_by.append(col)
                        break

        plan.group_by = sanitized_group_by

        # Validate Sort Column
        if plan.sort and plan.sort.column:
            sort_clean = plan.sort.column.strip().lower()
            if sort_clean in existing_cols:
                plan.sort.column = existing_cols[sort_clean]
            elif plan.metric:
                plan.sort.column = plan.metric

        # Validate Filters
        sanitized_filters = []
        for flt in plan.filters:
            flt_clean = flt.column.strip().lower()
            if flt_clean in existing_cols:
                flt.column = existing_cols[flt_clean]
                sanitized_filters.append(flt)

        plan.filters = sanitized_filters
        return plan

# Singleton instance
manager_agent = ManagerAgent()
