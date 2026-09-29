export type Page =
  | 'landing'
  | 'dashboard'
  | 'new-analysis'
  | 'datasets'
  | 'history'
  | 'reports'
  | 'knowledge'
  | 'architecture'
  | 'n8n-chat'
  | 'settings';

export interface ColumnMeta {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  sampleValues: (string | number | boolean)[];
  missingCount: number;
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  fileType: 'CSV' | 'XLSX' | 'XLS';
  rowCount: number;
  columnCount: number;
  missingValues: number;
  numericColumns: string[];
  dateColumns: string[];
  categoricalColumns: string[];
  columns: ColumnMeta[];
  previewRows: Record<string, any>[];
  uploadDate: string;
  sizeFormatted: string;
  description?: string;
}

export type AgentType =
  | 'manager'
  | 'rag'
  | 'data'
  | 'sql'
  | 'viz'
  | 'critic'
  | 'report';

export type AgentStatus = 'waiting' | 'running' | 'completed' | 'error';

export interface AgentStep {
  id: string;
  agent: AgentType;
  name: string;
  role: string;
  status: AgentStatus;
  description: string;
  thought: string;
  task: string;
  codeSnippet?: {
    lang: string;
    title: string;
    code: string;
  };
  outputSummary?: string;
  latencyMs?: number;
  timestamp?: string;
}

export interface ChartTrendPoint {
  month: string;
  revenue: number;
  previousRevenue: number;
  orders: number;
}

export interface ChartProductPoint {
  product: string;
  revenue: number;
  units: number;
  share: number;
}

export interface ChartRegionPoint {
  region: string;
  revenue: number;
  growth: number;
  share: number;
}

export interface ChartCategoryPoint {
  category: string;
  value: number;
  color: string;
}

export interface VisualizationData {
  revenueTrend: ChartTrendPoint[];
  revenueByProduct: ChartProductPoint[];
  revenueByRegion: ChartRegionPoint[];
  categoryDistribution: ChartCategoryPoint[];
}

export interface AnalysisReport {
  executiveSummary: string;
  keyFindings: string[];
  supportingEvidence: string[];
  detectedPatterns: string[];
  potentialAnomalies: string[];
  recommendedInvestigation: string[];
  dataLimitations: string[];
}

export interface AnalysisRun {
  id: string;
  question: string;
  datasetId: string;
  datasetName: string;
  timestamp: string;
  status: 'Completed' | 'Running' | 'Failed';
  insightsCount: number;
  latencyMs: number;
  keyInsight: string;
  supportingEvidence: string[];
  metrics: {
    revenue: string;
    aov: string;
    topProduct: string;
    topRegion: string;
    growthRate: string;
  };
  visualizations: VisualizationData;
  report: AnalysisReport;
  agents: AgentStep[];
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  type: 'PDF' | 'TXT' | 'DOCX' | 'CSV';
  status: 'Indexed' | 'Processing' | 'Failed';
  chunks: number;
  lastUpdated: string;
  size: string;
  summary: string;
}

export interface N8nChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  error?: boolean;
  hint?: string;
  isFallback?: boolean;
  n8nError?: string;
  metadata?: any;
}

export interface AppSettings {
  geminiModel: string;
  temperature: number;
  maxTokens: number;
  criticStrictness: 'conservative' | 'balanced' | 'rigorous';
  enableLocalDuckDb: boolean;
  enablePandasSandbox: boolean;
  enableDataScrubbing: boolean;
  retentionDays: number;
  ragChunkSize: number;
  ragOverlap: number;
  embeddingModel: string;
  theme: 'dark' | 'light';
  n8nWebhookUrl: string;
  n8nTestMode: boolean;
}
