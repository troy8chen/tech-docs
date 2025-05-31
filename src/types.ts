// Core types for Inngest Expert Chatbot

export interface ExpertiseDomain {
    name: string;
    namespace: string;           // Pinecone namespace
    systemPrompt: string;
    source: string;             // URL or 'manual'
    officialDocUrls?: string[]; // List of official documentation URLs to crawl
    isActive: boolean;
    // Optional properties for dynamic domains
    id?: string;
    description?: string;
    color?: string;
    icon?: string;
  }
  
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    domain: string;
    timestamp: Date;
    sources?: string[];
  }
  
  export interface DocumentChunk {
    content: string;
    metadata: {
      source: string;
      section?: string;
      subsection?: string;
      type: 'documentation' | 'custom' | 'manual';
      chunkIndex: number;
      domain: string;
    };
  }
  
  export interface VectorSearchResult {
    content: string;
    source: string;
    score: number;
    metadata?: Record<string, unknown>;
  }
  
  export interface IngestionResult {
    success: boolean;
    message: string;
    chunks: number;
    domain: string;
    source?: string;
  }
  
  export interface ChatRequest {
    message: string;
    domain: string;
    sessionId?: string;
  }
  
  export interface ChatResponse {
    response: string;
    sources: string[];
    domain: string;
  }