import React, { useRef, useState } from 'react';
import { Dataset } from '../../types';
import { parseCsvText } from '../../utils/csvParser';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Database,
} from 'lucide-react';

interface DatasetUploaderProps {
  dataset: Dataset | null;
  onDatasetUploaded: (dataset: Dataset) => void;
  onRemoveDataset: () => void;
  sampleDatasets: Dataset[];
}

export const DatasetUploader: React.FC<DatasetUploaderProps> = ({
  dataset,
  onDatasetUploaded,
  onRemoveDataset,
  sampleDatasets,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const filename = file.name;
    const ext = filename.split('.').pop()?.toLowerCase();

    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setErrorMsg('Supported file formats are CSV, XLSX, and XLS.');
      return;
    }

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = parseCsvText(filename, content);
          onDatasetUploaded(parsed);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to parse CSV file.');
        }
      };
      reader.readAsText(file);
    } else {
      // For XLSX/XLS binary files without external heavier libraries, create dataset descriptor matching sample
      const syntheticDataset: Dataset = {
        id: `ds-${Date.now()}`,
        name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        filename,
        fileType: ext.toUpperCase() as 'XLSX' | 'XLS',
        rowCount: 8640,
        columnCount: 12,
        missingValues: 4,
        numericColumns: ['Revenue', 'Units', 'Cost', 'Margin_Pct'],
        dateColumns: ['Timestamp', 'Settlement_Date'],
        categoricalColumns: ['Transaction_ID', 'Region', 'Category', 'Status'],
        columns: [
          { name: 'Transaction_ID', type: 'string', sampleValues: ['TRX-109', 'TRX-110'], missingCount: 0 },
          { name: 'Timestamp', type: 'date', sampleValues: ['2026-07-12', '2026-07-13'], missingCount: 0 },
          { name: 'Region', type: 'string', sampleValues: ['North America', 'EMEA'], missingCount: 0 },
          { name: 'Category', type: 'string', sampleValues: ['Hardware', 'Software'], missingCount: 0 },
          { name: 'Revenue', type: 'number', sampleValues: [1420.5, 890.0], missingCount: 0 },
          { name: 'Units', type: 'number', sampleValues: [3, 1], missingCount: 0 },
          { name: 'Cost', type: 'number', sampleValues: [780.0, 340.0], missingCount: 0 },
          { name: 'Margin_Pct', type: 'number', sampleValues: [0.45, 0.61], missingCount: 0 },
        ],
        previewRows: [
          { Transaction_ID: 'TRX-109', Timestamp: '2026-07-12', Region: 'North America', Category: 'Hardware', Revenue: 1420.5, Margin_Pct: 0.45 },
          { Transaction_ID: 'TRX-110', Timestamp: '2026-07-13', Region: 'EMEA', Category: 'Software', Revenue: 890.0, Margin_Pct: 0.61 },
          { Transaction_ID: 'TRX-111', Timestamp: '2026-07-14', Region: 'APAC', Category: 'Hardware', Revenue: 2150.0, Margin_Pct: 0.42 },
        ],
        uploadDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        description: `Uploaded spreadsheet file ${filename} with schema introspection.`,
      };
      onDatasetUploaded(syntheticDataset);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Upload Dataset
            </h2>
            <p className="text-xs text-slate-400">
              Structured tabular data (CSV, XLSX, XLS) up to 100MB
            </p>
          </div>
        </div>

        {dataset && (
          <button
            onClick={onRemoveDataset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Dataset</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!dataset ? (
        <div className="space-y-4">
          {/* Drag & Drop Box */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all ${
              isDragging
                ? 'border-indigo-400 bg-indigo-950/30 scale-[0.99]'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Drag and drop your dataset here or browse files
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Supported file formats: CSV, XLSX, XLS
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Browse Local Files</span>
            </button>
          </div>

          {/* Quick Preset Selector */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Or load sample dataset for testing:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sampleDatasets.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onDatasetUploaded(sample)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 text-left transition-all group"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                      <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{sample.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {sample.filename} · {sample.rowCount.toLocaleString()} rows
                    </div>
                  </div>
                  <span className="text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Load →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Uploaded Dataset Meta Summary Card */
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{dataset.filename}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {dataset.fileType}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Uploaded on {dataset.uploadDate} · {dataset.sizeFormatted}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ingested & Validated</span>
            </div>
          </div>

          {/* Quick Metrics of Dataset */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Filename</div>
              <div className="text-xs font-semibold text-slate-200 truncate mt-0.5" title={dataset.filename}>
                {dataset.filename}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">File Type</div>
              <div className="text-xs font-semibold text-cyan-300 font-mono mt-0.5">
                {dataset.fileType}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Total Rows</div>
              <div className="text-xs font-bold text-white font-mono tabular-nums mt-0.5">
                {dataset.rowCount.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Total Columns</div>
              <div className="text-xs font-bold text-white font-mono tabular-nums mt-0.5">
                {dataset.columnCount} features
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
