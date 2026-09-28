import React, { useState } from 'react';
import { VisualizationData } from '../../types';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Globe2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface VisualizationsProps {
  data: VisualizationData;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ data }) => {
  const [activeTrendPoint, setActiveTrendPoint] = useState<number | null>(6); // Default July (idx 6)
  const [activeProductIdx, setActiveProductIdx] = useState<number | null>(null);

  // SVG Line Chart Calculation
  const trendMax = Math.max(...data.revenueTrend.map((d) => d.revenue)) * 1.15;
  const trendMin = Math.min(...data.revenueTrend.map((d) => d.revenue)) * 0.85;
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = data.revenueTrend.map((d, i) => {
    const x = paddingX + (i / (data.revenueTrend.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((d.revenue - trendMin) / (trendMax - trendMin)) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Product Max for bar scaling
  const maxProductRevenue = Math.max(...data.revenueByProduct.map((p) => p.revenue));

  // Category Total
  const totalCategory = data.categoryDistribution.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Visual Analytics & Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            Automated visualization agent output mapping transactional variances
          </p>
        </div>
      </div>

      {/* 2x2 Grid of High-Fidelity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Revenue Trend Line Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-200">
                Monthly Gross Revenue Trend
              </h4>
            </div>
            {activeTrendPoint !== null && (
              <div className="text-xs font-mono text-cyan-300">
                {data.revenueTrend[activeTrendPoint].month}: ${data.revenueTrend[activeTrendPoint].revenue.toLocaleString()}
              </div>
            )}
          </div>

          <div className="relative w-full h-[240px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={chartHeight / 2}
                x2={chartWidth - paddingX}
                y2={chartHeight / 2}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Shaded Area */}
              <path d={areaD} fill="url(#trendGradient)" />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Dots */}
              {points.map((p, idx) => {
                const isSelected = activeTrendPoint === idx;
                const isDip = p.month === 'Jul';
                return (
                  <g
                    key={p.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveTrendPoint(idx)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 6 : isDip ? 5 : 3.5}
                      className={`transition-all ${
                        isDip
                          ? 'fill-rose-500 stroke-slate-900 stroke-2'
                          : isSelected
                          ? 'fill-cyan-400 stroke-slate-950 stroke-2'
                          : 'fill-slate-900 stroke-cyan-400 stroke-2'
                      }`}
                    />
                    {isDip && (
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        className="text-[10px] fill-rose-400 font-mono font-bold"
                      >
                        -14%
                      </text>
                    )}
                    <text
                      x={p.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className={`text-[10px] font-mono ${
                        isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-400'
                      }`}
                    >
                      {p.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 2. Revenue by Product Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-200">
                Revenue by Top Products
              </h4>
            </div>
            <span className="text-xs text-slate-400">Share of Total</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {data.revenueByProduct.map((prod, idx) => {
              const widthPct = Math.round((prod.revenue / maxProductRevenue) * 100);
              return (
                <div
                  key={prod.product}
                  onMouseEnter={() => setActiveProductIdx(idx)}
                  onMouseLeave={() => setActiveProductIdx(null)}
                  className="space-y-1 group cursor-default"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-[240px]">
                      {prod.product}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">{prod.share}%</span>
                      <span className="font-semibold text-white tabular-nums">
                        ${prod.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Revenue by Region Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-200">
                Regional Distribution & Variance
              </h4>
            </div>
            <span className="text-xs text-slate-400">MoM Performance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.revenueByRegion.map((region) => {
              const isNegative = region.growth < 0;
              return (
                <div
                  key={region.region}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{region.region}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {region.share}% share
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono tabular-nums">
                    ${region.revenue.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px]">Growth delta</span>
                    <span
                      className={`flex items-center text-xs font-mono font-semibold ${
                        isNegative ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isNegative ? (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      )}
                      {region.growth > 0 ? `+${region.growth}%` : `${region.growth}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Category Distribution Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-bold text-slate-200">
                Category Contribution
              </h4>
            </div>
            <span className="text-xs text-slate-400">Portfolio Mix</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Visual SVG Donut */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulated = 0;
                  return data.categoryDistribution.map((cat) => {
                    const strokeDasharray = `${(cat.value / totalCategory) * 251.2} 251.2`;
                    const strokeDashoffset = -((accumulated / totalCategory) * 251.2);
                    accumulated += cat.value;
                    return (
                      <circle
                        key={cat.category}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-mono text-slate-400">Total</span>
                <span className="text-sm font-bold text-white font-mono">100%</span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="space-y-3 w-full sm:w-auto">
              {data.categoryDistribution.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-200">{cat.category}</span>
                  </div>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
