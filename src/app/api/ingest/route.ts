import { NextRequest } from 'next/server';
import { processDocumentText, ingestDocuments } from '@/lib/docs';
import { TECH_DOMAINS, getDomainConfig } from '@/lib/config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const domain = formData.get('domain') as string || 'custom';
    const files = formData.getAll('files') as File[];
    const url = formData.get('url') as string;
    const text = formData.get('text') as string;

    // Validate input
    if (!files.length && !url && !text) {
      return Response.json({ 
        error: 'Please provide files, URL, or text content' 
      }, { status: 400 });
    }

    console.log(`📥 Ingestion request for domain: ${domain}`);

    const documents: Array<{ content: string; source: string }> = [];

    // Process files
    for (const file of files) {
      if (!file.type.includes('text') && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        return Response.json({ 
          error: `Unsupported file type: ${file.type}. Please use text, markdown, or plain text files.` 
        }, { status: 400 });
      }

      const content = await file.text();
      documents.push({
        content,
        source: file.name
      });
    }

    // Process URL
    if (url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const content = await response.text();
        documents.push({
          content,
          source: url
        });
      } catch (error) {
        return Response.json({ 
          error: `Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 400 });
      }
    }

    // Process direct text
    if (text) {
      documents.push({
        content: text,
        source: 'Direct input'
      });
    }

    // Ensure domain exists in config
    if (!getDomainConfig(domain)) {
      // Create a dynamic domain config
      TECH_DOMAINS[domain] = {
        name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Documentation`,
        namespace: `${domain}-docs`,
        systemPrompt: `You are an expert in ${domain}. Provide comprehensive, accurate guidance based on the uploaded documentation.`,
        source: 'User uploaded content',
        isActive: true
      };
    }

    // Process and ingest documents
    const allChunks: Array<{
      content: string;
      source: string;
      section: string;
    }> = [];

    for (const doc of documents) {
      const chunks = processDocumentText(doc.content, doc.source);
      allChunks.push(...chunks);
    }

    console.log(`📊 Processing ${allChunks.length} chunks for domain: ${domain}`);

    // Ingest into Pinecone
    const result = await ingestDocuments(allChunks, domain);

    return Response.json({
      success: true,
      domain,
      chunks: result.chunks,
      message: `Successfully ingested ${result.chunks} chunks into ${domain} domain`
    });

  } catch (error) {
    console.error('Ingestion API error:', error);
    
    return Response.json({
      error: 'Failed to process ingestion request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle file upload limits
export async function GET() {
  return Response.json({
    info: 'Document Ingestion API',
    supportedFormats: ['text/plain', '.md', '.txt'],
    maxFileSize: '10MB',
    domains: Object.keys(TECH_DOMAINS)
  });
} 