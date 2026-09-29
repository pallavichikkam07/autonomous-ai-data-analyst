import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.models.responses import UploadResponse
from backend.models.schemas import DatasetProfile
from backend.services.dataset_service import dataset_service

router = APIRouter(prefix="/api", tags=["Datasets"])

MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", 50))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV, XLSX, or XLS dataset.
    The backend loads the data into Pandas, inspects schema, generates a statistical
    profile, and stores the dataset securely for multi-agent querying.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file extension '{ext}'. Only .csv, .xlsx, and .xls files are supported."
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read upload payload: {str(e)}"
        )

    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    try:
        profile = dataset_service.save_and_profile(
            file_content=content,
            original_filename=file.filename
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process dataset: {str(e)}"
        )

    return UploadResponse(
        status="success",
        dataset_id=profile.dataset_id,
        filename=profile.filename,
        rows=profile.row_count,
        columns=profile.column_count,
        profile=profile
    )

@router.get("/dataset/{dataset_id}", response_model=DatasetProfile)
async def get_dataset_profile(dataset_id: str):
    """
    Retrieve structural profile, column types, statistics, and sample rows
    for a previously uploaded dataset.
    """
    profile = dataset_service.get_profile(dataset_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' was not found."
        )
    return profile
