import React, { useState } from 'react';
import { Dataset } from '../../types';
import {
  Table as TableIcon,
  Maximize2,
  Hash,
  Calendar,
  AlertTriangle,
  Columns,
  Search,
  Filter,
} from 'lucide-react';

interface DatasetOverviewProps {
  dataset: Dataset;
  onViewFullDataset: () => void;
}

export const DatasetOverview: React.FC<DatasetOverviewProps> = ({
  dataset,
  onViewFullDataset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'numeric' | 'date' | 'string'>('all');

  // Filter columns for table preview if needed
  const displayColumns = dataset.columns.filter((c) => {
    if (filterType === 'all') return true;
    if (filterType === 'numeric') return c.type === 'number';
    if (filterType === 'date') return c.type === 'date';
    return c.type === 'string';
  });

  const filteredPreviewRows = dataset.previewRows.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Rows</span>
            <TableIcon className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {dataset.rowCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Recorded records</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Columns</span>
            <Columns className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {dataset.columnCount}
          </div>
          <div className="text-[11px] text-slate-400">Schema attributes</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Missing Values</span>
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                dataset.missingValues > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
          </div>
          <div
            className={`text-xl font-extrabold font-mono tabular-nums ${
              dataset.missingValues > 0 ? 'text-amber-300' : 'text-emerald-400'
            }`}
          >
            {dataset.missingValues}
          </div>
          <div className="text-[11px] text-slate-400">
            {dataset.missingValues === 0 ? 'Complete data integrity' : 'Null / NaN cells'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Numeric Columns</span>
            <Hash className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {dataset.numericColumns.length}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={dataset.numericColumns.join(', ')}>
            {dataset.numericColumns.length > 0
              ? dataset.numericColumns.slice(0, 2).join(', ') + (dataset.numericColumns.length > 2 ? '...' : '')
              : 'None'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Date Columns</span>
            <Calendar className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {dataset.dateColumns.length}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={dataset.dateColumns.join(', ')}>
            {dataset.dateColumns.length > 0 ? dataset.dateColumns.join(', ') : 'None'}
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Dataset Preview
            </h3>
            <span className="text-xs text-slate-400">
              (First {dataset.previewRows.length} rows of {dataset.rowCount.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick search inside preview */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search preview rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 sm:w-56 rounded-lg bg-slate-950/70 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={onViewFullDataset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/70 rounded-lg border border-indigo-800/50 transition-colors whitespace-nowrap"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>View Full Dataset</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-950/95 border-b border-slate-800 backdrop-blur-sm z-10">
              <tr>
                <th className="py-2.5 px-3 text-[11px] font-mono font-medium text-slate-400 w-12 text-center">
                  #
                </th>
                {displayColumns.map((col) => (
                  <th
                    key={col.name}
                    className="py-2.5 px-3 font-semibold text-slate-300 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal px-1 rounded bg-slate-900 border border-slate-800">
                        {col.type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPreviewRows.length > 0 ? (
                filteredPreviewRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    <td className="py-2 px-3 font-mono text-slate-400 text-center text-[11px]">
                      {rIdx + 1}
                    </td>
                    {displayColumns.map((col) => {
                      const val = row[col.name];
                      const isNumeric = col.type === 'number';
                      return (
                        <td
                          key={col.name}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isNumeric
                              ? 'font-mono tabular-nums text-slate-200'
                              : 'text-slate-300'
                          }`}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-slate-600 italic">null</span>
                          ) : typeof val === 'number' ? (
                            val.toLocaleString()
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={displayColumns.length + 1}
                    className="text-center py-8 text-xs text-slate-400"
                  >
                    No preview rows match the search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
