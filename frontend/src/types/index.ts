export interface DocumentItem {
  document_id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
  status: 'indexed' | 'processing' | 'error';
  chunks_count?: number;
}

export interface Citation {
  source: string;
  filename: string;
  page: number;
  chunk_id: string | number;
  score: number;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  isError?: boolean;
}

export interface SystemMetrics {
  chromaLatencyMs: number;
  embeddingModelLatencyMs: number;
  throughputReqMin: number;
  totalTokens: number;
  cloudSyncTime: string;
  cacheHitRatioPercent: number;
}

export interface SystemConfig {
  vectorDbPath: string;
  embeddingModelName: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  userId: string;
}

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  summary: string;
  description: string;
  requestHeader?: string;
  requestBody?: string;
  responseBody: string;
}
