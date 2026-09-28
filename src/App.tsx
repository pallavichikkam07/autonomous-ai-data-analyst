import React, { useState, useEffect } from 'react';
import {
  Page,
  Dataset,
  AnalysisRun,
  KnowledgeDoc,
  AppSettings,
  AgentStep,
} from './types';
import {
  DEFAULT_DATASETS,
  DEFAULT_HISTORY,
  DEFAULT_KNOWLEDGE_DOCS,
  DEFAULT_SETTINGS,
  JULY_REVENUE_ANALYSIS,
} from './data/mockData';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DatasetUploader } from './components/dashboard/DatasetUploader';
import { DatasetOverview } from './components/dashboard/DatasetOverview';
import { QueryBox } from './components/dashboard/QueryBox';
import { AgentActivity } from './components/dashboard/AgentActivity';
import { InsightCards } from './components/dashboard/InsightCards';
import { Visualizations } from './components/dashboard/Visualizations';
import { ReportViewer } from './components/dashboard/ReportViewer';
import { FullDatasetModal } from './components/dashboard/FullDatasetModal';
import { KnowledgeBase } from './components/knowledge/KnowledgeBase';
import { AgentArchitecture } from './components/architecture/AgentArchitecture';
import { AnalysisHistory } from './components/history/AnalysisHistory';
import { SettingsView } from './components/settings/SettingsView';
import { DatasetsView } from './components/datasets/DatasetsView';
import { ReportsView } from './components/reports/ReportsView';
import { N8nChatbot } from './components/chatbot/N8nChatbot';
import { createInitialAgentSteps, generateRunForQuery } from './utils/agentRunner';
import { Sparkles, ArrowRight, Layers, Database, Bot, MessageSquare } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [datasets, setDatasets] = useState<Dataset[]>(DEFAULT_DATASETS);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(DEFAULT_DATASETS[0]);
  const [historyRuns, setHistoryRuns] = useState<AnalysisRun[]>(DEFAULT_HISTORY);
  const [currentRun, setCurrentRun] = useState<AnalysisRun>(JULY_REVENUE_ANALYSIS);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(JULY_REVENUE_ANALYSIS.agents);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(DEFAULT_KNOWLEDGE_DOCS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isFullDatasetOpen, setIsFullDatasetOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Synchronize theme with body
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Execution pipeline simulation
  const handleAnalyzeQuery = (question: string) => {
    if (!activeDataset || isAnalyzing) return;

    setIsAnalyzing(true);
    const initialSteps = createInitialAgentSteps(question);
    setAgentSteps(initialSteps);

    // Sequence stages
    const timeline = [
      { idx: 0, duration: 350 }, // Manager
      { idx: 1, duration: 400 }, // RAG
      { idx: 2, duration: 750 }, // Data
      { idx: 3, duration: 550 }, // SQL
      { idx: 4, duration: 400 }, // Viz
      { idx: 5, duration: 600 }, // Critic
      { idx: 6, duration: 450 }, // Report
    ];

    let currentDelay = 0;
    timeline.forEach((item, index) => {
      currentDelay += item.duration;

      setTimeout(() => {
        setAgentSteps((prevSteps) => {
          const next = [...prevSteps];
          // Mark current as running
          if (next[item.idx]) {
            next[item.idx] = {
              ...next[item.idx],
              status: 'running',
              thought: `Investigating ${next[item.idx].role} requirements...`,
            };
          }
          // Mark previous as completed
          if (item.idx > 0 && next[item.idx - 1]) {
            next[item.idx - 1] = {
              ...next[item.idx - 1],
              status: 'completed',
            };
          }
          return next;
        });

        // If last step is done
        if (index === timeline.length - 1) {
          setTimeout(() => {
            const finalRun = generateRunForQuery(question, activeDataset);
            setAgentSteps(finalRun.agents);
            setCurrentRun(finalRun);
            setHistoryRuns((prev) => [finalRun, ...prev]);
            setIsAnalyzing(false);
          }, 450);
        }
      }, currentDelay);
    });
  };

  const handleDatasetUploaded = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev.filter((d) => d.id !== newDataset.id)]);
    setActiveDataset(newDataset);
  };

  const handleRemoveDataset = () => {
    setActiveDataset(null);
  };

  const handleSelectSampleDataset = (ds: Dataset) => {
    setActiveDataset(ds);
    setCurrentPage('dashboard');
  };

  const handleReindexKnowledge = () => {
    setIsReindexing(true);
    setTimeout(() => {
      setIsReindexing(false);
      setKnowledgeDocs((prev) =>
        prev.map((d) => ({
          ...d,
          status: 'Indexed',
          lastUpdated: 'Just now',
        }))
      );
    }, 1800);
  };

  const handleSelectHistoryRun = (run: AnalysisRun) => {
    setCurrentRun(run);
    setAgentSteps(run.agents.length > 0 ? run.agents : JULY_REVENUE_ANALYSIS.agents);
    const ds = datasets.find((d) => d.id === run.datasetId) || activeDataset;
    if (ds) setActiveDataset(ds);
    setCurrentPage('dashboard');
  };

  const handleDeleteHistoryRun = (runId: string) => {
    setHistoryRuns((prev) => prev.filter((r) => r.id !== runId));
  };

  const handleAddKnowledgeDoc = (newDoc: KnowledgeDoc) => {
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const handleDeleteKnowledgeDoc = (id: string) => {
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleStartAnalyzing = () => {
    setCurrentPage('dashboard');
  };

  const handleViewHowItWorks = () => {
    setCurrentPage('architecture');
  };

  const handleNewAnalysis = () => {
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Strict 3-zone Header Contract */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        activeDataset={activeDataset}
        theme={settings.theme}
        toggleTheme={toggleTheme}
        onNewAnalysis={handleNewAnalysis}
        onToggleChat={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        isChatOpen={isFloatingChatOpen}
      />

      {/* Main Viewport */}
      {currentPage === 'landing' ? (
        <LandingPage
          onStartAnalyzing={handleStartAnalyzing}
          onViewHowItWorks={handleViewHowItWorks}
          onSelectSampleDataset={handleSelectSampleDataset}
          sampleDatasets={datasets}
        />
      ) : (
        <div className="flex-1 flex w-full">
          {/* Collapsible Left Sidebar */}
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            activeDataset={activeDataset}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onNewAnalysisClick={handleNewAnalysis}
          />

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
            {/* View Switching */}
            {currentPage === 'dashboard' && (
              <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                      AI Data Analyst
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Ask questions about your data and let the agents investigate.
                    </p>
                  </div>

                  {activeDataset && (
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Database className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{activeDataset.filename}</span>
                      <span>·</span>
                      <span className="text-emerald-400">Ready</span>
                    </div>
                  )}
                </div>

                {/* 1. Dataset Upload Card */}
                <DatasetUploader
                  dataset={activeDataset}
                  onDatasetUploaded={handleDatasetUploaded}
                  onRemoveDataset={handleRemoveDataset}
                  sampleDatasets={datasets}
                />

                {/* 2. Dataset Overview (if dataset is active) */}
                {activeDataset && (
                  <DatasetOverview
                    dataset={activeDataset}
                    onViewFullDataset={() => setIsFullDatasetOpen(true)}
                  />
                )}

                {/* 3. Natural Language Query Area */}
                {activeDataset && (
                  <QueryBox
                    onAnalyze={handleAnalyzeQuery}
                    isAnalyzing={isAnalyzing}
                    activeDatasetName={activeDataset.name}
                  />
                )}

                {/* 4. Agent Activity Panel */}
                <AgentActivity
                  steps={agentSteps}
                  isAnalyzing={isAnalyzing}
                />

                {/* 5. Insights Dashboard (Key Insight + Metrics) */}
                <InsightCards analysis={currentRun} />

                {/* 6. Visualizations Section */}
                <Visualizations data={currentRun.visualizations} />

                {/* 7. AI Generated Report */}
                <ReportViewer
                  report={currentRun.report}
                  datasetName={currentRun.datasetName}
                  question={currentRun.question}
                  activeDataset={activeDataset}
                />
              </div>
            )}

            {currentPage === 'datasets' && (
              <DatasetsView
                datasets={datasets}
                activeDataset={activeDataset}
                onSelectDataset={(ds) => {
                  setActiveDataset(ds);
                  setCurrentPage('dashboard');
                }}
                onRemoveDataset={(id) => {
                  setDatasets((prev) => prev.filter((d) => d.id !== id));
                  if (activeDataset?.id === id) {
                    setActiveDataset(null);
                  }
                }}
                onGoToUpload={() => setCurrentPage('dashboard')}
              />
            )}

            {currentPage === 'reports' && (
              <ReportsView
                runs={historyRuns}
                onSelectRun={(run) => {
                  handleSelectHistoryRun(run);
                  setCurrentPage('dashboard');
                }}
                activeDataset={activeDataset}
              />
            )}

            {currentPage === 'knowledge' && (
              <KnowledgeBase
                documents={knowledgeDocs}
                onAddDocument={handleAddKnowledgeDoc}
                onDeleteDocument={handleDeleteKnowledgeDoc}
                onReindex={handleReindexKnowledge}
                isReindexing={isReindexing}
              />
            )}

            {currentPage === 'architecture' && <AgentArchitecture />}

            {currentPage === 'n8n-chat' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Bot className="h-5 w-5 text-cyan-400" />
                      <span>n8n Autonomous AI Chatbot</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Live interactive AI assistant connected to your n8n workflow.
                    </p>
                  </div>
                </div>

                <N8nChatbot
                  webhookUrl={settings.n8nWebhookUrl}
                  activeDataset={activeDataset}
                  mode="full"
                  onNavigateToDatasets={() => setCurrentPage('datasets')}
                />
              </div>
            )}

            {currentPage === 'history' && (
              <AnalysisHistory
                runs={historyRuns}
                onSelectRun={handleSelectHistoryRun}
                onDeleteRun={handleDeleteHistoryRun}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
                toggleTheme={toggleTheme}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating n8n Chatbot Button & Widget */}
      {currentPage !== 'n8n-chat' && (
        <>
          {/* Floating Widget */}
          {isFloatingChatOpen && (
            <N8nChatbot
              webhookUrl={settings.n8nWebhookUrl}
              activeDataset={activeDataset}
              mode="floating"
              isOpen={isFloatingChatOpen}
              onClose={() => setIsFloatingChatOpen(false)}
              onNavigateToDatasets={() => {
                setIsFloatingChatOpen(false);
                setCurrentPage('datasets');
              }}
            />
          )}

          {/* Floating Launcher Button */}
          {!isFloatingChatOpen && (
            <button
              onClick={() => setIsFloatingChatOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 px-4 py-3 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 hover:shadow-indigo-600/45 transition-all group"
              aria-label="Open n8n Chatbot"
            >
              <div className="relative">
                <Bot className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                </span>
              </div>
              <span className="text-xs font-bold tracking-tight pr-1">n8n Agent</span>
            </button>
          )}
        </>
      )}

      {/* Full Dataset Modal */}
      {activeDataset && (
        <FullDatasetModal
          dataset={activeDataset}
          isOpen={isFullDatasetOpen}
          onClose={() => setIsFullDatasetOpen(false)}
        />
      )}
    </div>
  );
}
