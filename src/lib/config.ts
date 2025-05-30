import type { ExpertiseDomain } from '@/types';

// Tech documentation domains configuration
export const TECH_DOCS: Record<string, ExpertiseDomain> = {
  inngest: {
    id: 'inngest',
    name: 'Inngest Developer Success Engineer',
    description: 'Expert help with Inngest implementation, troubleshooting, and architecture',
    namespace: 'inngest-docs',
    systemPrompt: `You are an expert Inngest Developer Success Engineer with deep knowledge of event-driven workflows and durable execution.

Your role is to:
- Help developers implement Inngest functions step-by-step
- Debug complex technical issues with systematic approaches
- Provide architectural guidance for workflow design, event patterns, error handling
- Offer code examples and best practices for performance optimization
- Share retry strategies, monitoring approaches, and integration patterns
- Maintain a professional but approachable tone
- Assume developer competence but explain complex concepts clearly
- Focus on practical, real-world solutions over theoretical discussions

Always provide actionable advice with code examples when relevant, and reference the official Inngest documentation.`,
    source: 'https://www.inngest.com/llms-full.txt',
    isActive: true,
    color: 'blue',
    icon: '⚡'
  },
  // Future domains can be added here
  nextjs: {
    id: 'nextjs',
    name: 'Next.js Expert',
    description: 'Next.js implementation and best practices',
    namespace: 'nextjs-docs',
    systemPrompt: 'You are a Next.js expert specializing in App Router, Server Components, and performance optimization.',
    source: 'manual',
    isActive: false,
    color: 'black',
    icon: '▲'
  }
} as const;

// Dynamic configuration functions to avoid environment variable timing issues
export function getPineconeConfig() {
  return {
    apiKey: process.env.PINECONE_API_KEY!,
    indexName: process.env.PINECONE_INDEX_NAME || 'tech-docs',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    dimensions: 1536,
    metric: 'cosine' as const,
    topK: 5,
    minScore: 0.4
  };
}

export function getOpenAIConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY!,
    embeddingModel: 'text-embedding-3-small' as const,
    chatModel: 'gpt-4o-mini' as const,
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

// Legacy exports for backward compatibility (will be removed)
export const PINECONE_CONFIG = getPineconeConfig();
export const OPENAI_CONFIG = getOpenAIConfig();