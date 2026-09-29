import os
import math
import datetime
from typing import Dict, Any, List
import pandas as pd
from backend.models.schemas import ColumnProfile, DatasetProfile

def _clean_for_json(val: Any) -> Any:
    """Helper to ensure all data types are safely JSON serializable."""
    if val is None:
        return None
    if isinstance(val, (float, int)):
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(val, (pd.Timestamp, datetime.datetime, datetime.date)):
        return val.isoformat()
    if pd.isna(val):
        return None
    return str(val) if not isinstance(val, (str, bool, list, dict)) else val

def profile_dataframe(df: pd.DataFrame, dataset_id: str, filename: str, file_size_bytes: int = 0) -> DatasetProfile:
    """
    Profiles a Pandas DataFrame extracting column stats, types, and sample data.
    Ensures zero NaN serialization errors.
    """
    row_count = int(len(df))
    column_count = int(len(df.columns))

    columns_profile: List[ColumnProfile] = []
    numeric_cols: List[str] = []
    categorical_cols: List[str] = []
    date_cols: List[str] = []

    for col in df.columns:
        series = df[col]
        dtype_str = str(series.dtype)
        null_count = int(series.isna().sum())
        null_pct = round((null_count / max(row_count, 1)) * 100, 2)
        unique_cnt = int(series.nunique(dropna=True))

        is_numeric = bool(pd.api.types.is_numeric_dtype(series))
        is_date = bool(pd.api.types.is_datetime64_any_dtype(series))

        # Check if object column represents dates
        if not is_numeric and not is_date and series.dropna().shape[0] > 0:
            sample_val = str(series.dropna().iloc[0])
            if any(char in sample_val for char in ['-', '/']) and len(sample_val) >= 8:
                try:
                    pd.to_datetime(series.dropna().head(10), errors='raise')
                    is_date = True
                except Exception:
                    pass

        is_categorical = not is_numeric and not is_date

        if is_numeric:
            numeric_cols.append(str(col))
        elif is_date:
            date_cols.append(str(col))
        else:
            categorical_cols.append(str(col))

        # Sample values safely cleaned
        sample_vals = [
            _clean_for_json(v)
            for v in series.dropna().unique()[:5]
        ]

        columns_profile.append(
            ColumnProfile(
                name=str(col),
                dtype=dtype_str,
                null_count=null_count,
                null_percentage=null_pct,
                unique_count=unique_cnt,
                is_numeric=is_numeric,
                is_categorical=is_categorical,
                is_date=is_date,
                sample_values=sample_vals
            )
        )

    # Prepare 5 sample rows safely formatted
    sample_records: List[Dict[str, Any]] = []
    for _, row in df.head(5).iterrows():
        sample_records.append({str(k): _clean_for_json(v) for k, v in row.to_dict().items()})

    return DatasetProfile(
        dataset_id=dataset_id,
        filename=filename,
        row_count=row_count,
        column_count=column_count,
        columns=columns_profile,
        numeric_columns=numeric_cols,
        categorical_columns=categorical_cols,
        date_columns=date_cols,
        sample_rows=sample_records,
        file_size_bytes=file_size_bytes,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
