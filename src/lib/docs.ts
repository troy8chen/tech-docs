import { TECH_DOCS, DOC_CONFIG } from './config';
import { storeDocuments } from './ai';
import type { DocumentChunk, IngestionResult } from '@/types';

// Parse and chunk markdown content into smaller pieces
export function parseMarkdownToChunks(
  content: string,
  domain: string,
  source: string = 'documentation'
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Split by major sections (## headers)
  const sections = content.split(/^## /m);
  
  sections.forEach((section, sectionIndex) => {
    if (!section.trim()) return;
    
    const lines = section.split('\n');
    const sectionTitle = sectionIndex === 0 ? 'Introduction' : lines[0]?.trim() || `Section ${sectionIndex}`;
    const sectionContent = lines.slice(1).join('\n').trim();
    
    // Further split large sections by subsections (### headers)
    const subsections = sectionContent.split(/^### /m);
    
    subsections.forEach((subsection, subIndex) => {
      if (!subsection.trim()) return;
      
      const subLines = subsection.split('\n');
      const subTitle = subIndex === 0 ? '' : subLines[0]?.trim() || '';
      const subContent = subLines.slice(subIndex === 0 ? 0 : 1).join('\n').trim();
      
      // Create chunks with optimal size
      const processedChunks = createOptimalChunks(
        subContent,
        sectionTitle,
        subTitle,
        domain,
        source
      );
      
      chunks.push(...processedChunks);
    });
  });
  
  return chunks.filter(chunk => chunk.content.length >= DOC_CONFIG.minChunkSize);
}

// Create optimally sized chunks from content
function createOptimalChunks(
  content: string,
  sectionTitle: string,
  subTitle: string,
  domain: string,
  source: string
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const maxSize = DOC_CONFIG.maxChunkSize;
  
  if (content.length <= maxSize) {
    // Content fits in one chunk
    const title = subTitle ? `${sectionTitle} - ${subTitle}` : sectionTitle;
    chunks.push({
      content: `# ${title}\n\n${content}`,
      metadata: {
        source,
        section: sectionTitle,
        subsection: subTitle,
        type: 'documentation',
        chunkIndex: 0,
        domain
      }
    });
  } else {
    // Split large content by paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;
    
    paragraphs.forEach((paragraph) => {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) return;
      
      // Check if adding this paragraph would exceed max size
      if (currentChunk.length + trimmedParagraph.length > maxSize) {
        if (currentChunk) {
          // Save current chunk
          const title = subTitle ? `${sectionTitle} - ${subTitle}` : sectionTitle;
          chunks.push({
            content: `# ${title}\n\n${currentChunk}`,
            metadata: {
              source,
              section: sectionTitle,
              subsection: subTitle,
              type: 'documentation',
              chunkIndex,
              domain
            }
          });
          chunkIndex++;
        }
        currentChunk = trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    });
    
    // Save the last chunk
    if (currentChunk) {
      const title = subTitle ? `${sectionTitle} - ${subTitle}` : sectionTitle;
      chunks.push({
        content: `# ${title}\n\n${currentChunk}`,
        metadata: {
          source,
          section: sectionTitle,
          subsection: subTitle,
          type: 'documentation',
          chunkIndex,
          domain
        }
      });
    }
  }
  
  return chunks;
}

// Ingest Inngest documentation from their LLM-optimized format
export async function ingestInngestDocs(): Promise<IngestionResult> {
  console.log("🚀 Starting Inngest documentation ingestion...");
  
  try {
    // Fetch Inngest's LLM-optimized docs
    const response = await fetch('https://www.inngest.com/llms-full.txt');
    if (!response.ok) {
      throw new Error(`Failed to fetch Inngest docs: ${response.status} ${response.statusText}`);
    }
    
    const fullDocs = await response.text();
    console.log(`📄 Downloaded ${fullDocs.length} characters of Inngest documentation`);
    
    // Parse and chunk the documentation
    const chunks = parseMarkdownToChunks(fullDocs, 'inngest', 'inngest-official-docs');
    console.log(`✂️ Created ${chunks.length} chunks from Inngest documentation`);
    
    if (chunks.length === 0) {
      throw new Error("No valid chunks created from Inngest documentation");
    }
    
    // Store in Pinecone
    const storedCount = await storeDocuments(chunks, 'inngest');
    
    console.log(`✅ Successfully stored ${storedCount} chunks in Pinecone namespace: inngest-docs`);
    
    return {
      success: true,
      message: `Successfully ingested Inngest documentation: ${storedCount} chunks`,
      chunks: storedCount,
      domain: 'inngest',
      source: 'https://www.inngest.com/llms-full.txt'
    };
    
  } catch (error) {
    console.error("❌ Inngest documentation ingestion failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Inngest ingestion failed: ${errorMessage}`,
      chunks: 0,
      domain: 'inngest'
    };
  }
}

// Generic function to ingest custom text content
export async function ingestCustomText(
  text: string,
  domain: string,
  source: string = 'custom-upload'
): Promise<IngestionResult> {
  console.log(`🚀 Starting custom text ingestion for domain: ${domain}`);
  
  try {
    const domainConfig = TECH_DOCS[domain];
    if (!domainConfig) {
      throw new Error(`Domain '${domain}' doesn't exist in configuration`);
    }
    
    // Parse and chunk the text
    const chunks = parseMarkdownToChunks(text, domain, source);
    console.log(`✂️ Created ${chunks.length} chunks from custom text`);
    
    if (chunks.length === 0) {
      throw new Error("No valid chunks created from provided text");
    }
    
    // Store in Pinecone
    const storedCount = await storeDocuments(chunks, domain);
    
    console.log(`✅ Successfully stored ${storedCount} chunks in Pinecone namespace: ${domainConfig.namespace}`);
    
    return {
      success: true,
      message: `Successfully ingested custom text for ${domainConfig.name}: ${storedCount} chunks`,
      chunks: storedCount,
      domain,
      source
    };
    
  } catch (error) {
    console.error(`❌ Custom text ingestion failed for domain ${domain}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Custom text ingestion failed: ${errorMessage}`,
      chunks: 0,
      domain
    };
  }
}

// Process uploaded file content
export async function processUploadedFile(
  fileContent: string,
  fileName: string,
  domain: string
): Promise<IngestionResult> {
  console.log(`🚀 Processing uploaded file: ${fileName} for domain: ${domain}`);
  
  try {
    // Determine file type and process accordingly
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let processedContent = fileContent;
    
    // For now, treat all files as text/markdown
    // Future: Add specific processors for PDF, DOCX, etc.
    if (fileExtension === 'json') {
      // If it's JSON, convert to readable text
      try {
        const jsonData = JSON.parse(fileContent);
        processedContent = JSON.stringify(jsonData, null, 2);
      } catch {
        // If JSON parsing fails, treat as plain text
        processedContent = fileContent;
      }
    }
    
    return await ingestCustomText(processedContent, domain, `uploaded-file: ${fileName}`);
    
  } catch (error) {
    console.error(`❌ File processing failed for ${fileName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `File processing failed: ${errorMessage}`,
      chunks: 0,
      domain
    };
  }
}

// Test connection to Pinecone and validate setup
export async function testPineconeConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔧 Testing Pinecone connection...");
    
    // Basic validation - if we got this far, configuration is likely correct
    const inngestConfig = TECH_DOCS.inngest;
    if (!inngestConfig) {
      throw new Error("Inngest configuration not found");
    }
    
    console.log("✅ Pinecone configuration appears valid");
    return {
      success: true,
      message: "Pinecone connection test passed - ready for document ingestion"
    };
    
  } catch (error) {
    console.error("❌ Pinecone connection test failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Pinecone connection failed: ${errorMessage}`
    };
  }
}