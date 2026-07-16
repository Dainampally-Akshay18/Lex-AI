/**
 * Type definitions for LexAI Frontend
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Document {
  _id: string;
  userId: string;
  fileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  language: string;
  documentText?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface AnalysisStatus {
  _id: string;
  document_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: unknown;
  risk_analysis?: unknown;
  financial_terms?: unknown;
  generated_at?: string;
  updated_at: string;
  model_name?: string;
  model_version?: string;
  error_message?: string;
}

export interface RiskCategory {
  category: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
  issues: string[];
  recommendations: string[];
}

export interface RiskAnalysis {
  overallRiskScore: number;
  overallSeverity: 'low' | 'medium' | 'high';
  riskBreakdown: RiskCategory[];
  keyRecommendations: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UploadResponse {
  message: string;
  document_id: string;
  fileName: string;
  fileSize: number;
  text_length: number;
}

export interface SummaryResponse {
  executive_summary: string;
  quick_summary: string;
  detailed_summary: string;
  key_clauses: string[];
  rights: string[];
  obligations: string[];
  important_dates: string[];
}

export interface RiskCategory {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  recommendation: string;
}

export interface RiskResponse {
  overall_risk_score: number;
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_breakdown: RiskCategory[];
  summary: string;
  recommendations: string[];
}

export interface FinancialTerm {
  term_type: string;
  value: string;
  description?: string | null;
}

export interface FinancialExtractionResponse {
  document_id: string;
  payment_amount?: string | null;
  currency?: string | null;
  taxes?: string | null;
  interest?: string | null;
  due_dates: string[];
  penalties: string[];
  security_deposit?: string | null;
  contract_value?: string | null;
  financial_terms: FinancialTerm[];
}

export interface ChatRequest {
  document_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  document_id: string;
  question: string;
  clause_references: string[];
}

export interface ConversationMessage {
  question: string;
  answer: string;
  timestamp: string;
  clause_references: string[];
}

export interface ConversationHistory {
  document_id: string;
  messages: ConversationMessage[];
  total_messages: number;
}

export interface TranslationRequest {
  document_id: string;
  target_language: 'english' | 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'malayalam';
  content_type: 'chat' | 'summary' | 'risk' | 'financial';
  content: string;
}

export interface TranslationResponse {
  original_content: string;
  translated_content: string;
  source_language: string;
  target_language: 'english' | 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'malayalam';
  content_type: 'chat' | 'summary' | 'risk' | 'financial';
}
