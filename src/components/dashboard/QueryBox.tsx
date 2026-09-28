import React, { useState } from 'react';
import { EXAMPLE_QUESTIONS } from '../../data/mockData';
import {
  Sparkles,
  Search,
  ArrowRight,
  Cpu,
  Layers,
  HelpCircle,
  ShieldCheck,
  Bot,
} from 'lucide-react';

interface QueryBoxProps {
  onAnalyze: (query: string) => void;
  isAnalyzing: boolean;
  activeDatasetName?: string;
}

export const QueryBox: React.FC<QueryBoxProps> = ({
  onAnalyze,
  isAnalyzing,
  activeDatasetName,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isAnalyzing) {
      onAnalyze(query.trim());
    }
  };

  const handleSelectExample = (example: string) => {
    setQuery(example);
    onAnalyze(example);
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-slate-900/90 to-slate-900/90 p-5 sm:p-6 shadow-lg shadow-indigo-950/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Autonomous Multi-Agent Investigation
          </span>
        </div>

        {/* Clear multi-agent indication badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>Dispatches across Manager, Data, SQL, Viz & Critic Agents</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your data... e.g. Why did revenue decrease in July? Compare regional volume, or find anomalous patterns."
            disabled={isAnalyzing}
            className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950/90 p-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-60 transition-all font-sans"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!query.trim() || isAnalyzing}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Agents Investigating...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example Suggestions */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Suggested questions for this dataset:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSelectExample(q)}
                disabled={isAnalyzing}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
