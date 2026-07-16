'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analysisAPI, getApiErrorMessage } from '@/lib/api';
import type { ReactNode } from 'react';
import type { AnalysisStatus } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const sections = [
  { label: 'Summary', href: 'summary' },
  { label: 'Risk Analysis', href: 'risk' },
  { label: 'Financial Terms', href: 'financial' },
  { label: 'AI Chat', href: 'chat' },
  { label: 'Translation', href: 'translation' },
];

export default function AnalysisWorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ documentId: string }>();
  const basePath = `/analysis/${params.documentId}`;
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus['status'] | null>(null);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadAnalysisStatus = async () => {
      try {
        setStatusError('');
        const analysis = await analysisAPI.getAnalysis(params.documentId);

        if (!isCancelled) {
          setAnalysisStatus(analysis.status);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setAnalysisStatus('processing');
          setStatusError(getApiErrorMessage(err));
        }
      }
    };

    void loadAnalysisStatus();
    const intervalId = window.setInterval(() => {
      void loadAnalysisStatus();
    }, 12000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [params.documentId]);

  const isReady = analysisStatus === 'completed';
  const isFailed = analysisStatus === 'failed';

  const statusPanel = isFailed ? (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-500">Analysis failed</p>
      <h2 className="mt-2 text-xl font-semibold text-rose-950">This document could not be analyzed.</h2>
      <p className="mt-3 text-sm leading-6 text-rose-800">
        {statusError || 'The backend reported a failed analysis state. Please return to the dashboard and try again later.'}
      </p>
    </div>
  ) : !isReady ? (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Analysis in progress</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Your analysis is still processing.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This workspace will unlock automatically when the backend marks the analysis as completed.
      </p>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-400" />
      </div>
    </div>
  ) : null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.18)] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Analysis workspace</p>
                <h1 className="mt-2 text-lg font-semibold text-white">Document review</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Cached summary, risk, financial, chat, and translation views for a single document.
                </p>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => {
                  const href = `${basePath}/${section.href}`;
                  const active = pathname === href || pathname?.startsWith(`${href}/`);

                  return (
                    <Link
                      key={section.href}
                      href={href}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        active
                          ? 'border-white/20 bg-white text-slate-950 shadow-sm'
                          : 'border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{section.label}</span>
                      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Back to dashboard
                </button>
                <p className="text-xs leading-5 text-slate-400">
                  Switching sections stays inside the workspace shell and keeps the document context in view.
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">{isReady ? children : statusPanel}</div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}