import type { ExpertiseDomain } from '@/types';

// Domain configurations - now mutable for dynamic additions
export const TECH_DOMAINS: Record<string, ExpertiseDomain> = {
  inngest: {
    name: "Inngest Developer Success Engineer",
    namespace: "inngest-docs",
    systemPrompt: `You are an expert Inngest Developer Success Engineer with deep knowledge of the Inngest platform. 

Your role is to provide:
- **Expert Implementation Guidance**: Step-by-step instructions for implementing Inngest functions, workflows, and integrations
- **Architectural Advice**: Best practices for designing reliable, scalable event-driven systems
- **Troubleshooting Help**: Systematic approaches to debugging common issues
- **Production Readiness**: Guidance on error handling, retries, monitoring, and deployment strategies

**Response Guidelines:**
- Provide practical, actionable advice with specific code examples
- Include relevant Inngest documentation URLs when referencing specific features (e.g., https://www.inngest.com/docs/functions/triggers)
- Use technical precision but remain accessible to developers of all levels
- Focus on real-world solutions over theoretical discussions
- Always consider production reliability and best practices

**When providing documentation references:**
- Include specific Inngest documentation URLs (https://www.inngest.com/docs/...) 
- Reference actual guide pages, reference docs, or blog posts when available
- Avoid generic citations - use actual URLs to help users find detailed information

You have access to comprehensive Inngest documentation to provide accurate, up-to-date guidance.`,
    source: "https://www.inngest.com/llms-full.txt",
    isActive: true,
    icon: "⚡",
    description: "Expert help with Inngest implementation and troubleshooting"
  }
};

// Client-safe helper functions for domain management
export function getDomainConfig(domain: string): ExpertiseDomain | null {
  return TECH_DOMAINS[domain] || null;
}

export function getActiveDomains(): Record<string, ExpertiseDomain> {
  return Object.fromEntries(
    Object.entries(TECH_DOMAINS).filter(([, config]) => config.isActive)
  );
}

export function addDomain(domain: string, config: ExpertiseDomain): void {
  TECH_DOMAINS[domain] = config;
}

// Server-only configuration functions (only call these in API routes or server components)
export function getPineconeConfig() {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('getPineconeConfig can only be called on the server side');
  }
  
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || 'tech-docs';
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }
  
  return {
    apiKey,
    indexName,
    topK: 5,
    minScore: 0.4
  };
}

export function getOpenAIConfig() {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('getOpenAIConfig can only be called on the server side');
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  return {
    apiKey,
    embeddingModel: 'text-embedding-3-small' as const,
    chatModel: 'gpt-4' as const,
    temperature: 0.1,
    maxTokens: 2048
  };
}

// Static configuration
export const DOC_CONFIG = {
  maxChunkSize: 1000,
  chunkOverlap: 200,
  minChunkSize: 100,
  batchSize: 100,
  rateLimit: 1000 // ms between batches
};

// Note: PINECONE_CONFIG and OPENAI_CONFIG legacy exports removed
// Use getPineconeConfig() and getOpenAIConfig() functions in server-side code only