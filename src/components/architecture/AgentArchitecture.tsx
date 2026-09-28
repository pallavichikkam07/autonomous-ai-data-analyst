import React, { useState } from 'react';
import {
  Brain,
  Terminal,
  FileCode2,
  BarChart2,
  ShieldCheck,
  FileText,
  Zap,
  Database,
  Wrench,
  Layers,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Code2,
  Sparkles,
} from 'lucide-react';

export const AgentArchitecture: React.FC = () => {
  const [selectedAgentKey, setSelectedAgentKey] = useState<string>('manager');

  const agents = [
    {
      key: 'manager',
      name: 'MANAGER AGENT',
      role: 'Plans the investigation and coordinates other agents.',
      tools: ['TaskPlanner', 'HypothesisGenerator', 'AgentDispatcher'],
      input: 'User natural language question + Dataset Schema',
      output: 'Directed execution DAG with sub-tasks for worker agents',
      promptExample:
        'You are the Manager Agent. Decompose user inquiries into testable analytical hypotheses. Route quantitative requests to Data/SQL agents and require Critic validation.',
      color: 'from-indigo-500 to-blue-600',
      icon: Brain,
    },
    {
      key: 'data',
      name: 'DATA AGENT',
      role: 'Inspects, cleans and analyzes datasets using Python/Pandas.',
      tools: ['PandasExecutionSandbox', 'NumPy', 'MissingValueImputer'],
      input: 'Raw dataframe / CSV + Analytical goal',
      output: 'Dataframe statistics, groupby matrices, and anomaly records',
      promptExample:
        'You are the Data Agent. Write and run deterministic Pandas code. Never estimate numbers: compute sums, medians, and MoM percentage variations directly.',
      color: 'from-cyan-500 to-blue-500',
      icon: Terminal,
    },
    {
      key: 'sql',
      name: 'SQL AGENT',
      role: 'Generates and executes SQL queries for structured analysis.',
      tools: ['DuckDBEngine', 'SQLSyntaxValidator', 'QueryOptimizer'],
      input: 'Table schema + Relational question',
      output: 'Tabular aggregated records, window function rankings, and sums',
      promptExample:
        'You are the SQL Agent. Generate performant ANSI SQL / DuckDB queries. Enforce strict type conversions, groupbys, and clean aliases.',
      color: 'from-blue-600 to-indigo-700',
      icon: FileCode2,
    },
    {
      key: 'viz',
      name: 'VISUALIZATION AGENT',
      role: 'Selects appropriate charts and visualizations.',
      tools: ['ChartGeometrySelector', 'CoordinateNormalizer', 'ColorPaletteAssigner'],
      input: 'Summary tables + Statistical trends',
      output: 'Interactive chart geometry configs (SVG line, bar, donut, geo)',
      promptExample:
        'You are the Visualization Agent. Match data dimensions to the clearest visual layout. For time series, select line trends; for shares, select donut distributions.',
      color: 'from-purple-500 to-pink-500',
      icon: BarChart2,
    },
    {
      key: 'critic',
      name: 'CRITIC AGENT',
      role: 'Validates findings and checks whether conclusions are supported by evidence.',
      tools: ['MathAuditor', 'SeasonalityVerifier', 'ContradictionDetector'],
      input: 'Draft findings from Data/SQL + Raw evidentiary logs',
      output: 'Passed / Rejected validation audit with rubric scores',
      promptExample:
        'You are the Critic Agent. Reject unsubstantiated claims. Ensure percentages match formulas, check sample sizes, and flag external confounding variables.',
      color: 'from-amber-500 to-orange-600',
      icon: ShieldCheck,
    },
    {
      key: 'report',
      name: 'REPORT AGENT',
      role: 'Combines validated results into a final report.',
      tools: ['ExecutiveSynthesizer', 'MarkdownFormatter', 'ActionItemRanker'],
      input: 'Critic-approved findings + RAG context + Visualizations',
      output: 'Structured executive briefing ready for PDF / CSV download',
      promptExample:
        'You are the Report Agent. Synthesize findings into clear executive prose. Structure into Executive Summary, Key Findings, Anomalies, and Next Actions.',
      color: 'from-emerald-500 to-teal-600',
      icon: FileText,
    },
  ];

  const systemNodes = [
    {
      name: 'Gemini LLM',
      desc: 'Multimodal reasoning engine (Gemini 2.5 Flash / Pro)',
      icon: Zap,
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    },
    {
      name: 'RAG System',
      desc: 'Vector embedding search over corporate PDF / TXT rules',
      icon: Database,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    },
    {
      name: 'Tools & Sandboxes',
      desc: 'Python Pandas, DuckDB in-process SQL, Chart generators',
      icon: Wrench,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    },
    {
      name: 'Dataset Store',
      desc: 'User uploaded CSV / XLSX tabular data partitions',
      icon: Layers,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    },
  ];

  const currentSelectedAgent = agents.find((a) => a.key === selectedAgentKey) || agents[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autonomous Multi-Agent Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          A modular, collaborative agent graph with distinct responsibilities, tool sandboxes, and verification loops.
        </p>
      </div>

      {/* Core Infrastructure Nodes (Gemini LLM, RAG, Tools, Dataset) */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          System Infrastructure & Backing Services
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.name}
                className={`p-4 rounded-xl border ${node.color} flex items-start gap-3`}
              >
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    {node.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {node.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Agent Flow Pipeline */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          Specialized Agent Orchestration Flow (Click any card to inspect contract)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            const isSelected = selectedAgentKey === agent.key;

            return (
              <div
                key={agent.key}
                onClick={() => setSelectedAgentKey(agent.key)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all relative ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} text-white shadow-sm`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      {agent.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    Step 0{idx + 1}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[38px]">
                  {agent.role}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {agent.tools.length} Tools Connected
                  </span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Inspector Drawer */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${currentSelectedAgent.color} text-white`}
            >
              {React.createElement(currentSelectedAgent.icon, { className: 'h-5 w-5' })}
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {currentSelectedAgent.name} Specification
              </h4>
              <p className="text-xs text-slate-400">
                {currentSelectedAgent.role}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Autonomous Worker
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              Input Signature
            </div>
            <p className="text-slate-200">{currentSelectedAgent.input}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              Output Contract
            </div>
            <p className="text-slate-200">{currentSelectedAgent.output}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Assigned Capabilities & Tool Handlers
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSelectedAgent.tools.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
              >
                {t}()
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            System Prompt Template
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
            {currentSelectedAgent.promptExample}
          </pre>
        </div>
      </div>
    </div>
  );
};
