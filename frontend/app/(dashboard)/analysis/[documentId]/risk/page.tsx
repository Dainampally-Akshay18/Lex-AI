'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentsAPI, getApiErrorMessage, riskAPI } from '@/lib/api';
import type { Document, RiskResponse } from '@/types';

export default function AnalysisRiskPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRisk = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [documentResponse, riskResponse] = await Promise.all([
          documentsAPI.getDocument(documentId),
          riskAPI.getRiskAnalysis(documentId),
        ]);

        setDocumentInfo(documentResponse);
        setRisk(riskResponse);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadRisk();
  }, [documentId]);

  if (isLoading) {
    return <WorkspaceLoading title="Risk analysis" />;
  }

  if (error) {
    return <WorkspaceError title="Risk analysis" message={error} />;
  }

  if (!risk) {
    return <WorkspaceError title="Risk analysis" message="No risk analysis data was returned for this document." />;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHeader
        title="Risk analysis"
        description="Cached contract risk assessment grouped by category."
        documentInfo={documentInfo}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Overall score</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-semibold tracking-tight text-slate-950">
              {risk.overall_risk_score.toFixed(1)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
              {risk.overall_risk_level}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{risk.summary}</p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Recommendations</p>
          {risk.recommendations.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {risk.recommendations.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">No recommendations were returned.</p>
          )}
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {risk.risk_breakdown.map((item) => (
          <article key={item.category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.description}</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                {item.level} · {item.score.toFixed(1)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{item.recommendation}</p>
          </article>
        ))}
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