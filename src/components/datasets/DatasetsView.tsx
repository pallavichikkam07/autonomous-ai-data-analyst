import React from 'react';
import { Dataset } from '../../types';
import {
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Table as TableIcon,
  Trash2,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface DatasetsViewProps {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  onSelectDataset: (dataset: Dataset) => void;
  onRemoveDataset: (id: string) => void;
  onGoToUpload: () => void;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onRemoveDataset,
  onGoToUpload,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Dataset Catalog
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your tabular data sources, view schema dimensions, and switch active analytical targets.
          </p>
        </div>

        <button
          onClick={onGoToUpload}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload New Dataset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {datasets.map((ds) => {
          const isActive = activeDataset?.id === ds.id;

          return (
            <div
              key={ds.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500/80 bg-slate-900/90 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                      {ds.fileType}
                    </span>
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">
                    {ds.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {ds.filename}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {ds.description || 'Structured data table ready for multi-agent querying.'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Rows</div>
                    <div className="font-bold text-white mt-0.5">
                      {ds.rowCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Columns</div>
                    <div className="font-bold text-white mt-0.5">
                      {ds.columnCount} features
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {ds.sizeFormatted}
                </span>

                <div className="flex items-center gap-2">
                  {datasets.length > 1 && (
                    <button
                      onClick={() => onRemoveDataset(ds.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete dataset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {!isActive ? (
                    <button
                      onClick={() => onSelectDataset(ds)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                    >
                      <span>Select</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-400 cursor-default"
                    >
                      Selected
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
