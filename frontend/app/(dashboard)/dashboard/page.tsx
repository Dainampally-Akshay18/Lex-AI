'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { analysisAPI, documentsAPI, getApiErrorMessage } from '@/lib/api';
import { formatDistanceToNow } from '@/lib/utils';
import type { AnalysisStatus, Document } from '@/types';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analysisStatuses, setAnalysisStatuses] = useState<Record<string, AnalysisStatus | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await documentsAPI.getDocuments();
        setDocuments(response.documents);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDocuments();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadAnalysisStatuses = async () => {
      if (documents.length === 0) {
        setAnalysisStatuses({});
        return;
      }

      try {
        const statusEntries = await Promise.all(
          documents.map(async (document) => {
            try {
              const analysis = await analysisAPI.getAnalysis(document._id);
              return [document._id, analysis] as const;
            } catch {
              return [document._id, null] as const;
            }
          })
        );

        if (!isCancelled) {
          setAnalysisStatuses((current) => {
            const next = { ...current };
            statusEntries.forEach(([documentId, analysis]) => {
              next[documentId] = analysis;
            });
            return next;
          });
        }
      } catch {
        // Keep the previous status snapshot and retry on the next poll.
      }
    };

    void loadAnalysisStatuses();
    const intervalId = window.setInterval(() => {
      void loadAnalysisStatuses();
    }, 12000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [documents]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentsAPI.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    }
  };

  const getAnalysisStatus = (documentId: string) => analysisStatuses[documentId]?.status ?? 'processing';

  const getAnalysisStatusLabel = (status: AnalysisStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'pending':
      case 'processing':
      default:
        return 'Processing';
    }
  };

  const getAnalysisActionLabel = (status: AnalysisStatus['status']) => {
    if (status === 'completed') {
      return 'View Analysis';
    }

    if (status === 'failed') {
      return 'Analysis Failed';
    }

    return 'Analysis in Progress';
  };

  const renderDocumentCard = (doc: Document) => {
    const analysisStatus = getAnalysisStatus(doc._id);
    const statusLabel = getAnalysisStatusLabel(analysisStatus);
    const actionLabel = getAnalysisActionLabel(analysisStatus);
    const canOpenAnalysis = analysisStatus === 'completed';

    return (
      <article
        key={doc._id}
        className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-950">{doc.fileName}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {doc.fileType} · {doc.language}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteDocument(doc._id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              aria-label={`Delete ${doc.fileName}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            Uploaded {formatDistanceToNow(doc.uploadedAt)} · Current status {statusLabel}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              analysisStatus === 'completed'
                ? 'bg-emerald-50 text-emerald-700'
                : analysisStatus === 'failed'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
            }`}
          >
            {statusLabel}
          </span>
          {canOpenAnalysis ? (
            <Link
              href={`/analysis/${doc._id}`}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-full bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] lg:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Contract intelligence
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Review uploaded documents in a focused analysis workspace.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Open one document, inspect cached summary and risk insights, review financial terms,
                    and continue the conversation without leaving the workspace.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Primary action</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">View Analysis</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Launch the workspace for a document to navigate summary, risk, financial, chat,
                      and translation in a single flow.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/upload')}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Upload Document
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/70" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">No documents yet</h3>
              <p className="mt-2 text-sm text-slate-600">Upload a PDF or DOCX to start the analysis flow.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/upload')}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                >
                  Upload Document
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documents.map(renderDocumentCard)}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
