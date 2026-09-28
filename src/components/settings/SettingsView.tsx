import React, { useState } from 'react';
import { AppSettings } from '../../types';
import {
  Settings,
  Cpu,
  ShieldCheck,
  BookOpen,
  Sun,
  Moon,
  Save,
  Check,
  AlertCircle,
  Lock,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  toggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  toggleTheme,
}) => {
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Settings className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Platform & Agent Settings
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure LLM inference models, agent reasoning constraints, data privacy, and RAG chunking parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Gemini API & Model Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Gemini LLM Engine & Reasoning</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Secure Server-Side Credential Proxy:</span>{' '}
              API credentials are automatically secured in backend runtime environment variables (`process.env.GEMINI_API_KEY`). No client-side key exposure occurs.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Model Engine
              </label>
              <select
                value={formState.geminiModel}
                onChange={(e) =>
                  setFormState({ ...formState, geminiModel: e.target.value })
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast Reasoning & Code)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Multi-Step Investigation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sampling Temperature: <span className="text-cyan-400 font-mono">{formState.temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formState.temperature}
                onChange={(e) =>
                  setFormState({ ...formState, temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.0 (Deterministic SQL/Code)</span>
                <span>1.0 (Creative Exploratory)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Critic Agent Verification Rigor
              </label>
              <select
                value={formState.criticStrictness}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    criticStrictness: e.target.value as any,
                  })
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="rigorous">Rigorous (Audit all calculations, reject unbacked claims)</option>
                <option value="balanced">Balanced (Standard statistical confidence)</option>
                <option value="conservative">Conservative (Flag only critical anomalies)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Generation Tokens
              </label>
              <input
                type="number"
                value={formState.maxTokens}
                onChange={(e) =>
                  setFormState({ ...formState, maxTokens: parseInt(e.target.value) || 2048 })
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Privacy & Sandboxing */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Data Privacy & Execution Sandboxes</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.enableLocalDuckDb}
                onChange={(e) =>
                  setFormState({ ...formState, enableLocalDuckDb: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Local In-Process DuckDB SQL Engine
                </div>
                <div className="text-[11px] text-slate-400">
                  Executes structured SQL queries in memory without streaming full tables over external networks.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.enablePandasSandbox}
                onChange={(e) =>
                  setFormState({ ...formState, enablePandasSandbox: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Sandboxed Python / Pandas Kernel
                </div>
                <div className="text-[11px] text-slate-400">
                  Isolates Data Agent Python runtime in a restricted ephemeral sandbox.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.enableDataScrubbing}
                onChange={(e) =>
                  setFormState({ ...formState, enableDataScrubbing: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-0"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Automatic PII & Customer ID Anonymization
                </div>
                <div className="text-[11px] text-slate-400">
                  Hashes email addresses, credit cards, and customer identity markers before agent LLM prompts.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Knowledge Base RAG Parameters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Knowledge Base (RAG) Indexing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Embedding Model
              </label>
              <input
                type="text"
                disabled
                value={formState.embeddingModel}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chunk Size (Tokens)
              </label>
              <input
                type="number"
                value={formState.ragChunkSize}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    ragChunkSize: parseInt(e.target.value) || 512,
                  })
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chunk Overlap (Tokens)
              </label>
              <input
                type="number"
                value={formState.ragOverlap}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    ragOverlap: parseInt(e.target.value) || 64,
                  })
                }
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Visual Theme */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Visual Interface Theme</div>
              <div className="text-xs text-slate-400">
                Choose between dark analytical slate or daylight high-contrast
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
