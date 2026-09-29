import React, { useState, useRef, useEffect } from 'react';
import { Dataset, N8nChatMessage } from '../../types';
import { generateFallbackChatbotResponse } from '../../utils/agentRunner';
import {
  Bot,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowRight,
  Layers,
  HelpCircle,
  Wrench,
  Activity,
  AlertTriangle,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface N8nChatbotProps {
  webhookUrl: string;
  activeDataset: Dataset | null;
  mode?: 'full' | 'floating';
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateToDatasets?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'Why did revenue decrease in July?',
  'Which product generated the most revenue?',
  'What are the columns in the active dataset?',
  'Summarize the multi-agent investigation workflow',
];

export const N8nChatbot: React.FC<N8nChatbotProps> = ({
  webhookUrl,
  activeDataset,
  mode = 'full',
  isOpen = true,
  onClose,
  onNavigateToDatasets,
}) => {
  const [messages, setMessages] = useState<N8nChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `Hello! I am your **AutonomousAI Data Analyst Chatbot**, connected to your n8n workflow.

You can ask me questions about your uploaded datasets, analytical findings, or query custom data operations. What would you like to investigate today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);
  const [autoFallback, setAutoFallback] = useState(true);
  const [customWebhookUrl, setCustomWebhookUrl] = useState(webhookUrl);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastErrorHint, setLastErrorHint] = useState<string | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<'unknown' | 'error_500' | 'not_active_404' | 'healthy'>('unknown');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate / retrieve persistent sessionId for n8n memory
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem('n8n_chat_session_id');
    if (existing) return existing;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('n8n_chat_session_id', newId);
    return newId;
  });

  // Effective endpoint calculation
  const effectiveUrl = useTestMode
    ? customWebhookUrl.replace('/webhook/', '/webhook-test/')
    : customWebhookUrl;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. Send a new message to start a fresh investigation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastErrorHint(null);
  };

  const checkN8nHealth = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/n8n-chat', { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 200) {
        setN8nStatus('healthy');
        setPingResult('✅ n8n Webhook is online and responding (HTTP 200)');
      } else if (res.status === 404) {
        setN8nStatus('not_active_404');
        setPingResult('⚠️ n8n returned 404: Workflow is inactive. Toggle it to Active in n8n editor.');
      } else {
        setN8nStatus('error_500');
        setPingResult(`⚠️ n8n responded with HTTP ${res.status}: Workflow execution error.`);
      }
    } catch (e: any) {
      setN8nStatus('error_500');
      setPingResult(`Connection error: ${e.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: N8nChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);
    setLastErrorHint(null);

    const payload = {
      webhookUrl: effectiveUrl,
      action: 'sendMessage',
      sessionId: sessionId,
      chatInput: messageContent,
      message: messageContent,
      context: activeDataset
        ? {
            datasetName: activeDataset.name,
            filename: activeDataset.filename,
            rowCount: activeDataset.rowCount,
            columnCount: activeDataset.columnCount,
            columns: activeDataset.columns.map((c) => c.name),
            numericColumns: activeDataset.numericColumns,
            categoricalColumns: activeDataset.categoricalColumns,
          }
        : null,
    };

    try {
      let response: Response;
      try {
        response = await fetch('/api/n8n-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: JSON.stringify(payload),
        });
      } catch {
        response = await fetch(effectiveUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: JSON.stringify(payload),
        });
      }

      const responseText = await response.text();
      let botText = '';
      let isError = false;
      let hint: string | undefined;
      let isFallback = false;
      let n8nError: string | undefined;

      try {
        const data = JSON.parse(responseText);

        if (response.status === 500 || data.message === 'Error in workflow') {
          setN8nStatus('error_500');
          n8nError = 'n8n workflow returned HTTP 500 (Error in workflow)';

          if (autoFallback) {
            // Auto fallback to rich built-in multi-agent response
            botText = generateFallbackChatbotResponse(messageContent, activeDataset);
            isFallback = true;
            isError = false;
            hint = 'n8n workflow failed (HTTP 500). Answered via Built-in AI Analyst.';
          } else {
            isError = true;
            hint = 'A node inside your n8n workflow threw an error.';
            botText = `⚠️ **n8n Workflow Execution Error (HTTP 500)**

Your n8n workflow received the message, but an internal node failed during execution:
> **"Error in workflow"**

**Immediate Fix in your n8n Canvas:**
1. Open [pallavichikkam.app.n8n.cloud](https://pallavichikkam.app.n8n.cloud).
2. Click **Executions** in the left sidebar to see the red execution.
3. Check your **AI Model** node (OpenAI/Gemini/Anthropic) to verify the API key is connected.`;
          }
          setLastErrorHint(hint);
        } else if (response.status === 404 && (data.code === 404 || data.message?.includes('not registered'))) {
          setN8nStatus('not_active_404');
          if (autoFallback) {
            botText = generateFallbackChatbotResponse(messageContent, activeDataset);
            isFallback = true;
            isError = false;
            hint = 'n8n workflow inactive (HTTP 404). Answered via Built-in AI Analyst.';
          } else {
            isError = true;
            hint = data.hint || 'Workflow must be active in n8n.';
            botText = `⚠️ **n8n Webhook Not Activated (HTTP 404)**

The workflow must be active for production URLs to run.
1. Open [pallavichikkam.app.n8n.cloud](https://pallavichikkam.app.n8n.cloud).
2. Toggle the switch in the top-right corner to **Active**.`;
          }
          setLastErrorHint(hint || null);
        } else if (data.output) {
          setN8nStatus('healthy');
          botText = typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2);
        } else if (data.text) {
          setN8nStatus('healthy');
          botText = typeof data.text === 'string' ? data.text : JSON.stringify(data.text, null, 2);
        } else if (data.message) {
          setN8nStatus('healthy');
          botText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message, null, 2);
        } else if (data.response) {
          setN8nStatus('healthy');
          botText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
        } else if (Array.isArray(data) && data.length > 0) {
          setN8nStatus('healthy');
          botText = data[0].output || data[0].text || data[0].message || JSON.stringify(data, null, 2);
        } else {
          setN8nStatus('healthy');
          botText = JSON.stringify(data, null, 2);
        }
      } catch {
        botText = responseText || (response.ok ? 'Received response from agent.' : `Error: HTTP ${response.status}`);
        if (!response.ok) {
          if (autoFallback) {
            botText = generateFallbackChatbotResponse(messageContent, activeDataset);
            isFallback = true;
          } else {
            isError = true;
          }
        }
      }

      const botMessage: N8nChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: isError,
        hint,
        isFallback,
        n8nError,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      if (autoFallback) {
        const fallbackText = generateFallbackChatbotResponse(messageContent, activeDataset);
        const botMessage: N8nChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: false,
          isFallback: true,
          n8nError: `Connection error: ${err.message}`,
          hint: 'Network connection issue. Fallback AI provided response.',
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errMessage: N8nChatMessage = {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **Connection Error**

Could not reach n8n: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
        };
        setMessages((prev) => [...prev, errMessage]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const isFloating = mode === 'floating';

  return (
    <div
      className={
        isFloating
          ? 'fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[460px] h-[660px] max-h-[86vh] flex flex-col rounded-2xl border border-indigo-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/50 overflow-hidden transition-all'
          : 'flex flex-col w-full h-[calc(100vh-140px)] min-h-[620px] rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md overflow-hidden'
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/90 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">n8n AI Chatbot</h3>
              <button
                type="button"
                onClick={() => setShowDiagnosticModal(true)}
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                  n8nStatus === 'error_500'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/50 hover:bg-amber-900/80'
                    : n8nStatus === 'healthy'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/80'
                }`}
                title="Click to view n8n Diagnostics & Fix Guide"
              >
                {n8nStatus === 'error_500' ? (
                  <>
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                    <span>n8n 500 (Fix)</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-2.5 w-2.5 text-cyan-400" />
                    <span>Live Webhook</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
              <span className="truncate">{effectiveUrl}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Fallback Mode Toggle */}
          <button
            type="button"
            onClick={() => setAutoFallback(!autoFallback)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
              autoFallback
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-fallback to Built-in AI Analyst when n8n workflow errors"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span className="hidden sm:inline">Fallback:</span>
            <span>{autoFallback ? 'ON' : 'OFF'}</span>
          </button>

          {/* Test Mode Toggle */}
          <button
            type="button"
            onClick={() => setUseTestMode(!useTestMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
              useTestMode
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between /webhook/ and /webhook-test/"
          >
            {useTestMode ? <ToggleRight className="h-3.5 w-3.5 text-amber-400" /> : <ToggleLeft className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Test</span>
          </button>

          <button
            onClick={() => setShowDiagnosticModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
            title="Diagnose n8n Workflow"
          >
            <Wrench className="h-4 w-4" />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dataset Context Bar */}
      {activeDataset && (
        <div className="flex items-center justify-between px-4 py-2 bg-indigo-950/30 border-b border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 truncate">
            <Database className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate">{activeDataset.filename}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({activeDataset.rowCount.toLocaleString()} rows, {activeDataset.columnCount} cols)
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0">
            Context Attached
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}>
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                    : msg.error
                    ? 'bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Fallback Notice Banner */}
                {msg.isFallback && (
                  <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-indigo-950/60 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-slate-100">
                        ⚡ Answered by Built-in AI Analyst
                      </span>
                    </div>
                    <button
                      onClick={() => setShowDiagnosticModal(true)}
                      className="text-[10px] font-mono font-bold text-amber-300 hover:text-white underline flex items-center gap-1 shrink-0"
                    >
                      <span>Fix n8n 500</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">{msg.text}</div>

                {/* Footer timestamp & copy */}
                <div
                  className={`flex items-center justify-between gap-3 pt-2 mt-2 border-t text-[10px] ${
                    isUser ? 'border-indigo-500/40 text-indigo-200' : 'border-slate-800/70 text-slate-400'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>

                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-indigo-300 p-3 rounded-2xl bg-slate-900 border border-slate-800 max-w-fit shadow-md">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 rounded-full bg-indigo-300 animate-bounce"></span>
            </div>
            <span className="font-medium">Connecting to n8n workflow & analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 shrink-0">Prompts:</span>
        {DEFAULT_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => sendMessage(sug)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your dataset... (Shift+Enter for newline)"
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* Diagnostic & Fix Guide Modal */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">n8n Workflow Fix Guide</h3>
                  <p className="text-xs text-slate-400">
                    Resolve <code className="text-amber-400 font-mono text-[11px]">Error in workflow (HTTP 500)</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Live Webhook Status Check */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Live Endpoint Status:</span>
                <button
                  type="button"
                  onClick={checkN8nHealth}
                  disabled={isPinging}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">{effectiveUrl}</div>
              {pingResult && (
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  {pingResult}
                </div>
              )}
            </div>

            {/* Step-by-Step Fixes */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3 Common Causes & Exact Fixes in n8n Cloud:
              </div>

              {/* Fix 1: AI Model Credentials */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Key className="h-4 w-4 text-cyan-400" />
                  <span>1. Configure Model API Key Credential (90% of HTTP 500s)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inside n8n, click your <strong>AI Model sub-node</strong> (OpenAI Chat Model, Google Gemini, or Anthropic) attached to the <strong>AI Agent</strong> node. If the credential is empty, has an expired API key, or insufficient balance, n8n fails immediately with <em>"Error in workflow"</em>.
                </p>
                <div className="text-[11px] text-cyan-400 bg-cyan-950/40 p-2 rounded border border-cyan-800/40">
                  <strong>Action:</strong> Open the model node in n8n, select your credential, and verify the test passes.
                </div>
              </div>

              {/* Fix 2: Check Executions History */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span>2. Inspect the Red Execution in n8n</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Go to <a href="https://pallavichikkam.app.n8n.cloud" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">pallavichikkam.app.n8n.cloud</a>, click <strong>Executions</strong> in the left sidebar, and click the most recent red execution. n8n will highlight the exact node that failed in red with the stack trace!
                </p>
              </div>

              {/* Fix 3: Active Workflow Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>3. Workflow Activation State</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ensure the toggle in the top-right corner of your n8n editor canvas is switched to <strong>Active</strong>. If testing manually with "Execute workflow", turn on <strong>Test Mode</strong> in the chat header.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                While you configure n8n, <strong>Auto-Fallback</strong> ensures you always get analytical answers.
              </span>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Got It, Return to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
