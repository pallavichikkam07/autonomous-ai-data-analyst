import re
import time
import logging
from typing import List, Dict, Any, Tuple
import pandas as pd
from backend.utils.dataset_profiler import _clean_for_json

logger = logging.getLogger("sql_service")

# List of forbidden SQL keywords to prevent arbitrary DDL, DML, or administrative commands
FORBIDDEN_SQL_PATTERNS = [
    r"\bDROP\b",
    r"\bDELETE\b",
    r"\bUPDATE\b",
    r"\bINSERT\b",
    r"\bALTER\b",
    r"\bCREATE\b",
    r"\bTRUNCATE\b",
    r"\bREPLACE\b",
    r"\bATTACH\b",
    r"\bDETACH\b",
    r"\bCOPY\b",
    r"\bPRAGMA\b",
    r"\bCALL\b",
    r"\bEXPORT\b",
    r"\bIMPORT\b",
    r"\bINSTALL\b",
    r"\bLOAD\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bSET\b",
    r"\bSYSTEM\b",
    r"\bINTO\b",
]

class SQLService:
    """
    Manages secure SQL query execution against uploaded datasets using DuckDB.
    Guarantees:
    - Only read-only SELECT analytical queries.
    - Zero arbitrary code execution (no eval/exec).
    - Multi-statement injection prevention.
    - Seamless fallback to sqlite3 if duckdb module is not yet installed.
    """

    def __init__(self):
        self._duckdb_available = False
        try:
            import duckdb
            self._duckdb = duckdb
            self._duckdb_available = True
            logger.info("DuckDB engine initialized successfully.")
        except ImportError:
            self._duckdb = None
            logger.warning("DuckDB not installed in environment. Falling back to in-memory SQLite engine.")

    @property
    def is_duckdb_available(self) -> bool:
        return self._duckdb_available

    def validate_sql(self, sql_query: str) -> None:
        """
        Validates that the SQL query is strictly a read-only analytical SELECT query.
        Raises ValueError if unsafe syntax or keywords are detected.
        """
        clean_sql = sql_query.strip()
        if not clean_sql:
            raise ValueError("SQL query cannot be empty.")

        # Check for multiple statements (semicolon followed by non-whitespace)
        statements = [s.strip() for s in clean_sql.split(";") if s.strip()]
        if len(statements) > 1:
            raise ValueError("Multiple SQL statements are strictly forbidden.")

        # Enforce that query starts with SELECT
        first_statement = statements[0]
        if not re.match(r"^SELECT\b", first_statement, re.IGNORECASE):
            raise ValueError("Only read-only SELECT queries are permitted.")

        # Check for forbidden dangerous keywords
        for pattern in FORBIDDEN_SQL_PATTERNS:
            if re.search(pattern, first_statement, re.IGNORECASE):
                forbidden_word = pattern.replace(r"\b", "")
                raise ValueError(f"Dangerous SQL keyword '{forbidden_word}' is strictly forbidden.")

    def execute_query(self, df: pd.DataFrame, sql_query: str) -> Tuple[List[Dict[str, Any]], float, str]:
        """
        Executes a validated SQL query against the dataset.
        Returns:
            - calculated_values: List of records (row dicts)
            - execution_time_ms: Query execution duration in milliseconds
            - engine_used: 'DuckDB' or 'SQLite (fallback)'
        """
        # Step 1: Validate security
        self.validate_sql(sql_query)

        start_time = time.perf_counter()
        clean_sql = sql_query.strip().rstrip(";")

        # Step 2: Execute via DuckDB or fallback
        if self._duckdb_available:
            try:
                # In DuckDB, querying the registered DataFrame 'dataset' runs fully in-memory
                conn = self._duckdb.connect(database=":memory:")
                conn.register("dataset", df)
                result_df = conn.execute(clean_sql).df()
                engine_used = "DuckDB"
            except Exception as e:
                logger.error(f"DuckDB query execution error: {e}")
                raise ValueError(f"DuckDB execution error: {str(e)}")
        else:
            # Fallback to standard library sqlite3
            try:
                import sqlite3
                conn = sqlite3.connect(":memory:")
                df.to_sql("dataset", conn, index=False, if_exists="replace")
                result_df = pd.read_sql_query(clean_sql, conn)
                engine_used = "SQLite (fallback)"
            except Exception as e:
                logger.error(f"SQLite fallback query execution error: {e}")
                raise ValueError(f"SQL execution error: {str(e)}")

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Step 3: Format result safely for JSON serialization
        records: List[Dict[str, Any]] = []
        for _, row in result_df.iterrows():
            record = {}
            for col_name, val in row.to_dict().items():
                record[str(col_name)] = _clean_for_json(val)
            records.append(record)

        return records, execution_time_ms, engine_used

# Singleton instance
sql_service = SQLService()
