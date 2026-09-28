import React from 'react';
import { Page, Dataset } from '../../types';
import {
  Sparkles,
  Database,
  Terminal,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Bot,
} from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  activeDataset: Dataset | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNewAnalysis?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  activeDataset,
  theme,
  toggleTheme,
  onNewAnalysis,
  onToggleChat,
  isChatOpen,
}) => {
  const isLanding = currentPage === 'landing';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Zone 1: Single brand wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20 text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                AutonomousAI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
                Multi-Agent Data Analyst
              </span>
            </div>
          </button>

          {!isLanding && activeDataset && (
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4 text-xs text-slate-400">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span className="truncate max-w-[180px] font-medium text-slate-300">
                {activeDataset.filename}
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-400">
                {activeDataset.rowCount.toLocaleString()} rows
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`transition-colors hover:text-white ${
              currentPage === 'landing' ? 'text-indigo-400' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`transition-colors hover:text-white ${
              currentPage === 'dashboard' ? 'text-indigo-400' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('architecture')}
            className={`transition-colors hover:text-white ${
              currentPage === 'architecture' ? 'text-indigo-400' : ''
            }`}
          >
            Agent Architecture
          </button>
          <button
            onClick={() => setCurrentPage('knowledge')}
            className={`transition-colors hover:text-white ${
              currentPage === 'knowledge' ? 'text-indigo-400' : ''
            }`}
          >
            Knowledge Base (RAG)
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`transition-colors hover:text-white ${
              currentPage === 'history' ? 'text-indigo-400' : ''
            }`}
          >
            History
          </button>
          <button
            onClick={() => setCurrentPage('n8n-chat')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${
              currentPage === 'n8n-chat' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400" />
            <span>n8n Chatbot</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isChatOpen
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title="Toggle n8n Chatbot"
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">n8n Chat</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900 border border-slate-800/80"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {isLanding ? (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:shadow-indigo-500/25 whitespace-nowrap"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (onNewAnalysis) onNewAnalysis();
                setCurrentPage('dashboard');
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-indigo-600 transition-all whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
