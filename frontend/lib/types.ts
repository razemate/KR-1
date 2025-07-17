export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model_used?: string;
  rag_used?: boolean;
  context_found?: boolean;
  exportData?: any;
  timestamp?: Date;
}

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  keyUrl: string;
}

export interface APIKeyValidation {
  valid: boolean;
  error?: string;
}

export interface IntegrationStatus {
  connected: boolean;
  source: 'environment' | 'user_config';
  error?: string;
}

export interface ExportRequest {
  data: any;
  format: 'csv' | 'txt' | 'json' | 'pdf' | 'xlsx' | 'docx';
  filename?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  chunks_created?: number;
  filename?: string;
}

export interface ChatResponse {
  response: string;
  model_used: string;
  rag_used: boolean;
  context_found: boolean;
}

export type View = 'chat' | 'settings';

export type ExportFormat = 'csv' | 'txt' | 'json' | 'pdf' | 'xlsx' | 'docx';