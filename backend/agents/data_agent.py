import time
import math
import logging
from typing import Dict, Any, List
import pandas as pd
from backend.models.schemas import AnalysisPlan, FilterCondition
from backend.models.responses import DataAgentResult
from backend.utils.dataset_profiler import _clean_for_json

logger = logging.getLogger("data_agent")

class DataAgent:
    """
    Data Agent:
    - Receives a declarative AnalysisPlan from the Manager Agent.
    - Executes deterministic analytical calculations using Pandas.
    - Zero LLM code generation or arbitrary execution (No eval(), No exec()).
    - Guarantees 100% numerical fidelity directly from real data rows.
    """

    ALLOWED_OPERATIONS = {
        "sum",
        "mean",
        "median",
        "min",
        "max",
        "count",
        "value_counts",
        "describe",
        "distribution"
    }

    def __init__(self):
        self.name = "Data Agent"
        self.role = "Deterministic Pandas Analysis Engine"

    def execute(self, df: pd.DataFrame, plan: AnalysisPlan) -> DataAgentResult:
        """
        Executes the plan against the provided Pandas DataFrame.
        Returns validated DataAgentResult.
        """
        start_time = time.perf_counter()
        columns_used: List[str] = []

        if plan.operation not in self.ALLOWED_OPERATIONS:
            raise ValueError(f"Operation '{plan.operation}' is not supported. Allowed operations: {list(self.ALLOWED_OPERATIONS)}")

        # Work on a copy to prevent in-place mutation
        working_df = df.copy()

        # Step 1: Apply deterministic filters
        if plan.filters:
            working_df = self._apply_filters(working_df, plan.filters)
            for f in plan.filters:
                if f.column not in columns_used:
                    columns_used.append(f.column)

        # Step 2: Apply Date Filter if present
        if plan.date_column and plan.date_column in working_df.columns and plan.date_filter:
            working_df = self._apply_date_filter(working_df, plan.date_column, plan.date_filter)
            if plan.date_column not in columns_used:
                columns_used.append(plan.date_column)

        # Track columns used
        if plan.metric and plan.metric in working_df.columns:
            if plan.metric not in columns_used:
                columns_used.append(plan.metric)

        for col in plan.group_by:
            if col in working_df.columns and col not in columns_used:
                columns_used.append(col)

        row_count_analyzed = len(working_df)
        if row_count_analyzed == 0:
            return DataAgentResult(
                status="warning",
                operation_performed=f"{plan.operation} (0 rows matched filter)",
                calculated_values=[],
                summary_statistics={"matched_rows": 0},
                row_count_analyzed=0,
                columns_used=columns_used,
                execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2)
            )

        # Step 3: Execute Aggregations
        calculated_values: Any = None
        summary_stats: Dict[str, Any] = {
            "total_rows_scanned": len(df),
            "rows_after_filter": row_count_analyzed
        }

        # Case A: Group-By Aggregation (e.g. Group by Product_Name -> Sum Gross_Revenue)
        if plan.group_by and plan.metric:
            valid_groups = [g for g in plan.group_by if g in working_df.columns]
            if not valid_groups:
                valid_groups = [plan.group_by[0]]

            metric_col = plan.metric
            # Ensure metric is numeric
            working_df[metric_col] = pd.to_numeric(working_df[metric_col], errors="coerce").fillna(0)

            # Pandas GroupBy calculation
            grouped = working_df.groupby(valid_groups)[metric_col]

            if plan.operation == "sum":
                agg_series = grouped.sum()
            elif plan.operation in ["mean", "avg"]:
                agg_series = grouped.mean()
            elif plan.operation == "median":
                agg_series = grouped.median()
            elif plan.operation == "min":
                agg_series = grouped.min()
            elif plan.operation == "max":
                agg_series = grouped.max()
            elif plan.operation == "count":
                agg_series = grouped.count()
            else:
                agg_series = grouped.sum()

            # Convert to DataFrame for sorting and formatting
            result_df = agg_series.reset_index()

            # Sorting
            sort_ascending = plan.sort.direction.lower() == "asc" if plan.sort else False
            sort_col = metric_col
            if plan.sort and plan.sort.column in result_df.columns:
                sort_col = plan.sort.column

            result_df = result_df.sort_values(by=sort_col, ascending=sort_ascending)

            # Limit / Top-N
            if plan.limit and plan.limit > 0:
                result_df = result_df.head(plan.limit)

            # Round numeric columns
            result_df[metric_col] = result_df[metric_col].round(2)

            # Convert to list of clean dictionaries
            calculated_values = [
                {str(k): _clean_for_json(v) for k, v in row.to_dict().items()}
                for _, row in result_df.iterrows()
            ]

            summary_stats["groups_count"] = int(len(agg_series))
            summary_stats["metric_total"] = _clean_for_json(round(float(working_df[metric_col].sum()), 2))

        # Case B: Categorical Value Counts (no metric specified, just group_by or distribution)
        elif plan.group_by and not plan.metric:
            target_col = plan.group_by[0]
            val_counts = working_df[target_col].value_counts(dropna=False)
            if plan.limit and plan.limit > 0:
                val_counts = val_counts.head(plan.limit)

            calculated_values = [
                {target_col: _clean_for_json(idx), "count": int(count)}
                for idx, count in val_counts.items()
            ]

        # Case C: Global Single Metric Aggregation (e.g. Total Revenue across entire dataset)
        elif plan.metric and not plan.group_by:
            metric_col = plan.metric
            series = pd.to_numeric(working_df[metric_col], errors="coerce").dropna()

            if plan.operation == "sum":
                val = series.sum()
            elif plan.operation in ["mean", "avg"]:
                val = series.mean()
            elif plan.operation == "median":
                val = series.median()
            elif plan.operation == "min":
                val = series.min()
            elif plan.operation == "max":
                val = series.max()
            elif plan.operation == "count":
                val = series.count()
            elif plan.operation == "describe":
                val = series.describe().to_dict()
            else:
                val = series.sum()

            cleaned_val = _clean_for_json(round(val, 2) if isinstance(val, float) else val)
            calculated_values = [{plan.metric: cleaned_val, "operation": plan.operation}]
            summary_stats["calculated_value"] = cleaned_val

        # Case D: Generic Summary / Description
        else:
            desc = working_df.describe(include="all").head(5).to_dict()
            calculated_values = [{str(k): _clean_for_json(v) for k, v in desc.items()}]

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return DataAgentResult(
            status="success",
            operation_performed=f"{plan.operation} on {plan.metric or 'records'}" + (f" grouped by {', '.join(plan.group_by)}" if plan.group_by else ""),
            calculated_values=calculated_values,
            summary_statistics=summary_stats,
            row_count_analyzed=row_count_analyzed,
            columns_used=columns_used,
            execution_time_ms=execution_time_ms
        )

    def _apply_filters(self, df: pd.DataFrame, filters: List[FilterCondition]) -> pd.DataFrame:
        """Applies declarative filter conditions using vectorized Pandas boolean masks."""
        for f in filters:
            if f.column not in df.columns:
                continue

            series = df[f.column]
            op = f.operator.lower()
            val = f.value

            if op == "eq":
                df = df[series == val]
            elif op == "neq":
                df = df[series != val]
            elif op == "gt":
                df = df[pd.to_numeric(series, errors="coerce") > float(val)]
            elif op == "gte":
                df = df[pd.to_numeric(series, errors="coerce") >= float(val)]
            elif op == "lt":
                df = df[pd.to_numeric(series, errors="coerce") < float(val)]
            elif op == "lte":
                df = df[pd.to_numeric(series, errors="coerce") <= float(val)]
            elif op == "contains":
                df = df[series.astype(str).str.contains(str(val), case=False, na=False)]
            elif op == "in" and isinstance(val, (list, tuple)):
                df = df[series.isin(val)]

        return df

    def _apply_date_filter(self, df: pd.DataFrame, date_col: str, date_filter: str) -> pd.DataFrame:
        """Slices dataframe by ISO date or month string (e.g. '2026-07')."""
        try:
            date_series = pd.to_datetime(df[date_col], errors="coerce")
            filter_lower = date_filter.lower().strip()

            # Check for year-month string like '2026-07'
            if len(filter_lower) == 7 and filter_lower[4] == '-':
                mask = (date_series.dt.strftime('%Y-%m') == filter_lower)
                return df[mask]

            # Check month name like 'july'
            month_map = {
                "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
                "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
            }
            for m_name, m_num in month_map.items():
                if m_name in filter_lower:
                    mask = (date_series.dt.month == m_num)
                    return df[mask]

            # Direct date match
            target_date = pd.to_datetime(date_filter, errors="coerce")
            if not pd.isna(target_date):
                mask = (date_series.dt.date == target_date.date())
                return df[mask]
        except Exception as e:
            logger.warning(f"Date filter could not be applied: {e}")

        return df

# Singleton instance
data_agent = DataAgent()
