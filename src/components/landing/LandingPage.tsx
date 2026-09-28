import React from 'react';
import { Page, Dataset } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Database,
  Brain,
  Search,
  CheckCircle2,
  BarChart3,
  GitBranch,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  FileCheck,
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalyzing: () => void;
  onViewHowItWorks: () => void;
  onSelectSampleDataset: (dataset: Dataset) => void;
  sampleDatasets: Dataset[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalyzing,
  onViewHowItWorks,
  onSelectSampleDataset,
  sampleDatasets,
}) => {
  const workflowSteps = [
    {
      title: 'User Query',
      subtitle: 'Natural language question',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Manager Agent',
      subtitle: 'Task decomposition & strategy',
      icon: Brain,
      color: 'from-indigo-500 to-blue-600',
    },
    {
      title: 'Data + SQL + Viz Agents',
      subtitle: 'Python / DuckDB / SVG synthesis',
      icon: GitBranch,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Critic Agent',
      subtitle: 'Audit & mathematical validation',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Report Agent',
      subtitle: 'Executive synthesis & export',
      icon: FileCheck,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Final Insights',
      subtitle: 'Data-grounded decisions',
      icon: CheckCircle2,
      color: 'from-cyan-500 to-emerald-500',
    },
  ];

  const featureCards = [
    {
      title: 'Multi-Agent Analysis',
      description:
        'A coordinated team of specialized agents—Manager, Data, SQL, and Viz—partition complex analytical objectives and execute them collaboratively.',
      icon: Cpu,
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      border: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Gemini Powered',
      description:
        'Harnesses state-of-the-art multimodal reasoning with Gemini 2.5 Flash and Pro to generate precise code logic, hypotheses, and diagnostic reasoning.',
      icon: Zap,
      gradient: 'from-blue-500/10 to-blue-500/5',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      title: 'RAG Context Retrieval',
      description:
        'Retrieves strategic business rules, data dictionaries, and executive targets from indexed PDF and TXT documents so insights match domain reality.',
      icon: Database,
      gradient: 'from-cyan-500/10 to-cyan-500/5',
      border: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'Natural Language Data Queries',
      description:
        'Ask plain-English questions like "Why did revenue decrease in July?" without writing complex boilerplate SQL or Python Pandas scripts.',
      icon: Search,
      gradient: 'from-purple-500/10 to-purple-500/5',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Automatic Visualization',
      description:
        'The Visualization Agent dynamically selects optimal statistical charts—trend lines, categorical distributions, and comparative bars—grounded in raw data.',
      icon: BarChart3,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Result Validation',
      description:
        'The Critic Agent rigorously stress-tests every conclusion, audits for null values, and guards against mathematical hallucinations before reporting.',
      icon: ShieldCheck,
      gradient: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-900">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-xs font-medium text-indigo-300 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>Autonomous Multi-Agent Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Turn Your Data Into Answers With <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">Autonomous AI</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed" style={{ textWrap: 'balance' }}>
            Upload your dataset, ask questions in natural language, and let a team of specialized AI agents analyze your data, validate the results, and generate actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartAnalyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.01] transition-all"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onViewHowItWorks}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>View How It Works</span>
            </button>
          </div>

          {/* Quick Start with Sample Data */}
          <div className="pt-8 border-t border-slate-900/90 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
              Or explore with pre-loaded enterprise datasets:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleDatasets.slice(0, 2).map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => onSelectSampleDataset(ds)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 text-left transition-all group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                      {ds.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {ds.rowCount.toLocaleString()} rows · {ds.fileType}
                    </div>
                  </div>
                  <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 font-medium">
                    Analyze →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Representation of Multi-Agent Workflow */}
      <section className="py-16 lg:py-24 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
              Agentic Pipeline
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How the Multi-Agent Team Operates
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Unlike single-prompt chatbots, AutonomousAI coordinates specialized agents that debate, code, query, validate, and summarize evidence.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative z-10">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div className="text-[10px] font-mono text-slate-400 mb-2">
                      Step 0{idx + 1}
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white mb-3 shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-100 mb-1">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {step.subtitle}
                    </div>

                    {/* Connector arrow for desktop */}
                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 z-20">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Deep Dataset Investigation
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to turn raw transactional records and business spreadsheets into verifiable executive intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-6 rounded-2xl bg-gradient-to-b ${feat.gradient} bg-slate-900/60 border ${feat.border} hover:border-slate-700 transition-all space-y-3`}
              >
                <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 w-fit ${feat.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Ready to interrogate your data?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Drag and drop your spreadsheet or select a sample dataset to see the multi-agent investigative process in action.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartAnalyzing}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
            >
              <span>Launch AutonomousAI Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
