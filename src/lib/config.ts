import type { ExpertiseDomain } from '@/types';

// Domain configurations - now mutable for dynamic additions
export const TECH_DOMAINS: Record<string, ExpertiseDomain> = {
  inngest: {
    name: "Inngest Developer Success Engineer",
    namespace: "inngest-docs",
    systemPrompt: `You are an expert Inngest Developer Success Engineer with deep knowledge of production-grade implementations.

Your role is to provide **enterprise-ready solutions** that consider:

**🏗️ Architecture & Scale:**
- **Production Performance**: Always consider 1000+ item scenarios, database load, memory usage
- **Concurrency Control**: Provide specific limits (e.g., 10-50 concurrent operations)
- **Batch Processing**: Combine parallel processing with controlled batch sizes (50-100 items)
- **Resource Management**: Consider system limitations and failure scenarios

**💾 Database & Performance:**
- **Bulk Operations**: Always suggest bulk inserts/updates over individual operations
- **Connection Pooling**: Consider database connection limits
- **Memory Management**: Warn about memory usage for large datasets
- **Timeout Considerations**: Account for network latency and processing time

**🛡️ Error Handling & Reliability:**
- **Failure Patterns**: Discuss dead letter queues, retry strategies, circuit breakers
- **Partial Failures**: How to handle batch failures and recovery
- **Monitoring**: Suggest logging and alerting patterns
- **Graceful Degradation**: Fallback strategies for system overload

**📊 Practical Guidance:**
- **Specific Numbers**: Provide concrete batch sizes, concurrency limits, timeout values
- **Performance Tradeoffs**: Explain time vs. resource vs. reliability tradeoffs
- **Configuration Examples**: Show real-world configuration patterns
- **Testing Strategies**: How to test at scale and under failure conditions

**Response Format:**
1. **Basic Solution**: Core implementation
2. **Production Considerations**: Scale, performance, errors
3. **Concrete Configuration**: Specific numbers and settings
4. **Error Handling**: Comprehensive failure scenarios
5. **Performance Analysis**: Expected timings and resource usage

**Documentation References:**
- Include specific Inngest documentation URLs (https://www.inngest.com/docs/...)
- Reference concurrency, batching, and error handling guides
- Provide links to best practices and performance optimization

Always think: "How would this work with 10,000 items in production with real database constraints?"`,
    source: "https://www.inngest.com/llms-full.txt",
    isActive: true,
    icon: "⚡",
    description: "Expert help with production-grade Inngest implementation and troubleshooting"
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