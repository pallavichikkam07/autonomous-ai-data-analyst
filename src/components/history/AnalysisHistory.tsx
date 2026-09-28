import React, { useState } from 'react';
import { AnalysisRun } from '../../types';
import {
  History,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

interface AnalysisHistoryProps {
  runs: AnalysisRun[];
  onSelectRun: (run: AnalysisRun) => void;
  onDeleteRun: (runId: string) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  runs,
  onSelectRun,
  onDeleteRun,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRuns = runs.filter(
    (r) =>
      r.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.keyInsight.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <History className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Analysis Run History
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse and reload past multi-agent investigative queries, validated charts, and reports.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search previous questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Question</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Dataset</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Date</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Status</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Insights</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRuns.length > 0 ? (
                filteredRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectRun(run)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors max-w-sm truncate">
                        "{run.question}"
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {run.keyInsight}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="font-mono text-xs">{run.datasetName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {run.timestamp}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{run.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300 tabular-nums">
                      {run.insightsCount} insights
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectRun(run)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 rounded-lg border border-indigo-800/40 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onDeleteRun(run.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete run"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No historical analysis runs matched your search query.
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
