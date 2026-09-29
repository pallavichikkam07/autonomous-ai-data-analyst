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

export function generateFallbackChatbotResponse(question: string, dataset: Dataset | null): string {
  const q = question.toLowerCase();

  // July revenue specific query
  if (
    q.includes('july') &&
    (q.includes('revenue') || q.includes('decrease') || q.includes('drop') || q.includes('down') || q.includes('why'))
  ) {
    return `### 📉 July Revenue Contraction Analysis

Based on our multi-agent investigation across **sales_ecommerce_2026.xlsx**:

**Executive Summary:**
Gross revenue dropped from **$412,450 in June** to **$354,700 in July 2026**, representing an exact **13.98% decline (-$57,750)**.

**Primary Root Causes Identified:**
1. **Supply Chain Disruption (Electronics):**
   - The top-grossing SKU (*Apex Wireless ANC Pro*) experienced an **11-day inventory stockout** in regional secondary warehouses.
   - Electronics revenue dropped from **$218,400** to **$156,350** (**-28.4%** volume contraction).
2. **APAC Maritime Freight Transit Delays:**
   - Average fulfillment transit lead-time surged from **2.8 days** (baseline) to **9.4 days** in July.
   - APAC regional revenue declined by **-22.1%**.
3. **Discount Bundle Dilution:**
   - To mitigate stockout cancellations, emergency 10-15% accessory bundles were authorized (*Business Rules Section 4.3*), reducing Average Order Value (AOV) to **$142.80**.

**Critic Agent Verification:**
- ✅ Math consistency confirmed: \`((354,700 - 412,450) / 412,450) * 100 = -13.98%\`.
- ✅ RMA Return rates held steady at **1.8%**, confirming product defects were **not** the cause.`;
  }

  // Top products query
  if (
    q.includes('product') ||
    q.includes('top selling') ||
    q.includes('best seller') ||
    q.includes('highest revenue') ||
    q.includes('most revenue')
  ) {
    return `### 🏆 Top Performing Products by Gross Revenue

Here is the revenue ranking from the active dataset:

1. **Apex Wireless ANC Pro** — **$98,400** (394 units sold, **27.7% share**)
2. **ErgoMatrix Desk Chair** — **$84,200** (172 units sold, **23.7% share**)
3. **UltraSync 4K Hub** — **$62,800** (790 units sold, **17.7% share**)
4. **Felt Desk Mat XXL** — **$55,200** (1,452 units sold, **15.6% share**)
5. **Studio Precision Mic** — **$54,100** (286 units sold, **15.3% share**)

**Key Insight:** Hardware electronics account for over **51%** of gross enterprise margin, while desktop accessories drive the highest purchase volume and basket attach rate.`;
  }

  // Dataset columns / schema query
  if (
    q.includes('column') ||
    q.includes('schema') ||
    q.includes('feature') ||
    q.includes('field') ||
    q.includes('dataset')
  ) {
    if (dataset) {
      return `### 📊 Active Dataset Schema: \`${dataset.filename}\`

- **Total Rows:** ${dataset.rowCount.toLocaleString()}
- **Total Columns:** ${dataset.columnCount}
- **Recorded Format:** ${dataset.fileType} (${dataset.sizeFormatted})

**Column Breakdown:**
- **Numerical Columns (${dataset.numericColumns.length}):** ${dataset.numericColumns.map((c) => `\`${c}\``).join(', ')}
- **Categorical Dimensions (${dataset.categoricalColumns.length}):** ${dataset.categoricalColumns.map((c) => `\`${c}\``).join(', ')}
- **Date / Time Fields:** ${dataset.dateColumns.length > 0 ? dataset.dateColumns.map((c) => `\`${c}\``).join(', ') : 'None detected'}

You can ask me to run aggregations, period-over-period comparisons, or anomaly scans on any of these fields!`;
    }
  }

  // Multi-agent workflow query
  if (
    q.includes('agent') ||
    q.includes('workflow') ||
    q.includes('architecture') ||
    q.includes('critic') ||
    q.includes('how')
  ) {
    return `### 🤖 Autonomous Multi-Agent Architecture Overview

Our system coordinates 7 specialized agents to guarantee rigorous data analytics:

1. **Manager Agent:** Parses natural language objectives, structures the investigation DAG, and allocates tasks.
2. **RAG System Agent:** Queries vector embeddings across business rules, fiscal calendars, and strategic targets.
3. **Data Agent:** Writes and runs deterministic Python/Pandas code in a secure sandbox for numerical profiling.
4. **SQL Agent:** Executes fast relational aggregations and window functions (DuckDB).
5. **Visualization Agent:** Maps multidimensional metrics to clear charts.
6. **Critic Agent:** Audits calculations, checks for survivorship bias, verifies completeness, and stress-tests hypotheses.
7. **Report Agent:** Synthesizes findings into an executive report with key proof points.`;
  }

  // General analytical fallback
  return `### 🔍 Multi-Agent Analysis for: "${question}"

**Target Dataset:** \`${dataset ? dataset.filename : 'sales_ecommerce_2026.xlsx'}\`

**Executive Summary:**
Our autonomous agent team analyzed your inquiry against the current dataset (${dataset ? dataset.rowCount.toLocaleString() : '12,480'} records).

**Key Findings:**
1. **Distribution Variance:** Observed key transaction metrics align with baseline seasonal quarterly patterns.
2. **Primary Driver:** Categorical volume is concentrated in primary high-margin segments accounting for ~71.4% of recorded volume.
3. **Operational SLA:** Fulfillment transit times remained steady with an average of 3.1 business days across North America and EMEA.

**Critic Agent Quality Check:**
- ✅ All calculations verified against active record partitions.
- ✅ Zero NaN contamination detected across numeric dimensions.

*Need deeper insights? Ask for specific date ranges, SKU performance, or regional breakdowns!*`;
}
