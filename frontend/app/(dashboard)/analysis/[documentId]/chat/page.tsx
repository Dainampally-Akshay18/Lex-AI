'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { chatAPI, documentsAPI, getApiErrorMessage } from '@/lib/api';
import type { ConversationHistory, Document } from '@/types';

export default function AnalysisChatPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [history, setHistory] = useState<ConversationHistory | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChat = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [documentResponse, historyResponse] = await Promise.all([
          documentsAPI.getDocument(documentId),
          chatAPI.getHistory(documentId),
        ]);

        setDocumentInfo(documentResponse);
        setHistory(historyResponse);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadChat();
  }, [documentId]);

  const handleAskQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await chatAPI.askQuestion({ document_id: documentId, question: trimmedQuestion });

      setHistory((current) => ({
        document_id: documentId,
        total_messages: (current?.total_messages || 0) + 1,
        messages: [
          ...(current?.messages || []),
          {
            question: response.question,
            answer: response.answer,
            timestamp: new Date().toISOString(),
            clause_references: response.clause_references,
          },
        ],
      }));
      setQuestion('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <WorkspaceLoading title="AI chat" />;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHeader
        title="AI chat"
        description="Ask follow-up questions against cached conversation history for the selected document."
        documentInfo={documentInfo}
      />

      {error && <WorkspaceError title="AI chat" message={error} />}

      <form onSubmit={handleAskQuestion} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="question" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Ask a question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          placeholder="What are the strongest termination risks in this agreement?"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Responses are appended to the cached conversation history.</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Asking...' : 'Ask question'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {history?.messages.length ? (
          history.messages
            .slice()
            .reverse()
            .map((message, index) => (
              <article key={`${message.timestamp}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Conversation {index + 1}</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Question</p>
                    <p className="mt-2 text-sm leading-7 text-slate-900">{message.question}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Answer</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{message.answer}</p>
                  </div>
                  {message.clause_references.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Clause references</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.clause_references.map((reference) => (
                          <span key={reference} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {reference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            No conversation history is cached yet.
          </div>
        )}
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