import React from 'react';
import { AnalysisRun, Dataset } from '../../types';
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ReportsViewProps {
  runs: AnalysisRun[];
  onSelectRun: (run: AnalysisRun) => void;
  activeDataset: Dataset | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  runs,
  onSelectRun,
  activeDataset,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Generated AI Reports
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Formal executive briefs synthesized and validated by the Report Agent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {runs.map((run) => (
          <div
            key={run.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {run.datasetName}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {run.timestamp}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  "{run.question}"
                </h3>
                <p className="text-xs font-semibold text-indigo-300 mt-1">
                  {run.keyInsight}
                </p>
              </div>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {run.report.executiveSummary}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Key Findings Highlight:
                </div>
                {run.report.keyFindings.slice(0, 2).map((kf, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span className="line-clamp-1">{kf}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Critic Verified</span>
              </span>

              <button
                onClick={() => onSelectRun(run)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open Full Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
