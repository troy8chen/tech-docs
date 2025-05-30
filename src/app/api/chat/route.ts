import { generateRAGResponse } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

// Enable streaming for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message, domain = 'inngest' } = await request.json();
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return new NextResponse('Message is required', { status: 400 });
    }

    console.log(`💬 Chat request: "${message.substring(0, 50)}..." for domain: ${domain}`);

    // Generate streaming response
    const { completion, sources } = await generateRAGResponse(message, domain);

    const encoder = new TextEncoder();
    let accumulatedContent = '';

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            sources: sources
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));
          
          // Stream the completion
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (content) {
              accumulatedContent += content;
              const data = { type: 'content', content };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          }
          
          // Extract additional URLs from the completed response
          const additionalUrls = new Set<string>();
          const urlPatterns = [
            /https:\/\/(?:www\.)?inngest\.com\/docs\/[^\s\)\]\,\;]+/g,
            /https:\/\/(?:www\.)?inngest\.com\/docs\/guides\/[^\s\)\]\,\;]+/g,
            /https:\/\/(?:www\.)?inngest\.com\/docs\/reference\/[^\s\)\]\,\;]+/g,
            /https:\/\/(?:www\.)?inngest\.com\/blog\/[^\s\)\]\,\;]+/g
          ];
          
          urlPatterns.forEach(pattern => {
            const matches = accumulatedContent.match(pattern);
            if (matches) {
              matches.forEach(url => {
                const cleanUrl = url.replace(/[.,;:!?\]\)]*$/, '').replace(/#.*$/, '');
                if (cleanUrl.length > 20 && !sources.includes(cleanUrl)) {
                  additionalUrls.add(cleanUrl);
                }
              });
            }
          });

          // Combine original sources with additional URLs found in response
          const finalSources = [...sources, ...Array.from(additionalUrls)];

          // Send completion signal with final sources
          const completionEvent = {
            type: 'completion',
            sources: finalSources
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
          
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorData = { type: 'error', error: errorMessage };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 