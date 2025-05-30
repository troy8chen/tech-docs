import { generateRAGResponse } from '@/lib/ai';
import { NextRequest } from 'next/server';

// Enable streaming for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message, domain = 'inngest' } = await request.json();
    
    // Validate input
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`💬 Chat request: "${message.substring(0, 50)}..." for domain: ${domain}`);

    // Generate streaming response
    const { completion, sources } = await generateRAGResponse(message.trim(), domain);

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Send initial metadata with sources
          const initialData = {
            type: 'metadata',
            sources,
            domain,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
          
          // Stream the completion
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (content) {
              const streamData = {
                type: 'content',
                content
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamData)}\n\n`));
            }
          }
          
          // Send completion signal
          const doneData = {
            type: 'done',
            message: 'Response completed'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`));
          
        } catch (error) {
          console.error('Error during streaming:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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