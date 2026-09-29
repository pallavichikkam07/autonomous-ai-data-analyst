import os
import json
import uuid
from typing import Optional, Tuple
import pandas as pd
from backend.models.schemas import DatasetProfile
from backend.utils.dataset_profiler import profile_dataframe

BASE_UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")

class DatasetService:
    """Manages file storage, loading, and profiling for uploaded datasets."""

    def __init__(self, upload_dir: str = BASE_UPLOAD_DIR):
        self.upload_dir = os.path.abspath(upload_dir)
        os.makedirs(self.upload_dir, exist_ok=True)
        self._memory_cache: dict[str, pd.DataFrame] = {}

    def _resolve_safe_path(self, filename: str) -> str:
        """Sanitizes filename and prevents directory traversal attacks."""
        clean_name = os.path.basename(filename)
        safe_path = os.path.abspath(os.path.join(self.upload_dir, clean_name))
        if not safe_path.startswith(self.upload_dir):
            raise ValueError("Invalid file path: security boundary violation.")
        return safe_path

    def save_and_profile(self, file_content: bytes, original_filename: str) -> DatasetProfile:
        """Saves file content to disk and generates structural profile."""
        ext = os.path.splitext(original_filename)[1].lower()
        if ext not in [".csv", ".xlsx", ".xls"]:
            raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: .csv, .xlsx, .xls")

        dataset_id = str(uuid.uuid4())
        stored_filename = f"{dataset_id}{ext}"
        target_path = self._resolve_safe_path(stored_filename)

        with open(target_path, "wb") as f:
            f.write(file_content)

        file_size = len(file_content)
        if file_size == 0:
            os.remove(target_path)
            raise ValueError("Uploaded file is empty (0 bytes).")

        # Load into Pandas
        try:
            if ext == ".csv":
                df = pd.read_csv(target_path)
            elif ext in [".xlsx", ".xls"]:
                df = pd.read_excel(target_path)
            else:
                raise ValueError("Unsupported file format.")
        except Exception as e:
            if os.path.exists(target_path):
                os.remove(target_path)
            raise ValueError(f"Failed to parse file: {str(e)}")

        if df.empty or len(df.columns) == 0:
            if os.path.exists(target_path):
                os.remove(target_path)
            raise ValueError("Dataset has no records or columns to analyze.")

        # Clean column names (strip whitespace)
        df.columns = [str(c).strip() for c in df.columns]

        profile = profile_dataframe(df, dataset_id=dataset_id, filename=original_filename, file_size_bytes=file_size)

        # Save metadata JSON
        meta_path = self._resolve_safe_path(f"{dataset_id}_meta.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(profile.model_dump(), f, indent=2)

        # Cache in memory
        self._memory_cache[dataset_id] = df

        return profile

    def get_profile(self, dataset_id: str) -> Optional[DatasetProfile]:
        """Retrieves cached or saved profile metadata."""
        meta_path = self._resolve_safe_path(f"{dataset_id}_meta.json")
        if not os.path.exists(meta_path):
            return None
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return DatasetProfile(**data)
        except Exception:
            return None

    def load_dataframe(self, dataset_id: str) -> Tuple[pd.DataFrame, DatasetProfile]:
        """Loads DataFrame and its Profile for analysis."""
        profile = self.get_profile(dataset_id)
        if not profile:
            raise ValueError(f"Dataset with ID '{dataset_id}' not found.")

        if dataset_id in self._memory_cache:
            return self._memory_cache[dataset_id], profile

        # Find file by dataset_id prefix
        matched_file = None
        for ext in [".csv", ".xlsx", ".xls"]:
            candidate = self._resolve_safe_path(f"{dataset_id}{ext}")
            if os.path.exists(candidate):
                matched_file = candidate
                break

        if not matched_file:
            raise ValueError(f"Dataset file for ID '{dataset_id}' was not found on disk.")

        if matched_file.endswith(".csv"):
            df = pd.read_csv(matched_file)
        else:
            df = pd.read_excel(matched_file)

        df.columns = [str(c).strip() for c in df.columns]
        self._memory_cache[dataset_id] = df
        return df, profile

# Singleton instance
dataset_service = DatasetService()
