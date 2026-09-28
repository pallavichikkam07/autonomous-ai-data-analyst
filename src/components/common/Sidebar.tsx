import React from 'react';
import { Page, Dataset } from '../../types';
import {
  LayoutDashboard,
  Sparkles,
  Database,
  History,
  FileText,
  BookOpen,
  Cpu,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  activeDataset: Dataset | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onNewAnalysisClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  activeDataset,
  collapsed,
  setCollapsed,
  onNewAnalysisClick,
}) => {
  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'new-analysis' as Page,
      label: 'New Analysis',
      icon: Sparkles,
      action: onNewAnalysisClick,
    },
    { id: 'datasets' as Page, label: 'Datasets', icon: Database },
    { id: 'history' as Page, label: 'Analysis History', icon: History },
    { id: 'reports' as Page, label: 'Reports', icon: FileText },
    { id: 'knowledge' as Page, label: 'Knowledge Base', icon: BookOpen },
    { id: 'architecture' as Page, label: 'Agent Activity', icon: Cpu },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-slate-950 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
              <Layers className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold tracking-tight text-white">
                AutonomousAI
              </div>
              <div className="text-[11px] text-slate-400">Agentic Data Engine</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.id ||
              (item.id === 'new-analysis' && currentPage === 'dashboard');

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setCurrentPage(item.id);
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate text-left">{item.label}</span>
                )}
                {!collapsed && item.id === 'new-analysis' && (
                  <span className="ml-auto text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Dataset Status Widget */}
        {!collapsed && activeDataset && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 px-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Active Dataset
            </div>
            <div className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 truncate">
                <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{activeDataset.filename}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>{activeDataset.rowCount.toLocaleString()} rows</span>
                <span>{activeDataset.columnCount} cols</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-1 rounded-full w-full" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                <span>Status: Ingested</span>
                <span>Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium">Multi-Agent Core</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">Online</span>
          </div>
        ) : (
          <div className="flex justify-center text-emerald-400" title="Multi-Agent Core Online">
            <ShieldCheck className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
