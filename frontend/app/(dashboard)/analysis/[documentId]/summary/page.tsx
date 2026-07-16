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

  if (isLoading) {
    return <WorkspaceLoading title="Summary" />;
  }

  if (error) {
    return <WorkspaceError title="Summary" message={error} />;
  }

  if (!summary) {
    return <WorkspaceError title="Summary" message="No summary data was returned for this document." />;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHeader
        title="Summary"
        description="Cached summary insights for the selected document."
        documentInfo={documentInfo}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="Executive Summary" body={summary.executive_summary} tone="strong" />
        <InfoCard title="Quick Summary" body={summary.quick_summary} />
        <InfoCard title="Detailed Summary" body={summary.detailed_summary} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard title="Key Clauses" items={summary.key_clauses} />
        <ListCard title="Rights" items={summary.rights} />
        <ListCard title="Obligations" items={summary.obligations} />
        <ListCard title="Important Dates" items={summary.important_dates} />
      </div>
    </section>
  );
}

function WorkspaceHeader({
  title,
  description,
  documentInfo,
}: {
  title: string;
  description: string;
  documentInfo: Document | null;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{documentInfo?.fileName || 'Document'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          {documentInfo?.fileType || 'File'} · {documentInfo?.language || 'Unknown language'}
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

function InfoCard({ title, body, tone = 'normal' }: { title: string; body: string; tone?: 'normal' | 'strong' }) {
  return (
    <article className={`rounded-3xl border bg-white p-6 shadow-sm ${tone === 'strong' ? 'border-slate-950/10' : 'border-slate-200'}`}>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${tone === 'strong' ? 'text-slate-900' : 'text-slate-700'}`}>
        {body}
      </p>
    </article>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">No items were returned for this section.</p>
      )}
    </article>
  );
}