'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
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

          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}