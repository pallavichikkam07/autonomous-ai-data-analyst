import logging
from typing import List, Any
import pandas as pd
from backend.models.schemas import AnalysisPlan, FilterCondition
from backend.models.responses import SQLAgentResult
from backend.services.sql_service import sql_service

logger = logging.getLogger("sql_agent")

class SQLAgent:
    """
    SQL Agent (Stage 2):
    - Receives dataset DataFrame and declarative AnalysisPlan from Manager Agent.
    - Translates the plan into safe, deterministic analytical SQL (DuckDB).
    - Guarantees 100% read-only execution directly against real data records.
    - Zero eval(), zero exec(), zero arbitrary code generation.
    """

    SUPPORTED_OPERATIONS = {
        "sum": "SUM",
        "mean": "AVG",
        "avg": "AVG",
        "median": "MEDIAN",
        "min": "MIN",
        "max": "MAX",
        "count": "COUNT",
    }

    def __init__(self):
        self.name = "SQL Agent"
        self.role = "Deterministic DuckDB Analytical Engine"

    def _quote_identifier(self, identifier: str) -> str:
        """Safely quotes an identifier (column or table name) to prevent SQL injection."""
        escaped = identifier.replace('"', '""')
        return f'"{escaped}"'

    def _format_literal(self, value: Any) -> str:
        """Safely formats a literal value for SQL comparison."""
        if value is None:
            return "NULL"
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, bool):
            return "TRUE" if value else "FALSE"
        # String literal with single quotes escaped
        clean_str = str(value).replace("'", "''")
        return f"'{clean_str}'"

    def generate_sql(self, plan: AnalysisPlan, available_columns: List[str]) -> str:
        """
        Translates declarative AnalysisPlan into safe analytical SELECT SQL.
        Only references columns that actually exist in the dataset.
        """
        cols_lower = {col.lower(): col for col in available_columns}

        # 1. Determine Aggregation Function
        op_key = plan.operation.lower() if plan.operation else "sum"
        agg_func = self.SUPPORTED_OPERATIONS.get(op_key, "SUM")

        # Fallback for median if running on SQLite fallback engine
        if agg_func == "MEDIAN" and not sql_service.is_duckdb_available:
            agg_func = "AVG"

        # 2. Validate & Quote Target Metric
        metric_col = None
        if plan.metric:
            cleaned_m = plan.metric.strip().lower()
            if cleaned_m in cols_lower:
                metric_col = cols_lower[cleaned_m]

        # 3. Validate & Quote Dimensions (GROUP BY)
        group_cols: List[str] = []
        for g in plan.group_by:
            cleaned_g = g.strip().lower()
            if cleaned_g in cols_lower:
                group_cols.append(cols_lower[cleaned_g])

        # 4. Construct SELECT clause
        select_parts: List[str] = []
        for g_col in group_cols:
            select_parts.append(self._quote_identifier(g_col))

        if metric_col:
            quoted_metric = self._quote_identifier(metric_col)
            # Use CAST to ensure metric is treated as numeric
            select_parts.append(f'{agg_func}(CAST({quoted_metric} AS DOUBLE)) AS {quoted_metric}')
        elif not group_cols:
            select_parts.append("COUNT(*) AS \"total_records\"")
        elif not metric_col and group_cols:
            select_parts.append("COUNT(*) AS \"count\"")

        select_clause = "SELECT " + ", ".join(select_parts)
        from_clause = "FROM dataset"

        # 5. Construct WHERE clause (Filters)
        where_conditions: List[str] = []

        if plan.filters:
            for f in plan.filters:
                col_clean = f.column.strip().lower()
                if col_clean not in cols_lower:
                    continue
                actual_col = cols_lower[col_clean]
                quoted_col = self._quote_identifier(actual_col)
                op = f.operator.lower()

                if op == "eq":
                    where_conditions.append(f"{quoted_col} = {self._format_literal(f.value)}")
                elif op == "neq":
                    where_conditions.append(f"{quoted_col} != {self._format_literal(f.value)}")
                elif op == "gt":
                    where_conditions.append(f"CAST({quoted_col} AS DOUBLE) > {self._format_literal(f.value)}")
                elif op == "gte":
                    where_conditions.append(f"CAST({quoted_col} AS DOUBLE) >= {self._format_literal(f.value)}")
                elif op == "lt":
                    where_conditions.append(f"CAST({quoted_col} AS DOUBLE) < {self._format_literal(f.value)}")
                elif op == "lte":
                    where_conditions.append(f"CAST({quoted_col} AS DOUBLE) <= {self._format_literal(f.value)}")
                elif op == "contains":
                    clean_pattern = str(f.value).replace("'", "''")
                    where_conditions.append(f"CAST({quoted_col} AS VARCHAR) LIKE '%{clean_pattern}%'")
                elif op == "in" and isinstance(f.value, (list, tuple)):
                    formatted_items = ", ".join(self._format_literal(v) for v in f.value)
                    where_conditions.append(f"{quoted_col} IN ({formatted_items})")

        # Date filter support
        if plan.date_column and plan.date_filter:
            date_clean = plan.date_column.strip().lower()
            if date_clean in cols_lower:
                actual_date_col = cols_lower[date_clean]
                quoted_date_col = self._quote_identifier(actual_date_col)
                filter_val = plan.date_filter.strip().replace("'", "''")
                where_conditions.append(f"CAST({quoted_date_col} AS VARCHAR) LIKE '%{filter_val}%'")

        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)

        # 6. Construct GROUP BY clause
        group_by_clause = ""
        if group_cols:
            quoted_groups = [self._quote_identifier(c) for c in group_cols]
            group_by_clause = "GROUP BY " + ", ".join(quoted_groups)

        # 7. Construct ORDER BY clause
        order_by_clause = ""
        sort_col = None
        sort_dir = "DESC"

        if plan.sort and plan.sort.column:
            sort_cand = plan.sort.column.strip().lower()
            if sort_cand in cols_lower:
                sort_col = cols_lower[sort_cand]
            elif metric_col and sort_cand == metric_col.lower():
                sort_col = metric_col
            if plan.sort.direction and plan.sort.direction.upper() in ["ASC", "DESC"]:
                sort_dir = plan.sort.direction.upper()
        elif metric_col:
            sort_col = metric_col
            sort_dir = "DESC"

        if sort_col:
            order_by_clause = f"ORDER BY {self._quote_identifier(sort_col)} {sort_dir}"

        # 8. Construct LIMIT clause
        limit_clause = ""
        if plan.limit and plan.limit > 0:
            limit_clause = f"LIMIT {int(plan.limit)}"

        # Assemble full query
        query_parts = [select_clause, from_clause]
        if where_clause:
            query_parts.append(where_clause)
        if group_by_clause:
            query_parts.append(group_by_clause)
        if order_by_clause:
            query_parts.append(order_by_clause)
        if limit_clause:
            query_parts.append(limit_clause)

        return " ".join(query_parts) + ";"

    def execute(self, df: pd.DataFrame, plan: AnalysisPlan) -> SQLAgentResult:
        """
        Generates and executes SQL query on DuckDB against the input DataFrame.
        Returns validated SQLAgentResult.
        """
        available_columns = [str(c) for c in df.columns]
        columns_used: List[str] = []

        if plan.metric and plan.metric in available_columns:
            columns_used.append(plan.metric)
        for g in plan.group_by:
            if g in available_columns and g not in columns_used:
                columns_used.append(g)

        # Generate SQL
        sql_query = self.generate_sql(plan, available_columns)
        logger.info(f"Generated SQL: {sql_query}")

        # Execute query via SQLService
        records, execution_time_ms, engine_name = sql_service.execute_query(df, sql_query)

        operation_desc = f"{plan.operation.upper()} {plan.metric or 'records'}"
        if plan.group_by:
            operation_desc += f" grouped by {', '.join(plan.group_by)}"

        summary_stats = {
            "total_rows_scanned": len(df),
            "rows_returned": len(records),
            "sql_engine": engine_name
        }

        return SQLAgentResult(
            status="success",
            agent="SQL Agent",
            engine=engine_name,
            operation_performed=operation_desc,
            generated_sql=sql_query,
            calculated_values=records,
            summary_statistics=summary_stats,
            rows_analyzed=len(df),
            columns_used=columns_used,
            execution_time_ms=execution_time_ms
        )

# Singleton instance
sql_agent = SQLAgent()
