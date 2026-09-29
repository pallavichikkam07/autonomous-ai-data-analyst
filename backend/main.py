import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.models.responses import HealthResponse
from backend.api.upload import router as upload_router
from backend.api.analyze import router as analyze_router

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("autonomous_ai_backend")

app = FastAPI(
    title="AutonomousAI – Multi-Agent Data Analyst Backend",
    version="1.0.0",
    description=(
        "Production backend for AutonomousAI. Implements Manager Agent query planning "
        "and Data Agent deterministic Pandas execution against CSV and Excel datasets."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React/Vite development and Vercel production
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://localhost:3000")
allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
if "*" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")
    allowed_origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(upload_router)
app.include_router(analyze_router)

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Returns server and service health status."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        service="AutonomousAI Multi-Agent Backend"
    )

@app.get("/", tags=["System"])
async def root():
    """Root entry point with documentation links."""
    return {
        "service": "AutonomousAI Multi-Agent Backend",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "health": "GET /api/health",
            "upload": "POST /api/upload",
            "dataset_profile": "GET /api/dataset/{dataset_id}",
            "analyze": "POST /api/analyze"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all exception handler to avoid leaking internal stack traces."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing the request."
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
