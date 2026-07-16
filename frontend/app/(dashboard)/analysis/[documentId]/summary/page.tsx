'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentsAPI, getApiErrorMessage, summaryAPI } from '@/lib/api';
import type { Document, SummaryResponse } from '@/types';

export default function AnalysisSummaryPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [documentResponse, summaryResponse] = await Promise.all([
          documentsAPI.getDocument(documentId),
          summaryAPI.getSummary(documentId),
        ]);

        setDocumentInfo(documentResponse);
        setSummary(summaryResponse);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, [documentId]);

  const toggleClause = (index: number) => {
    setExpandedClauses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <WorkspaceLoading title="Summary" />;
  }

  if (error) {
    return <WorkspaceError title="Summary" message={error} />;
  }

  if (!summary) {
    return <WorkspaceError title="Summary" message="No summary data was returned for this document." />;
  }

  // Parse quick summary for highlights if it contains structured data
  const parseHighlights = (quickSummary: string) => {
    const highlights: { label: string; value: string }[] = [];
    const lines = quickSummary.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes(':')) {
        const [label, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (label && value) {
          highlights.push({ label: label.trim(), value });
        }
      }
    }
    return highlights.length > 0 ? highlights : null;
  };

  const highlights = parseHighlights(summary.quick_summary);

  return (
    <section className="space-y-8">
      {/* Compact Header */}
      <WorkspaceHeader documentInfo={documentInfo} />

      {/* Executive Summary - Hero Section */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Executive Summary</h3>
            <p className="mt-3 text-base leading-8 text-slate-800">{summary.executive_summary}</p>
          </div>
        </div>
      </div>

      {/* Key Highlights - Replaces Quick Summary */}
      {highlights && highlights.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Key Highlights</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">{highlight.label}</p>
                <p className="mt-1 font-medium text-slate-900">{highlight.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rights and Obligations - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">Rights</h3>
          </div>
          {summary.rights.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {summary.rights.map((right) => (
                <li key={right} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{right}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No rights listed.</p>
          )}
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-amber-700">Obligations</h3>
          </div>
          {summary.obligations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {summary.obligations.map((obligation) => (
                <li key={obligation} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{obligation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No obligations listed.</p>
          )}
        </div>
      </div>

      {/* Key Clauses - Accordion */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Key Clauses</h3>
        <div className="space-y-2">
          {summary.key_clauses.length > 0 ? (
            summary.key_clauses.map((clause, index) => {
              const isExpanded = expandedClauses.has(index);
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleClause(index)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-900">Clause {index + 1}</span>
                    <span className="text-slate-400">
                      {isExpanded ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-6 py-4">
                      <p className="text-sm leading-7 text-slate-700">{clause}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No key clauses available.
            </div>
          )}
        </div>
      </div>

      {/* Important Dates - Timeline */}
      {summary.important_dates.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Important Dates</h3>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="relative">
              {summary.important_dates.map((date, index) => (
                <div key={index} className="relative flex items-start gap-4 pb-8 last:pb-0">
                  {index < summary.important_dates.length - 1 && (
                    <div className="absolute left-[11px] top-8 h-full w-0.5 bg-slate-200" />
                  )}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm leading-7 text-slate-700">{date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Summary - Document View */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Detailed Summary</h3>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">{summary.detailed_summary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkspaceHeader({ documentInfo }: { documentInfo: Document | null }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-slate-700">
            📄
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {documentInfo?.fileName || 'Document'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{documentInfo?.fileType || 'File'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>{documentInfo?.language || 'Unknown language'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs text-slate-500">Ready</span>
        </div>
      </div>
    </div>
  );
}

function WorkspaceLoading({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium text-slate-500">Loading {title.toLowerCase()}...</p>
      <div className="mt-4 h-48 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function WorkspaceError({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-500">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}