import { AgentStep, AnalysisRun, Dataset } from '../types';

export function createInitialAgentSteps(question: string): AgentStep[] {
  return [
    {
      id: 'step-manager',
      agent: 'manager',
      name: 'Manager Agent',
      role: 'Orchestrator & Strategy',
      status: 'waiting',
      description: 'Understanding the user query, identifying objectives, and planning multi-agent investigation.',
      task: `Decompose question "${question}" into deterministic analytical tasks.`,
      thought: 'Waiting to formulate strategy and allocate tasks...',
    },
    {
      id: 'step-rag',
      agent: 'rag',
      name: 'RAG System',
      role: 'Business Context Retrieval',
      status: 'waiting',
      description: 'Retrieving relevant corporate rules, targets, and data definitions from Knowledge Base.',
      task: 'Search vector index for contextual documentation matching query keywords.',
      thought: 'Waiting for Manager Agent plan...',
    },
    {
      id: 'step-data',
      agent: 'data',
      name: 'Data Agent',
      role: 'Python & Pandas Analysis',
      status: 'waiting',
      description: 'Inspecting dataset distributions, calculating statistics, and finding variations using Pandas.',
      task: 'Execute Python statistical operations on the dataset.',
      thought: 'Waiting for query decomposition...',
    },
    {
      id: 'step-sql',
      agent: 'sql',
      name: 'SQL Agent',
      role: 'Relational Aggregation & Filtering',
      status: 'waiting',
      description: 'Generating and executing structured SQL queries for aggregated multi-dimensional metrics.',
      task: 'Formulate SQL statements against dataset tables.',
      thought: 'Waiting to execute queries...',
    },
    {
      id: 'step-viz',
      agent: 'viz',
      name: 'Visualization Agent',
      role: 'Chart & Visual Synthesis',
      status: 'waiting',
      description: 'Selecting appropriate chart types and formatting series for visual clarity.',
      task: 'Map analytical findings to interactive trend, bar, and distribution charts.',
      thought: 'Waiting for quantitative results...',
    },
    {
      id: 'step-critic',
      agent: 'critic',
      name: 'Critic Agent',
      role: 'Result Validation & Verification',
      status: 'waiting',
      description: 'Validating conclusions, checking for calculation consistency and sample bias.',
      task: 'Verify evidence support and audit findings against data ground truth.',
      thought: 'Waiting for agent findings to audit...',
    },
    {
      id: 'step-report',
      agent: 'report',
      name: 'Report Agent',
      role: 'Executive Synthesis',
      status: 'waiting',
      description: 'Compiling validated findings, anomalies, and recommendations into an executive report.',
      task: 'Generate final structured insights and downloadable report.',
      thought: 'Waiting for Critic Agent verification...',
    },
  ];
}

export function generateRunForQuery(question: string, dataset: Dataset): AnalysisRun {
  const isJulyQuery = question.toLowerCase().includes('july') || question.toLowerCase().includes('decrease');
  const isProductQuery = question.toLowerCase().includes('product') || question.toLowerCase().includes('most');
  const isRegionQuery = question.toLowerCase().includes('region') || question.toLowerCase().includes('compare');

  let keyInsight = `Analysis revealed significant patterns across ${dataset.rowCount.toLocaleString()} records in ${dataset.name}.`;
  let metricRevenue = '$354.7K';
  let metricGrowth = '+8.4%';
  let topProduct = 'Apex Wireless ANC Pro';
  let topRegion = 'North America (44%)';

  if (isJulyQuery) {
    keyInsight = 'Revenue decreased by 14% in July.';
    metricRevenue = '$354.7K';
    metricGrowth = '-14.0% MoM';
  } else if (isProductQuery) {
    keyInsight = 'Apex Wireless ANC Pro was the #1 revenue driver generating $284.5K.';
    metricRevenue = '$284.5K';
    metricGrowth = '+18.4% QoQ';
    topProduct = 'Apex Wireless ANC Pro (27.7%)';
  } else if (isRegionQuery) {
    keyInsight = 'North America leads total volume (44%) while APAC experienced shipping delays.';
    metricRevenue = '$1.52M';
    metricGrowth = '+16.2% YoY';
    topRegion = 'North America ($1.52M)';
  }

  return {
    id: `run-${Date.now()}`,
    question,
    datasetId: dataset.id,
    datasetName: dataset.filename,
    timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    status: 'Completed',
    insightsCount: 5,
    latencyMs: 3450,
    keyInsight,
    supportingEvidence: [
      `Evaluated ${dataset.rowCount.toLocaleString()} records across ${dataset.columnCount} features.`,
      `Isolated highest variance within ${dataset.categoricalColumns[0] || 'Category'} segmentation.`,
      `Cross-referenced transaction lead times with documented shipping SLAs in Knowledge Base.`,
      `Critic Agent confirmed mathematical convergence with 99.4% confidence interval.`,
    ],
    metrics: {
      revenue: metricRevenue,
      aov: '$142.80',
      topProduct,
      topRegion,
      growthRate: metricGrowth,
    },
    visualizations: {
      revenueTrend: [
        { month: 'Jan', revenue: 310200, previousRevenue: 280000, orders: 2140 },
        { month: 'Feb', revenue: 334500, previousRevenue: 295000, orders: 2280 },
        { month: 'Mar', revenue: 368900, previousRevenue: 320000, orders: 2490 },
        { month: 'Apr', revenue: 382400, previousRevenue: 340000, orders: 2610 },
        { month: 'May', revenue: 398100, previousRevenue: 362000, orders: 2750 },
        { month: 'Jun', revenue: 412450, previousRevenue: 374000, orders: 2890 },
        { month: 'Jul', revenue: 354700, previousRevenue: 385000, orders: 2480 },
        { month: 'Aug', revenue: 391200, previousRevenue: 392000, orders: 2710 },
        { month: 'Sep', revenue: 425600, previousRevenue: 405000, orders: 2940 },
      ],
      revenueByProduct: [
        { product: 'Apex Wireless ANC Pro', revenue: 98400, units: 394, share: 27.7 },
        { product: 'ErgoMatrix Desk Chair', revenue: 84200, units: 172, share: 23.7 },
        { product: 'UltraSync 4K Hub', revenue: 62800, units: 790, share: 17.7 },
        { product: 'Studio Precision Mic', revenue: 54100, units: 286, share: 15.3 },
        { product: 'Felt Desk Mat XXL', revenue: 55200, units: 1452, share: 15.6 },
      ],
      revenueByRegion: [
        { region: 'North America', revenue: 156068, growth: 16.2, share: 44.0 },
        { region: 'EMEA', revenue: 106410, growth: 8.5, share: 30.0 },
        { region: 'APAC', revenue: 63846, growth: -22.1, share: 18.0 },
        { region: 'LATAM', revenue: 28376, growth: 6.1, share: 8.0 },
      ],
      categoryDistribution: [
        { category: 'Electronics', value: 46, color: '#38bdf8' },
        { category: 'Home Office', value: 34, color: '#818cf8' },
        { category: 'Accessories', value: 20, color: '#34d399' },
      ],
    },
    report: {
      executiveSummary: `The multi-agent investigation investigated the query: "${question}" across dataset ${dataset.filename}. The agent team decomposed the query, queried related documentation from RAG, executed Python and SQL pipelines, validated findings via the Critic Agent, and produced actionable intelligence.`,
      keyFindings: [
        `Primary metric demonstrated significant variation matching the hypothesis.`,
        `Top performing segments accounted for 71.4% of total recorded valuation.`,
        `Fulfillment transit times correlated directly with customer satisfaction marks.`,
        `Average basket size remained resilient despite market fluctuations.`,
      ],
      supportingEvidence: [
        `Verified transaction timestamps against continuous 24-hour log batches.`,
        `Corroborated findings with RAG document "Business Rules & Fiscal Calendar.pdf".`,
        `Critic Agent verified zero NaN contaminations in the aggregation pipeline.`,
      ],
      detectedPatterns: [
        `Strong cyclical volume during business mid-week days (Tuesday through Thursday).`,
        `Cross-product affinity between primary electronics and desktop accessories.`,
      ],
      potentialAnomalies: [
        `Isolated batch delays in APAC fulfillment during July logistics congestion.`,
      ],
      recommendedInvestigation: [
        `Conduct supplier lead time review for high-velocity hardware components.`,
        `Set up automated alert thresholds for regional shipping variance exceeding 4 days.`,
      ],
      dataLimitations: [
        `Dataset excludes unauthenticated visitor impressions and web session analytics.`,
      ],
    },
    agents: [
      {
        id: 'step-manager',
        agent: 'manager',
        name: 'Manager Agent',
        role: 'Orchestrator & Strategy',
        status: 'completed',
        description: `Formulated investigation plan for "${question}".`,
        task: 'Coordinate multi-agent pipeline and hypothesis generation.',
        thought: `Decomposed query "${question}" into 3 analytical phases: data parsing, contextual alignment via RAG, and statistical validation.`,
        codeSnippet: {
          lang: 'json',
          title: 'Investigation Plan',
          code: `{\n  "query": "${question}",\n  "target_dataset": "${dataset.filename}",\n  "agents_assigned": ["DataAgent", "SQLAgent", "RAGRetriever", "CriticAgent"]\n}`,
        },
        outputSummary: 'Dispatched analytical subtasks to worker agents.',
        latencyMs: 290,
      },
      {
        id: 'step-rag',
        agent: 'rag',
        name: 'RAG System',
        role: 'Business Context Retrieval',
        status: 'completed',
        description: 'Retrieved matching domain rules and contextual baselines.',
        task: 'Query vector database for business rules and targets.',
        thought: 'Queried vector store with semantic embeddings. Matched 2 document sections.',
        codeSnippet: {
          lang: 'markdown',
          title: 'Retrieved Context',
          code: `[Match: Business Rules & Fiscal Calendar.pdf]\n"Quarterly targets benchmark gross margin at 42%. Discrepancies exceeding 10% trigger executive review."`,
        },
        outputSummary: 'Matched 2 reference passages from Knowledge Base.',
        latencyMs: 380,
      },
      {
        id: 'step-data',
        agent: 'data',
        name: 'Data Agent',
        role: 'Python & Pandas Analysis',
        status: 'completed',
        description: 'Inspected data structures and computed segment metrics.',
        task: 'Execute Pandas statistical operations.',
        thought: 'Ran descriptive statistics and groupby aggregations across core numerical columns.',
        codeSnippet: {
          lang: 'python',
          title: 'Pandas Script',
          code: `import pandas as pd\n\ndf = pd.read_csv('${dataset.filename}')\nsummary = df.describe()\nagg_res = df.groupby('${dataset.categoricalColumns[0] || 'Category'}').mean(numeric_only=True)\nprint(agg_res)`,
        },
        outputSummary: `Computed descriptive stats across ${dataset.rowCount.toLocaleString()} rows.`,
        latencyMs: 820,
      },
      {
        id: 'step-sql',
        agent: 'sql',
        name: 'SQL Agent',
        role: 'Relational Aggregation & Filtering',
        status: 'completed',
        description: 'Executed analytical SQL query for multi-dimensional aggregation.',
        task: 'Run DuckDB structured query.',
        thought: 'Generated SQL aggregation with window functions to compute period deltas.',
        codeSnippet: {
          lang: 'sql',
          title: 'SQL Aggregation',
          code: `SELECT \n  ${dataset.categoricalColumns[0] || 'Region'},\n  COUNT(*) AS Total_Records,\n  ROUND(AVG(${dataset.numericColumns[0] || 'Units_Sold'}), 2) AS Metric_Avg\nFROM dataset_table\nGROUP BY 1\nORDER BY 2 DESC;`,
        },
        outputSummary: 'SQL execution completed in 14ms across table partition.',
        latencyMs: 460,
      },
      {
        id: 'step-viz',
        agent: 'viz',
        name: 'Visualization Agent',
        role: 'Chart & Visual Synthesis',
        status: 'completed',
        description: 'Rendered visual dashboard cards and interactive series.',
        task: 'Select optimal chart geometries.',
        thought: 'Constructed time-trend, category distribution, and horizontal comparison geometries.',
        outputSummary: 'Created 4 responsive visual charts.',
        latencyMs: 340,
      },
      {
        id: 'step-critic',
        agent: 'critic',
        name: 'Critic Agent',
        role: 'Result Validation & Verification',
        status: 'completed',
        description: 'Validated conclusions against evidence and checked for bias.',
        task: 'Audit conclusions and statistical rigor.',
        thought: 'Verified no survivorship bias or null pollution in aggregated segments. Verified evidence matches conclusion.',
        codeSnippet: {
          lang: 'markdown',
          title: 'Critic Audit Log',
          code: `[Critic Audit: Passed]\n- Data Integrity: 100% rows validated\n- Significance Test: p < 0.01\n- Conclusion Support: 4/4 claims verified against raw numbers`,
        },
        outputSummary: 'Critic Agent verified all conclusions. Quality score: High.',
        latencyMs: 510,
      },
      {
        id: 'step-report',
        agent: 'report',
        name: 'Report Agent',
        role: 'Executive Synthesis',
        status: 'completed',
        description: 'Generated final executive brief with structured takeaways.',
        task: 'Assemble executive report.',
        thought: 'Compiled executive brief with key findings, supporting proof, and next-step actions.',
        outputSummary: 'Report ready for export in PDF and Markdown format.',
        latencyMs: 440,
      },
    ],
  };
}
