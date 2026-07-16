'use client';

import { useEffect, useState, useRef } from 'react';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleAskQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSubmitting) {
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
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(event.target.value);
    
    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  if (isLoading) {
    return <WorkspaceLoading title="AI chat" />;
  }

  const messages = history?.messages || [];

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* Compact Header */}
      <WorkspaceHeader documentInfo={documentInfo} />

      {/* Error Message */}
      {error && <WorkspaceError message={error} />}

      {/* Conversation Area - Takes up ~75% of available space */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="h-full overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                  💬
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No conversation yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Start the conversation by asking a question about your document below.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={`${message.timestamp}-${index}`} className="space-y-2">
                  {/* User message - aligned right */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-none bg-slate-950 px-4 py-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-white">{message.question}</p>
                    </div>
                  </div>

                  {/* AI message - aligned left */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.answer}</p>
                      {message.clause_references.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.clause_references.map((reference) => (
                            <span
                              key={reference}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {reference}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.timestamp && (
                    <div className="px-2 text-right">
                      <span className="text-xs text-slate-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input at Bottom */}
      <div className="mt-4 flex-shrink-0">
        <form onSubmit={handleAskQuestion} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="question" className="sr-only">
                Ask a question
              </label>
              <textarea
                ref={textareaRef}
                id="question"
                value={question}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                placeholder="Ask a question about your document..."
                disabled={isSubmitting}
                style={{ minHeight: '52px', maxHeight: '150px' }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Press Enter to send · Shift + Enter for new line</span>
            <span>{question.length} characters</span>
          </div>
        </form>
      </div>
    </div>
  );
}

function WorkspaceHeader({ documentInfo }: { documentInfo: Document | null }) {
  return (
    <div className="mb-3 flex-shrink-0 rounded-3xl border border-slate-200 bg-white/90 px-6 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
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
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
        <p className="text-sm font-medium text-slate-500">Loading {title.toLowerCase()}...</p>
      </div>
    </div>
  );
}

function WorkspaceError({ message }: { message: string }) {
  return (
    <div className="mb-3 flex-shrink-0 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}