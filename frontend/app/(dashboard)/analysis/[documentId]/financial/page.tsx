'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentsAPI, financialAPI, getApiErrorMessage } from '@/lib/api';
import type { Document, FinancialExtractionResponse } from '@/types';

export default function AnalysisFinancialPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [financial, setFinancial] = useState<FinancialExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFinancial = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [documentResponse, financialResponse] = await Promise.all([
          documentsAPI.getDocument(documentId),
          financialAPI.getFinancialTerms(documentId),
        ]);

        setDocumentInfo(documentResponse);
        setFinancial(financialResponse);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadFinancial();
  }, [documentId]);

  if (isLoading) {
    return <WorkspaceLoading title="Financial terms" />;
  }

  if (error) {
    return <WorkspaceError title="Financial terms" message={error} />;
  }

  if (!financial) {
    return <WorkspaceError title="Financial terms" message="No financial term data was returned for this document." />;
  }

  const overviewItems = [
    financial.payment_amount && ['Payment amount', financial.payment_amount],
    financial.currency && ['Currency', financial.currency],
    financial.contract_value && ['Contract value', financial.contract_value],
    financial.security_deposit && ['Security deposit', financial.security_deposit],
    financial.taxes && ['Taxes', financial.taxes],
    financial.interest && ['Interest', financial.interest],
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <section className="space-y-6">
      <WorkspaceHeader
        title="Financial terms"
        description="Cached payment, due date, and penalty terms extracted from the document."
        documentInfo={documentInfo}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Overview</p>
          <dl className="mt-4 space-y-4">
            {overviewItems.length > 0 ? (
              overviewItems.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-sm font-medium text-slate-600">{label}</dt>
                  <dd className="text-sm font-semibold text-slate-950">{value}</dd>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-500">No high-level financial fields were returned.</p>
            )}
          </dl>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Due dates and penalties</p>
          <div className="mt-4 space-y-4">
            <ListBlock title="Due dates" items={financial.due_dates} emptyLabel="No due dates were returned." />
            <ListBlock title="Penalties" items={financial.penalties} emptyLabel="No penalties were returned." />
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">All extracted financial terms</p>
        {financial.financial_terms.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {financial.financial_terms.map((term) => (
              <div key={`${term.term_type}-${term.value}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{term.term_type}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{term.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{term.description || 'No description available.'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-500">No detailed financial terms were returned.</p>
        )}
      </article>
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

function ListBlock({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}