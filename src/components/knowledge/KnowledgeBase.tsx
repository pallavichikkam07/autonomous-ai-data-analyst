import React, { useState } from 'react';
import { KnowledgeDoc } from '../../types';
import {
  BookOpen,
  UploadCloud,
  Search,
  RefreshCw,
  Plus,
  FileText,
  FileCheck,
  CheckCircle2,
  Trash2,
  Database,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface KnowledgeBaseProps {
  documents: KnowledgeDoc[];
  onAddDocument: (doc: KnowledgeDoc) => void;
  onDeleteDocument: (id: string) => void;
  onReindex: () => void;
  isReindexing: boolean;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  onReindex,
  isReindexing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'PDF' | 'TXT' | 'DOCX' | 'CSV'>('PDF');
  const [newDocSummary, setNewDocSummary] = useState('');

  const filteredDocs = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const doc: KnowledgeDoc = {
      id: `kdoc-${Date.now()}`,
      name: newDocName.trim().endsWith(`.${newDocType.toLowerCase()}`)
        ? newDocName.trim()
        : `${newDocName.trim()}.${newDocType.toLowerCase()}`,
      type: newDocType,
      status: 'Indexed',
      chunks: Math.floor(Math.random() * 30) + 12,
      lastUpdated: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      size: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
      summary:
        newDocSummary.trim() ||
        'User-provided corporate reference document indexed for vector semantic search.',
    };

    onAddDocument(doc);
    setNewDocName('');
    setNewDocSummary('');
    setShowAddModal(false);
  };

  const totalChunks = documents.reduce((sum, d) => sum + d.chunks, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Knowledge Base & RAG Vector Store
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            The RAG retrieval system searches these business policies, contracts, and data dictionaries to substantiate agent reasoning.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onReindex}
            disabled={isReindexing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-cyan-400 ${
                isReindexing ? 'animate-spin' : ''
              }`}
            />
            <span>{isReindexing ? 'Re-indexing...' : 'Re-index Knowledge Base'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* RAG Metrics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Documents</div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {documents.length}
          </div>
          <div className="text-[11px] text-slate-400">PDF, TXT, DOCX & CSV files</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Semantic Chunks</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {totalChunks}
          </div>
          <div className="text-[11px] text-slate-400">Indexed in vector space (512 tokens)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Embedding Engine</div>
          <div className="text-base font-bold text-indigo-300 font-mono">
            text-embedding-004
          </div>
          <div className="text-[11px] text-slate-400">Cosine similarity threshold: 0.82</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Knowledge Base documents or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredDocs.length} of {documents.length} documents
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-300">Document</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Type</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Chunks</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Last Updated</th>
                <th className="py-3 px-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-200 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {doc.summary}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 text-[10px] font-semibold">
                      {doc.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{doc.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300 tabular-nums">
                    {doc.chunks} chunks
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {doc.lastUpdated}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Knowledge Document to RAG
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY26 Promotion Guidelines.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Format
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="PDF">PDF Document (.pdf)</option>
                  <option value="TXT">Plain Text / Markdown (.txt, .md)</option>
                  <option value="DOCX">Word Document (.docx)</option>
                  <option value="CSV">Data Glossary / CSV (.csv)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contextual Summary / Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what rules or metrics this document contains so agents can query it accurately."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full resize-none rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
                >
                  Index Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
