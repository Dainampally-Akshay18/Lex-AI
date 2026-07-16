/**
 * API Client for LexAI Backend
 * Handles authentication, requests, and error handling
 */

import type {
  ChatRequest,
  ChatResponse,
  ConversationHistory,
  Document,
  DocumentListResponse,
  FinancialExtractionResponse,
  RiskResponse,
  SummaryResponse,
  TranslationRequest,
  TranslationResponse,
  UploadResponse,
  User,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Token management
export const tokenManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },
};

export function isApiError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isAuthError(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

export function getApiErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'Unexpected error. Please try again.';
  }

  if (error.status === 0) {
    return 'Network error. Check your connection and try again.';
  }

  switch (error.status) {
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to view this resource.';
    case 404:
      return error.message || 'The requested resource was not found.';
    case 500:
      return 'The server encountered an error. Please try again later.';
    default:
      return error.message || 'Request failed. Please try again.';
  }
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function parseResponseData<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

// API client
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  const hasFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  if (!hasFormData && fetchOptions.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      if (response.status === 401) {
        tokenManager.removeToken();
      }

      throw new APIError(
        errorData.detail || errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    return parseResponseData<T>(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0);
  }
}

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  login: async (data: { email: string; password: string }) => {
    return request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  getCurrentUser: async () => {
    return request<User>('/auth/me');
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = tokenManager.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new APIError(
        errorData.detail || 'Upload failed',
        response.status,
        errorData
      );
    }

    return response.json() as Promise<UploadResponse>;
  },

  getDocuments: async (limit = 100, skip = 0) => {
    return request<DocumentListResponse>(`/documents/${buildQueryString({ limit, skip })}`);
  },

  getDocument: async (documentId: string, includeText = false) => {
    return request<Document>(`/documents/${documentId}${buildQueryString({ include_text: includeText })}`);
  },

  deleteDocument: async (documentId: string) => {
    return request<{ message: string; document_id: string }>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// Risk API
export const riskAPI = {
  getRiskAnalysis: async (documentId: string) => {
    return request<RiskResponse>(`/risk/analysis/${documentId}`);
  },
};

// Summary API
export const summaryAPI = {
  getSummary: async (documentId: string) => {
    return request<SummaryResponse>(`/summary/${documentId}`);
  },
};

// Financial API
export const financialAPI = {
  getFinancialTerms: async (documentId: string) => {
    return request<FinancialExtractionResponse>(`/financial/extract/${documentId}`);
  },
};

export const chatAPI = {
  askQuestion: async (data: ChatRequest) => {
    return request<ChatResponse>('/chat/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (documentId: string) => {
    return request<ConversationHistory>(`/chat/history/${documentId}`);
  },
};

export const translationAPI = {
  translate: async (data: TranslationRequest) => {
    return request<TranslationResponse>('/language/translate', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },
};

export { APIError };
