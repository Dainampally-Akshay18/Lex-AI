'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentsAPI, getApiErrorMessage, translationAPI } from '@/lib/api';
import type { Document, TranslationResponse } from '@/types';

const targetLanguages = [
  { label: 'English', value: 'english' },
  { label: 'Telugu', value: 'telugu' },
  { label: 'Hindi', value: 'hindi' },
  { label: 'Tamil', value: 'tamil' },
  { label: 'Kannada', value: 'kannada' },
  { label: 'Malayalam', value: 'malayalam' },
] as const;

const contentTypes = [
  { label: 'Chat', value: 'chat' },
  { label: 'Summary', value: 'summary' },
  { label: 'Risk', value: 'risk' },
  { label: 'Financial', value: 'financial' },
] as const;

export default function AnalysisTranslationPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<(typeof targetLanguages)[number]['value']>('telugu');
  const [contentType, setContentType] = useState<(typeof contentTypes)[number]['value']>('summary');
  const [content, setContent] = useState('');
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await documentsAPI.getDocument(documentId);
        setDocumentInfo(response);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDocument();
  }, [documentId]);

  const handleTranslate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      setError('Enter text to translate.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await translationAPI.translate({
        document_id: documentId,
        target_language: targetLanguage,
        content_type: contentType,
        content,
      });

      setTranslation(response);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <WorkspaceLoading title="Translation" />;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHeader
        title="Translation"
        description="Translate cached analysis text or your own notes into the selected language."
        documentInfo={documentInfo}
      />

      {error && <WorkspaceError title="Translation" message={error} />}

      <form onSubmit={handleTranslate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldGroup label="Target language">
            <select
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value as (typeof targetLanguages)[number]['value'])}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            >
              {targetLanguages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Content type">
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value as (typeof contentTypes)[number]['value'])}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            >
              {contentTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        <FieldGroup label="Content to translate" className="mt-4">
          <textarea
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            placeholder="Paste summary, risk notes, financial text, or chat content here."
          />
        </FieldGroup>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Translating...' : 'Translate content'}
          </button>
        </div>
      </form>

      {translation && (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Original content</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{translation.original_content}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Translated content</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{translation.translated_content}</p>
          </article>
        </div>
      )}
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

function FieldGroup({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{label}</label>
      <div className="mt-3">{children}</div>
    </div>
  );
}