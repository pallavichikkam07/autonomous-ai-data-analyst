import React, { useState } from 'react';
import { Dataset } from '../../types';
import {
  X,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FullDatasetModalProps {
  dataset: Dataset;
  isOpen: boolean;
  onClose: () => void;
}

export const FullDatasetModal: React.FC<FullDatasetModalProps> = ({
  dataset,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  if (!isOpen) return null;

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
  };

  // Filter
  const filtered = dataset.previewRows.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort
  if (sortCol) {
    filtered.sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <TableIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {dataset.name || dataset.filename}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns · {dataset.fileType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search values in table..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-48 sm:w-64 rounded-lg bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table Body Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 shadow-sm z-10">
                <tr>
                  <th className="py-2.5 px-3 text-[11px] font-mono text-slate-400 w-12 text-center">
                    #
                  </th>
                  {dataset.columns.map((col) => (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="py-2.5 px-3 font-semibold text-slate-300 hover:text-white cursor-pointer select-none transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {pagedRows.length > 0 ? (
                  pagedRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-850/80 transition-colors"
                    >
                      <td className="py-2 px-3 font-mono text-slate-400 text-center text-[11px]">
                        {(currentPage - 1) * pageSize + rIdx + 1}
                      </td>
                      {dataset.columns.map((col) => {
                        const val = row[col.name];
                        const isNum = col.type === 'number';
                        return (
                          <td
                            key={col.name}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isNum
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
                      colSpan={dataset.columns.length + 1}
                      className="text-center py-10 text-xs text-slate-400"
                    >
                      No records matched the filter query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer with Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="text-white font-mono">
              {filtered.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="text-white font-mono">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="text-white font-mono">
              {filtered.length.toLocaleString()}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
