import React, { useState } from 'react';
import { AgentStep, AgentStatus } from '../../types';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Database,
  Terminal,
  FileCode2,
  BarChart2,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface AgentActivityProps {
  steps: AgentStep[];
  isAnalyzing: boolean;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  steps,
  isAnalyzing,
}) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(
    steps.length > 0 ? steps[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedAgentId(expandedAgentId === id ? null : id);
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'manager':
        return Brain;
      case 'rag':
        return Database;
      case 'data':
        return Terminal;
      case 'sql':
        return FileCode2;
      case 'viz':
        return BarChart2;
      case 'critic':
        return ShieldCheck;
      case 'report':
        return FileText;
      default:
        return Sparkles;
    }
  };

  const renderStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium animate-pulse">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span>Running</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Error</span>
          </span>
        );
      case 'waiting':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Circle className="h-3.5 w-3.5" />
            <span>Waiting</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Agent Activity
            </h3>
            {isAnalyzing && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 animate-pulse">
                Investigating Pipeline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time step trace across specialized investigative agent nodes
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Interactive multi-agent orchestration state</span>
        </div>
      </div>

      {/* Agents Timeline List */}
      <div className="space-y-2.5">
        {steps.map((step) => {
          const Icon = getAgentIcon(step.agent);
          const isExpanded = expandedAgentId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all ${
                step.status === 'running'
                  ? 'border-indigo-500/50 bg-indigo-950/20'
                  : isExpanded
                  ? 'border-slate-700 bg-slate-950/70'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/80'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(step.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      step.status === 'completed'
                        ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                        : step.status === 'running'
                        ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-100">
                        {step.name}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        · {step.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {step.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {renderStatusBadge(step.status)}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expandable Task and Reasoning Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/70 text-xs space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Agent Objective & Task
                    </div>
                    <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {step.task}
                    </p>
                  </div>

                  {step.thought && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Internal Reasoning & Thought
                      </div>
                      <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 italic">
                        "{step.thought}"
                      </p>
                    </div>
                  )}

                  {step.codeSnippet && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        <span>{step.codeSnippet.title}</span>
                        <span className="font-mono text-cyan-400">{step.codeSnippet.lang}</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto">
                        <code>{step.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {step.outputSummary && (
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/40">
                      <span className="text-emerald-400 font-medium">
                        ✓ {step.outputSummary}
                      </span>
                      {step.latencyMs && (
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{step.latencyMs}ms</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
