import React from 'react';
import { AnalysisRun } from '../../types';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Award,
  Globe2,
  Percent,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';

interface InsightCardsProps {
  analysis: AnalysisRun;
}

export const InsightCards: React.FC<InsightCardsProps> = ({ analysis }) => {
  const isNegativeGrowth = analysis.metrics.growthRate.startsWith('-');

  return (
    <div className="space-y-6">
      {/* Key Insight & Supporting Evidence Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900/90 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Key Insight Main Card */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                <Lightbulb className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Key Analytical Discovery
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {analysis.keyInsight}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {analysis.report.executiveSummary}
            </p>
          </div>

          {/* Validation & Evidence Pillar */}
          <div className="lg:w-96 rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Supporting Evidence</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Validated</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.supportingEvidence.map((evidence, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards: Revenue, Average Order Value, Top Product, Top Region, Growth Rate */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Revenue */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenue</span>
            <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {analysis.metrics.revenue}
          </div>
          <div className="text-[11px] text-slate-400">Period total</div>
        </div>

        {/* Average Order Value */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Order Value</span>
            <ShoppingCart className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums">
            {analysis.metrics.aov}
          </div>
          <div className="text-[11px] text-slate-400">Per basket conversion</div>
        </div>

        {/* Top Product */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Top Product</span>
            <Award className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate" title={analysis.metrics.topProduct}>
            {analysis.metrics.topProduct}
          </div>
          <div className="text-[11px] text-slate-400">Volume flagship</div>
        </div>

        {/* Top Region */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Top Region</span>
            <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate" title={analysis.metrics.topRegion}>
            {analysis.metrics.topRegion}
          </div>
          <div className="text-[11px] text-slate-400">Highest contribution</div>
        </div>

        {/* Growth Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Growth Rate</span>
            {isNegativeGrowth ? (
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-xl font-extrabold font-mono tabular-nums ${
              isNegativeGrowth ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {analysis.metrics.growthRate}
          </div>
          <div className="text-[11px] text-slate-400">Compared to baseline</div>
        </div>
      </div>
    </div>
  );
};
