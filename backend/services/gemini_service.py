import os
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
from backend.models.schemas import AnalysisPlan, FilterCondition, SortConfig
from backend.models.responses import DataAgentResult

logger = logging.getLogger("gemini_service")

class GeminiService:
    """
    Handles natural language understanding and analysis plan generation.
    Strictly constrained:
    - Never receives raw full datasets (only column names and types).
    - Never executes arbitrary code.
    - Never fabricates numerical findings.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize google.genai Client: {e}")

    def generate_analysis_plan(self, question: str, schema_summary: Dict[str, Any]) -> AnalysisPlan:
        """
        Uses Gemini to understand the user's analytical question and output a declarative AnalysisPlan.
        Falls back to intelligent schema-aware heuristics if Gemini is unavailable.
        """
        if self._client:
            try:
                plan = self._gemini_plan(question, schema_summary)
                if plan:
                    return plan
            except Exception as e:
                logger.error(f"Gemini plan generation error: {e}. Falling back to deterministic planner.")

        # Fallback deterministic planner
        return self._heuristic_plan(question, schema_summary)

    def _gemini_plan(self, question: str, schema_summary: Dict[str, Any]) -> Optional[AnalysisPlan]:
        """Calls Gemini API with structured output schema for the analysis plan."""
        system_instruction = (
            "You are the Manager Agent of AutonomousAI. "
            "Your job is to translate a user's business question into a STRICT declarative data analysis plan for a Pandas Data Agent. "
            "You MUST select columns that actually exist in the schema provided. "
            "Return valid JSON matching the exact schema."
        )

        prompt = f"""
Dataset Schema Summary:
- Numeric Columns: {schema_summary.get('numeric_columns', [])}
- Categorical Columns: {schema_summary.get('categorical_columns', [])}
- Date Columns: {schema_summary.get('date_columns', [])}
- Column Profiles: {schema_summary.get('columns_brief', [])}

User Question:
"{question}"

Generate the JSON AnalysisPlan:
- objective: short summary of what is being investigated
- metric: the numeric column to measure (e.g. 'Gross_Revenue'), or None if counting
- operation: 'sum', 'mean', 'median', 'min', 'max', 'count', 'value_counts', or 'describe'
- group_by: list of categorical columns to aggregate across (e.g. ['Product_Name'] or ['Region'])
- sort: {{"column": "<metric or dimension>", "direction": "desc" or "asc"}}
- limit: integer for top-N results (e.g. 1, 5, 10), or None
- filters: list of {{"column": "...", "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"contains", "value": ...}}
"""

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "system_instruction": system_instruction,
                    "response_mime_type": "application/json",
                }
            )

            raw_text = response.text
            data = json.loads(raw_text)
            return AnalysisPlan(**data)
        except Exception as e:
            logger.warning(f"Failed to parse Gemini output into AnalysisPlan: {e}")
            return None

    def _heuristic_plan(self, question: str, schema_summary: Dict[str, Any]) -> AnalysisPlan:
        """
        Deterministic, schema-aware heuristic fallback for question interpretation.
        Guarantees that queries like 'Which product generated the most revenue?' always work.
        """
        q_lower = question.lower()
        num_cols = schema_summary.get("numeric_columns", [])
        cat_cols = schema_summary.get("categorical_columns", [])

        # 1. Identify Target Metric
        selected_metric = None
        for col in num_cols:
            col_l = col.lower()
            if col_l in q_lower or any(word in q_lower for word in col_l.split("_")):
                selected_metric = col
                break
        if not selected_metric:
            # Common aliases
            if any(term in q_lower for term in ["revenue", "sales", "gross", "income", "money", "dollar", "amount"]):
                for col in num_cols:
                    if any(t in col.lower() for t in ["rev", "sales", "amount", "total", "price"]):
                        selected_metric = col
                        break
            elif any(term in q_lower for term in ["unit", "volume", "sold", "quantity", "count", "items"]):
                for col in num_cols:
                    if any(t in col.lower() for t in ["unit", "qty", "quantity", "count", "volume"]):
                        selected_metric = col
                        break
        if not selected_metric and num_cols:
            selected_metric = num_cols[0]

        # 2. Identify Group-By Dimension
        selected_dimension = []
        for col in cat_cols:
            col_l = col.lower()
            if col_l in q_lower or any(word in q_lower for word in col_l.split("_")):
                selected_dimension.append(col)
                break
        if not selected_dimension:
            if any(term in q_lower for term in ["product", "item", "sku", "title", "name"]):
                for col in cat_cols:
                    if any(t in col.lower() for t in ["product", "item", "name", "title", "sku"]):
                        selected_dimension.append(col)
                        break
            elif any(term in q_lower for term in ["region", "country", "state", "city", "location"]):
                for col in cat_cols:
                    if any(t in col.lower() for t in ["region", "country", "location", "territory"]):
                        selected_dimension.append(col)
                        break
            elif any(term in q_lower for term in ["category", "type", "department", "segment"]):
                for col in cat_cols:
                    if any(t in col.lower() for t in ["cat", "type", "dept", "segment"]):
                        selected_dimension.append(col)
                        break
        if not selected_dimension and cat_cols:
            selected_dimension = [cat_cols[0]]

        # 3. Determine Operation & Sorting
        operation = "sum"
        if any(term in q_lower for term in ["average", "avg", "mean"]):
            operation = "mean"
        elif any(term in q_lower for term in ["median"]):
            operation = "median"
        elif any(term in q_lower for term in ["lowest", "least", "min", "bottom"]):
            operation = "sum"
            sort_dir = "asc"
        else:
            sort_dir = "desc"

        # 4. Determine Limit (Top-N)
        limit = 10
        if any(term in q_lower for term in ["most", "highest", "best", "top product", "which product"]):
            limit = 1
        elif "top 5" in q_lower:
            limit = 5
        elif "top 3" in q_lower:
            limit = 3

        sort_col = selected_metric if selected_metric else (selected_dimension[0] if selected_dimension else None)

        return AnalysisPlan(
            objective=f"Analyze {selected_metric or 'records'} grouped by {', '.join(selected_dimension) or 'dataset'}",
            metric=selected_metric,
            operation=operation,
            group_by=selected_dimension,
            sort=SortConfig(column=sort_col, direction=sort_dir) if sort_col else None,
            limit=limit,
            filters=[],
            explanation="Heuristic plan derived from dataset schema matching user question keywords."
        )

    def explain_results(
        self,
        question: str,
        plan: AnalysisPlan,
        analysis_result: DataAgentResult
    ) -> Tuple[str, List[str]]:
        """
        Generates natural language answer and evidence points based STRICTLY on calculated Pandas results.
        """
        values_repr = analysis_result.calculated_values

        if self._client:
            try:
                system_instruction = (
                    "You are the Reporting Analyst for AutonomousAI. "
                    "Your role is to explain DETERMINISTIC PANDAS DATA RESULTS to an executive user. "
                    "CRITICAL: You must cite only the numbers provided in the calculation result. "
                    "NEVER fabricate, extrapolate, or hallucinate any number. "
                    "Return valid JSON containing: 'answer' (string) and 'evidence' (list of strings)."
                )

                prompt = f"""
User Question: "{question}"
Analysis Plan Executed: {plan.model_dump_json()}
Calculated Pandas Result:
{json.dumps(values_repr, default=str)}

Respond with JSON:
{{
  "answer": "Clear, direct, factual answer stating the exact result",
  "evidence": ["Bullet 1 with exact numerical fact", "Bullet 2 with context/percentage/rank"]
}}
"""
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "response_mime_type": "application/json",
                    }
                )
                parsed = json.loads(response.text)
                return parsed.get("answer", ""), parsed.get("evidence", [])
            except Exception as e:
                logger.warning(f"Gemini explanation generation failed: {e}. Using deterministic narrative.")

        # Deterministic narrative fallback
        return self._deterministic_narrative(question, plan, analysis_result)

    def _deterministic_narrative(
        self,
        question: str,
        plan: AnalysisPlan,
        analysis_result: DataAgentResult
    ) -> Tuple[str, List[str]]:
        """Generates factual narrative without requiring external LLM API."""
        vals = analysis_result.calculated_values

        if isinstance(vals, list) and len(vals) > 0:
            top_item = vals[0]
            metric_key = plan.metric or "Value"
            dim_key = plan.group_by[0] if plan.group_by else "Item"

            dim_val = top_item.get(dim_key, "Top record")
            metric_val = top_item.get(metric_key, top_item.get("value", 0))

            if isinstance(metric_val, (int, float)):
                formatted_metric = f"${metric_val:,.2f}" if "rev" in metric_key.lower() or "price" in metric_key.lower() else f"{metric_val:,.2f}"
            else:
                formatted_metric = str(metric_val)

            answer = (
                f"Based on deterministic calculation across {analysis_result.row_count_analyzed:,} dataset records, "
                f"**{dim_val}** generated the highest {metric_key.replace('_', ' ')} with a total of **{formatted_metric}**."
            )

            evidence = [
                f"Top Rank: {dim_val} with {metric_key} = {formatted_metric}.",
                f"Aggregation: Grouped by '{dim_key}' using Pandas {plan.operation.upper()}.",
                f"Data Scope: Verified across {analysis_result.row_count_analyzed:,} rows in {analysis_result.execution_time_ms:.2f}ms."
            ]

            if len(vals) > 1:
                second = vals[1]
                second_dim = second.get(dim_key, "")
                second_val = second.get(metric_key, "")
                evidence.append(f"Second Rank: {second_dim} ({metric_key} = {second_val}).")

            return answer, evidence

        if isinstance(vals, dict):
            return (
                f"Analysis completed successfully. Summary metric: {json.dumps(vals, default=str)}",
                [f"Calculated {plan.operation} for {plan.metric or 'records'}."]
            )

        return (
            f"Calculated result for '{question}': {str(vals)}",
            [f"Operation: {plan.operation} on {plan.metric}."]
        )

# Singleton instance
gemini_service = GeminiService()
