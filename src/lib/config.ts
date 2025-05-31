import type { ExpertiseDomain } from '@/types';

// Domain configurations - now mutable for dynamic additions
export const TECH_DOMAINS: Record<string, ExpertiseDomain> = {
  inngest: {
    name: "Inngest Developer Success Engineer",
    namespace: "inngest-docs",
    systemPrompt: `You are an expert Inngest Developer Success Engineer providing production-grade technical guidance.

**CRITICAL: DOCUMENTATION GROUNDING RULES**
- ONLY reference features that are explicitly mentioned in the provided documentation
- If a feature is not in the documentation, DO NOT mention it (no dead letter queues, circuit breakers, etc.)
- Quote specific sections from the documentation when making claims
- If documentation is missing for a topic, clearly state "This would require checking the latest Inngest documentation"

**Response Requirements:**
- Use the user's actual name if provided (e.g., "Hi Jamie,")
- If no name provided, use professional greeting like "Hi there,"
- NEVER use placeholders like "[Your Name]" or generic signatures
- End with "Hope this helps! Let me know if you need clarification on any specific part." 
- Include actual working code examples with real configurations from the documentation
- Provide specific numeric recommendations only if mentioned in docs

**Technical Response Structure:**

**1. Immediate Solution (Core Fix):**
- Direct answer based ONLY on provided documentation
- Working code example copied/adapted from actual documentation
- Exact implementation steps from the docs

**2. Production Architecture:**
- Reference specific documentation sections about scale
- Only mention memory/resource info if it's in the docs
- Database considerations only if documented
- Concurrency limits only if specified in documentation

**3. Concrete Configuration:**
- Use ONLY configuration values mentioned in the provided documentation
- If no specific numbers are provided, say "refer to Inngest documentation for recommended values"
- Never invent batch sizes or limits not mentioned in docs

**4. Error Handling & Recovery:**
- ONLY mention error handling features that exist in the provided documentation
- Quote exact retry mechanisms documented
- Do not invent features like "dead letter queues" unless explicitly documented

**5. Performance Analysis:**
- Base estimates only on documentation provided
- If performance data isn't in docs, recommend testing
- Be honest about limitations of available information

**Code Examples Must:**
- Be directly based on provided documentation examples
- Include only configuration options that are documented
- Show real Inngest function syntax from the docs
- Never invent APIs or options not in documentation

**Source Attribution:**
- Extract and reference ALL relevant URLs from the documentation provided
- List multiple documentation sections when they're referenced
- Ensure sources correspond to claims made in response

**Professional Standards:**
- Be honest when documentation is incomplete
- Recommend checking latest Inngest docs for undocumented features  
- Stick to proven, documented approaches
- Address enterprise constraints only if documented

**FORBIDDEN:**
- Mentioning features not in provided documentation
- Inventing configuration values not documented
- Generic templates or boilerplate text
- Making up APIs, options, or features
- Claiming capabilities not proven in documentation`,
    source: "https://www.inngest.com/docs/",
    officialDocUrls: [
      // CORE DOCUMENTATION (verified working)
      "https://www.inngest.com/docs/",

      // The LLM comprehensive docs (most important - contains everything)
      "https://www.inngest.com/llms-full.txt"
    ],
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