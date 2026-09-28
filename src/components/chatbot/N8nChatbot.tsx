import React, { useState, useRef, useEffect } from 'react';
import { Dataset, N8nChatMessage } from '../../types';
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
  'Summarize the multi-agent investigation workflow',
  'What are the columns in the active dataset?',
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
        text: `Hello! I am your **AutonomousAI Chatbot**, powered directly by your n8n workflow.

You can ask me questions about your uploaded datasets, analytical findings, or request custom data workflows. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);
  const [customWebhookUrl, setCustomWebhookUrl] = useState(webhookUrl);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastErrorHint, setLastErrorHint] = useState<string | null>(null);

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

  // Effective endpoint calculation (supports switching between /webhook/ and /webhook-test/)
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
        text: 'Chat history cleared. Send a new message to start a fresh conversation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastErrorHint(null);
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

    // Payload formatted to support both standard n8n Chat Trigger and standard Webhook Trigger nodes
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
      // First attempt via /api/n8n-chat proxy (prevents CORS and Failed to fetch issues in browser)
      let response: Response;
      let usedProxy = true;

      try {
        response = await fetch('/api/n8n-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: JSON.stringify(payload),
        });
        if (response.status === 404 && !(await response.clone().text()).includes('n8n')) {
          // Local route not found, fallback to direct
          usedProxy = false;
          throw new Error('Proxy endpoint not found');
        }
      } catch {
        usedProxy = false;
        // Direct fetch fallback
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

      try {
        const data = JSON.parse(responseText);

        if (response.status === 500 || data.message === 'Error in workflow') {
          isError = true;
          hint = 'A node inside your n8n workflow threw an execution error.';
          botText = `⚠️ **n8n Workflow Execution Error**

Your n8n workflow received the message, but an internal node failed during execution:
> **"Error in workflow"** (HTTP 500)

**How to resolve in your n8n Cloud editor:**
1. Open your n8n canvas: [pallavichikkam.app.n8n.cloud](https://pallavichikkam.app.n8n.cloud)
2. In the left navigation sidebar, click on **Executions** to view the recent red execution.
3. Click into that execution to see which node failed (most common causes:
   - Missing or expired API key on your AI Model / OpenAI / Gemini credentials
   - Missing required input variable in a Code or Prompt node
   - Tool execution timeout).
4. Once the node credentials/logic are verified in n8n, retry your question!`;
          setLastErrorHint(hint);
        } else if (response.status === 404 && (data.code === 404 || data.message?.includes('not registered'))) {
          isError = true;
          hint = data.hint || 'Workflow must be active in n8n.';
          botText = `⚠️ **n8n Webhook Not Activated**

The webhook endpoint responded with:
> "${data.message}"

**How to fix this in your n8n cloud instance:**
1. Open your workflow in n8n: [Open n8n Editor](${customWebhookUrl.split('/webhook/')[0]})
2. In the top-right corner of the canvas, toggle the switch from **Inactive** to **Active**.
3. If you are developing and clicking *"Execute workflow"*, you can toggle **Test Mode** on in the chat header above.`;
          setLastErrorHint(hint || null);
        } else if (data.output) {
          botText = typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2);
        } else if (data.text) {
          botText = typeof data.text === 'string' ? data.text : JSON.stringify(data.text, null, 2);
        } else if (data.message) {
          botText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message, null, 2);
        } else if (data.response) {
          botText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response, null, 2);
        } else if (Array.isArray(data) && data.length > 0) {
          botText = data[0].output || data[0].text || data[0].message || JSON.stringify(data, null, 2);
        } else {
          botText = JSON.stringify(data, null, 2);
        }
      } catch {
        // Plain text response
        botText = responseText || (response.ok ? 'Received response from agent.' : `Error: HTTP ${response.status}`);
        if (!response.ok) isError = true;
      }

      const botMessage: N8nChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: isError,
        hint,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errMessage: N8nChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ **Connection Error: Failed to fetch**

Could not connect to the n8n webhook endpoint:
\`${effectiveUrl}\`

**Root Cause:**
1. **Internal Workflow Error:** When an n8n workflow throws an error (HTTP 500) or is inactive (HTTP 404), n8n Cloud omits CORS headers, causing web browsers to block the response as *"Failed to fetch"*.
2. **Workflow Activation:** Make sure your workflow is toggled to **Active** in n8n Cloud (or switch to **Test Mode** in the chat header).
3. **Inspect Executions:** Check the **Executions** tab in your n8n editor canvas to inspect the failure details.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errMessage]);
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
          ? 'fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[440px] h-[640px] max-h-[85vh] flex flex-col rounded-2xl border border-indigo-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 overflow-hidden transition-all'
          : 'flex flex-col w-full h-[calc(100vh-140px)] min-h-[600px] rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md overflow-hidden'
      }
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/90 bg-slate-950/80">
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
              <h3 className="text-sm font-bold text-white tracking-tight">
                n8n AI Chatbot
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                Live Webhook
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-[220px] sm:max-w-xs">
              <span className="truncate">{effectiveUrl}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Test Mode Toggle */}
          <button
            type="button"
            onClick={() => setUseTestMode(!useTestMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
              useTestMode
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle between production webhook and test webhook URL"
          >
            {useTestMode ? <ToggleRight className="h-3.5 w-3.5 text-amber-400" /> : <ToggleLeft className="h-3.5 w-3.5" />}
            <span>Test Mode</span>
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

      {/* Warning banner if n8n returned 404 inactive */}
      {lastErrorHint && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Workflow Not Active in n8n</div>
            <div className="text-[11px] text-amber-200/90 leading-tight">
              Toggle the workflow to <strong>Active</strong> in your n8n Cloud editor canvas (top-right), or enable <strong>Test Mode</strong> above if running manually.
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                    : msg.error
                    ? 'bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans space-y-1">
                  {msg.text}
                </div>

                {/* Footer timestamp & copy */}
                <div
                  className={`flex items-center justify-between gap-3 pt-2 mt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-indigo-500/40 text-indigo-200'
                      : 'border-slate-800/70 text-slate-400'
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
          <div className="flex items-center gap-3 text-xs text-indigo-300 p-3 rounded-2xl bg-slate-900 border border-slate-800 max-w-fit">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 rounded-full bg-indigo-300 animate-bounce"></span>
            </div>
            <span className="font-medium">n8n Agent thinking & querying tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 shrink-0">Suggestions:</span>
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

      {/* Chat Input Area */}
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
              placeholder="Ask n8n agent anything about your dataset... (Shift+Enter for newline)"
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
    </div>
  );
};
