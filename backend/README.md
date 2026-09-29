# AutonomousAI – Multi-Agent Data Analyst (Backend)

Real, production-ready Python backend for **AutonomousAI**.

### Current Version: Stage 2 (Manager Agent + Data Agent + SQL Agent)
- **Manager Agent**: Natural language question interpretation & structured declarative query planning (`AnalysisPlan`).
- **Data Agent**: Deterministic analytical execution engine powered by **Pandas**.
- **SQL Agent**: Deterministic analytical query engine powered by **DuckDB** (read-only, parameterized, zero hallucination).
- **Gemini API**: Used server-side strictly for question understanding and explaining calculated results.

---

## 📁 Architecture Overview

```
User Query ("Which product generated the most revenue?")
                       ↓
            Manager Agent (FastAPI)
                       ↓
             Declarative JSON Plan
                       ↓
          ┌───────────────────────────┐
          ↓                           ↓
      Data Agent                  SQL Agent
       (Pandas)                   (DuckDB)
          ↓                           ↓
   df.groupby(...).sum()       SELECT "Product_Name",
                               SUM("Gross_Revenue")
                               FROM dataset
                               GROUP BY "Product_Name"
                               ORDER BY "Gross_Revenue" DESC
                               LIMIT 1;
          ↓                           ↓
   Pandas Result                 SQL Result
          └─────────────┬─────────────┘
                        ↓
                 Dual Verification
                        ↓
             Gemini Narrative Summary
                        ↓
       Clean JSON Response to React/Vite UI
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+
- pip & virtualenv

### 2. Create Virtual Environment & Install Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your-actual-gemini-key
GEMINI_MODEL=gemini-2.5-flash
PORT=8000
HOST=0.0.0.0
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE_MB=50
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend.vercel.app
```

### 4. Run the Backend Server
```bash
python3 main.py
# or using uvicorn directly:
uvicorn backend.main:app --reload --port 8000
```
Interactive Swagger API Documentation will be available at:
👉 **http://localhost:8000/docs**

---

## 🧪 Running Tests
Run the automated test suite covering upload, profiling, planning, Pandas calculations, SQL Agent execution, security checks, and cross-engine verification:
```bash
pytest tests/test_backend.py -v
```

---

## 📡 API Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/health
```
**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "AutonomousAI Multi-Agent Backend",
  "stage": "Stage 2 (Manager + Data Agent + SQL Agent)"
}
```

---

### 2. Upload Dataset (`.csv`, `.xlsx`, `.xls`)
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sample_data/test_sales.csv"
```
**Response:**
```json
{
  "status": "success",
  "dataset_id": "a3b1c2d3-4e5f-6789-0123-456789abcdef",
  "filename": "test_sales.csv",
  "rows": 10,
  "columns": 6,
  "profile": {
    "dataset_id": "a3b1c2d3-4e5f-6789-0123-456789abcdef",
    "filename": "test_sales.csv",
    "row_count": 10,
    "column_count": 6,
    "numeric_columns": ["Gross_Revenue", "Units_Sold"],
    "categorical_columns": ["Product_Name", "Category", "Region"],
    "date_columns": ["Date"],
    "sample_rows": [ ... ]
  }
}
```

---

### 3. Natural Language Analytical Query (Executing Data Agent + SQL Agent)
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "a3b1c2d3-4e5f-6789-0123-456789abcdef",
    "question": "Which product generated the most revenue?"
  }'
```

**Response:**
```json
{
  "question": "Which product generated the most revenue?",
  "plan": {
    "objective": "Find the product with the highest gross revenue",
    "metric": "Gross_Revenue",
    "operation": "sum",
    "group_by": ["Product_Name"],
    "filters": [],
    "sort": {
      "column": "Gross_Revenue",
      "direction": "desc"
    },
    "limit": 1
  },
  "analysis": {
    "status": "success",
    "agent": "Data Agent",
    "engine": "Pandas",
    "operation_performed": "sum on Gross_Revenue grouped by Product_Name",
    "calculated_values": [
      {
        "Product_Name": "Apex Wireless ANC Pro",
        "Gross_Revenue": 98400.0
      }
    ],
    "summary_statistics": {
      "total_rows_scanned": 10,
      "rows_after_filter": 10,
      "groups_count": 10,
      "metric_total": 485900.0
    },
    "row_count_analyzed": 10,
    "columns_used": ["Gross_Revenue", "Product_Name"],
    "execution_time_ms": 3.82
  },
  "sql_analysis": {
    "status": "success",
    "agent": "SQL Agent",
    "engine": "DuckDB",
    "operation_performed": "SUM Gross_Revenue grouped by Product_Name",
    "generated_sql": "SELECT \"Product_Name\", SUM(CAST(\"Gross_Revenue\" AS DOUBLE)) AS \"Gross_Revenue\" FROM dataset GROUP BY \"Product_Name\" ORDER BY \"Gross_Revenue\" DESC LIMIT 1;",
    "calculated_values": [
      {
        "Product_Name": "Apex Wireless ANC Pro",
        "Gross_Revenue": 98400.0
      }
    ],
    "summary_statistics": {
      "total_rows_scanned": 10,
      "rows_returned": 1,
      "sql_engine": "DuckDB"
    },
    "rows_analyzed": 10,
    "columns_used": ["Gross_Revenue", "Product_Name"],
    "execution_time_ms": 2.14
  },
  "answer": "Based on deterministic calculation across 10 dataset records, **Apex Wireless ANC Pro** generated the highest Gross Revenue with a total of **$98,400.00**.",
  "evidence": [
    "Top Rank: Apex Wireless ANC Pro with Gross_Revenue = $98,400.00.",
    "Aggregation: Grouped by 'Product_Name' using Pandas SUM.",
    "Data Scope: Verified across 10 rows in 3.82ms.",
    "SQL Verification: DuckDB executed `SELECT \"Product_Name\", SUM(CAST(\"Gross_Revenue\" AS DOUBLE)) AS \"Gross_Revenue\" FROM dataset GROUP BY \"Product_Name\" ORDER BY \"Gross_Revenue\" DESC LIMIT 1;` in 2.14ms matching Pandas result."
  ],
  "agent": "Data Agent + SQL Agent",
  "dataset_id": "a3b1c2d3-4e5f-6789-0123-456789abcdef",
  "execution_time_ms": 5.96
}
```

---

## 🔒 Security Hardening

The SQL Agent is protected against SQL injection and unauthorized operations:
1. **Strict SELECT-Only Enforcement**: Any query attempting DDL (`DROP`, `ALTER`, `CREATE`, `TRUNCATE`) or DML (`DELETE`, `UPDATE`, `INSERT`) is immediately blocked and rejected with an HTTP 422 error.
2. **Identifier Quoting**: Column names and aliases are quoted using standard SQL double-quotes (`"Column_Name"`), neutralizing punctuation, spaces, or injection attempts.
3. **Literal Parameter Escaping**: String and numeric filter values are escaped and typed safely.
4. **No Multi-Statement Injection**: Queries containing multiple statements (`;`) are strictly forbidden.
5. **No `eval()` or `exec()`**: All transformations use declarative Pydantic schemas and native DuckDB relational bindings.
