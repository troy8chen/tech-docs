import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { getPineconeConfig, getOpenAIConfig, TECH_DOMAINS } from './config';
import type { VectorSearchResult, DocumentChunk } from '@/types';

// Lazy initialization of clients
let pineconeClient: Pinecone | null = null;
let openaiClient: OpenAI | null = null;
let indexClient: ReturnType<Pinecone['index']> | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const config = getPineconeConfig();
    pineconeClient = new Pinecone({
      apiKey: config.apiKey
    });
  }
  return pineconeClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const config = getOpenAIConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey
    });
  }
  return openaiClient;
}

function getIndexClient() {
  if (!indexClient) {
    const config = getPineconeConfig();
    indexClient = getPineconeClient().index(config.indexName);
  }
  return indexClient;
}

// Generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const config = getOpenAIConfig();
    const response = await openai.embeddings.create({
      model: config.embeddingModel,
      input: text.substring(0, 8000) // Token limit safety
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate embedding: ${errorMessage}`);
  }
}

// Search documents in Pinecone
export async function searchDocuments(
  query: string,
  domain: string,
  topK: number = getPineconeConfig().topK
): Promise<VectorSearchResult[]> {
  try {
    const domainConfig = TECH_DOMAINS[domain];
    if (!domainConfig?.isActive) {
      throw new Error(`Domain '${domain}' is not active or doesn't exist`);
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search in domain namespace
    const searchResponse = await getIndexClient().namespace(domainConfig.namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      includeValues: false
    });

    // Process and filter results
    const results: VectorSearchResult[] = searchResponse.matches
      ?.filter((match: unknown) => {
        const score = (match as { score?: number }).score || 0;
        return score >= getPineconeConfig().minScore;
      })
      ?.map((match: unknown) => {
        const matchObj = match as {
          score?: number;
          metadata?: Record<string, unknown>;
        };
        return {
          content: String(matchObj.metadata?.content || ''),
          source: String(matchObj.metadata?.source || ''),
          score: matchObj.score || 0,
          metadata: matchObj.metadata
        };
      }) || [];

    console.log(`Found ${results.length} relevant documents for query: "${query.substring(0, 50)}..."`);
    return results;
    
  } catch (error) {
    console.error('Error searching documents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Document search failed: ${errorMessage}`);
  }
}

// Store document chunks in Pinecone
export async function storeDocuments(
  chunks: DocumentChunk[],
  domain: string
): Promise<number> {
  try {
    const domainConfig = TECH_DOMAINS[domain];
    if (!domainConfig) {
      throw new Error(`Domain '${domain}' doesn't exist`);
    }

    const namespace = domainConfig.namespace;
    console.log(`Storing ${chunks.length} chunks in Pinecone namespace: ${namespace}`);
    
    let totalStored = 0;
    const batchSize = 100;
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const vectors = await Promise.all(
        batch.map(async (chunk, idx) => {
          const embedding = await generateEmbedding(chunk.content);
          return {
            id: `${domain}-${i + idx}-${Date.now()}`,
            values: embedding,
            metadata: {
              content: chunk.content,
              ...chunk.metadata,
              domain // This will override the domain from chunk.metadata, which is intended
            }
          };
        })
      );
      
      // Store in Pinecone namespace
      await getIndexClient().namespace(namespace).upsert(vectors);
      totalStored += vectors.length;
      
      console.log(`Stored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}, total: ${totalStored}`);
      
      // Rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return totalStored;
    
  } catch (error) {
    console.error('Error storing documents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to store documents: ${errorMessage}`);
  }
}

// Generate chat response using RAG
export async function generateRAGResponse(
  message: string,
  domain: string
): Promise<{ completion: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>; sources: string[] }> {
  try {
    const domainConfig = TECH_DOMAINS[domain];
    if (!domainConfig?.isActive) {
      throw new Error(`Domain '${domain}' is not active`);
    }

    // Search for relevant context
    const searchResults = await searchDocuments(message, domain);
    
    if (searchResults.length === 0) {
      throw new Error("No relevant documentation found for your question");
    }

    // Build context for LLM
    const contextText = searchResults
      .map(result => `Source: ${result.source}\nContent: ${result.content}`)
      .join('\n\n---\n\n');

    // Extract URLs from search results content with broader patterns
    const allUrls = new Set<string>();
    
    searchResults.forEach(result => {
      // Look for any Inngest URLs (docs, guides, blog, etc.)
      const urlPatterns = [
        /https:\/\/(?:www\.)?inngest\.com\/docs\/[^\s\)\]\,\;]+/g,
        /https:\/\/(?:www\.)?inngest\.com\/docs\/guides\/[^\s\)\]\,\;]+/g,
        /https:\/\/(?:www\.)?inngest\.com\/docs\/reference\/[^\s\)\]\,\;]+/g,
        /https:\/\/(?:www\.)?inngest\.com\/blog\/[^\s\)\]\,\;]+/g,
        /https:\/\/(?:www\.)?inngest\.com\/[^\s\)\]\,\;]+/g
      ];
      
      urlPatterns.forEach(pattern => {
        const matches = result.content.match(pattern);
        if (matches) {
          matches.forEach(url => {
            // Clean up trailing characters and fragments
            const cleanUrl = url.replace(/[.,;:!?\]\)]*$/, '').replace(/#.*$/, '');
            if (cleanUrl.length > 20) { // Only include substantial URLs
              allUrls.add(cleanUrl);
            }
          });
        }
      });
    });

    // Convert to array and sort for consistent display
    let sources = Array.from(allUrls).sort();

    // If no URLs found, fall back to section names
    if (sources.length === 0) {
      const sections = new Set<string>();
      searchResults.forEach(result => {
        if (result.metadata?.section && typeof result.metadata.section === 'string') {
          sections.add(`Inngest Docs: ${result.metadata.section}`);
        }
      });
      sources = Array.from(sections);
    }

    // If still no sources, use domain name as fallback
    if (sources.length === 0) {
      sources = ['inngest-official-docs'];
    }

    // Generate streaming response
    const completion = await getOpenAIClient().chat.completions.create({
      model: getOpenAIConfig().chatModel,
      temperature: getOpenAIConfig().temperature,
      max_tokens: getOpenAIConfig().maxTokens,
      messages: [
        { 
          role: 'system', 
          content: domainConfig.systemPrompt 
        },
        { 
          role: 'user', 
          content: `Based on the following documentation, please help with this question:

DOCUMENTATION:
${contextText}

QUESTION: ${message}

Please provide a detailed, practical response as a Developer Success Engineer would. When referencing specific Inngest features or concepts, include the actual documentation URLs (like https://www.inngest.com/docs/functions/triggers) to help users find more detailed information. Include code examples if relevant, and be specific about implementation steps.`
        }
      ],
      stream: true
    });

    return { completion, sources };
    
  } catch (error) {
    console.error('Error generating RAG response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate response: ${errorMessage}`);
  }
}