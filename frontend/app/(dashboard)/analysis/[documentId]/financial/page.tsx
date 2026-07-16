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

  // Extract key metrics for hero section
  const annualCTC = financial.payment_amount || 'N/A';
  const monthlySalary = financial.contract_value || 'N/A';
  const currency = financial.currency || 'N/A';

  // Parse payment amount to extract numeric value for display
  const formatCurrency = (value: string) => {
    if (value === 'N/A') return value;
    return value;
  };

  return (
    <section className="space-y-8">
      {/* Compact Header */}
      <WorkspaceHeader documentInfo={documentInfo} />

      {/* Hero Metrics - Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Annual CTC</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{formatCurrency(annualCTC)}</p>
          <p className="mt-1 text-sm text-slate-500">Total compensation package</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Monthly Salary</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{formatCurrency(monthlySalary)}</p>
          <p className="mt-1 text-sm text-slate-500">Base monthly compensation</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Currency</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{currency}</p>
          <p className="mt-1 text-sm text-slate-500">Payment currency</p>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Salary Breakdown</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {financial.payment_amount && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Annual CTC</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.payment_amount}</p>
            </div>
          )}
          {financial.contract_value && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Monthly Salary</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.contract_value}</p>
            </div>
          )}
          {financial.security_deposit && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Bonuses</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.security_deposit}</p>
            </div>
          )}
          {financial.taxes && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Incentives</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.taxes}</p>
            </div>
          )}
          {financial.interest && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Payment Frequency</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.interest}</p>
            </div>
          )}
          {financial.currency && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">Contract Value</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{financial.currency}</p>
            </div>
          )}
        </div>
      </div>

      {/* Due Dates Timeline & Financial Risks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Due Dates Timeline */}
        {financial.due_dates.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Payment Schedule</h3>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="relative">
                {financial.due_dates.map((date, index) => (
                  <div key={index} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    {index < financial.due_dates.length - 1 && (
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

        {/* Financial Risks */}
        {financial.penalties.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Financial Risks</h3>
            <div className="space-y-3">
              {financial.penalties.map((penalty, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">Risk {index + 1}</p>
                      <p className="mt-1 text-sm leading-6 text-amber-800">{penalty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Extracted Financial Terms - Table View */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">All Financial Terms</h3>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {financial.financial_terms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      Financial Term
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financial.financial_terms.map((term, index) => (
                    <tr key={`${term.term_type}-${term.value}-${index}`} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {term.term_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {term.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {term.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No detailed financial terms were returned.
            </div>
          )}
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
            💰
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