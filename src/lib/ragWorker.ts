import Redis from 'ioredis';
import { generateRAGResponse, classifyQuery } from './ai'; // Add classifyQuery import

interface RAGQueryEvent {
  id: string;
  userId: string;
  channelId: string;
  message: string;
  domain: string;
  timestamp: number;
}

interface RAGResponseEvent {
  id: string;
  userId: string;
  channelId: string;
  response: string;
  sources: string[];
  success: boolean;
  timestamp: number;
}

export class RAGWorker {
  private redis: Redis;
  private subscriber: Redis;
  private isRunning = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('RAG worker already running');
      return;
    }

    try {
      await this.redis.ping();
      console.log('✅ Redis connected');

      await this.subscriber.subscribe('rag:query');
      this.subscriber.on('message', this.handleMessage.bind(this));

      this.isRunning = true;
      console.log('🤖 RAG worker started, listening for queries...');

      process.on('SIGTERM', () => this.stop());
      process.on('SIGINT', () => this.stop());

    } catch (error) {
      console.error('❌ Failed to start RAG worker:', error);
      throw error;
    }
  }

  private async handleMessage(channel: string, message: string): Promise<void> {
    if (channel !== 'rag:query') return;

    try {
      const event: RAGQueryEvent = JSON.parse(message);
      console.log(`📝 Processing query: ${event.id.substring(0, 8)}...`);

      await this.processRAGQuery(event);

    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  /**
   * Returns a standard response for generic queries and common technical questions
   */
  private getGenericResponse(query: string = ''): { response: string; sources: string[] } {
    const normalizedQuery = query.toLowerCase();
    
    // Check for common technical question patterns first
    
    // 1. Function Not Triggering (Most Common!)
    if (normalizedQuery.includes('function') && 
        (normalizedQuery.includes('trigger') || normalizedQuery.includes('not work') || 
         normalizedQuery.includes('show up') || normalizedQuery.includes('dev server') ||
         normalizedQuery.includes("isn't") || normalizedQuery.includes("doesn't"))) {
      return {
        response: `🔧 **Function Not Triggering? Here's the fix:**

**Missing \`serve\` export in your route.ts:**
\`\`\`typescript
// /app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(/*...*/);

// ⚡ CRITICAL: Export the serve handler
const handler = serve({
  client: inngest,
  functions: [helloWorld] // Add ALL functions here
});

export { handler as GET, handler as POST, handler as PUT };
\`\`\`

**Quick checklist:**
1. Visit \`http://localhost:3000/api/inngest\` - should show registered functions
2. Run \`npx inngest-cli@latest dev\` 
3. Check \`http://localhost:8288\` for function list`,
        sources: ['https://www.inngest.com/docs/functions/create', 'https://www.inngest.com/docs/local-development']
      };
    }
    
    // 2. Error Handling & Retries
    if ((normalizedQuery.includes('error') && (normalizedQuery.includes('handling') || normalizedQuery.includes('retry') || normalizedQuery.includes('retries'))) ||
        (normalizedQuery.includes('implement') && normalizedQuery.includes('retry')) ||
        (normalizedQuery.includes('retry') || normalizedQuery.includes('retries'))) {
      return {
        response: `🛡️ **Error Handling & Retries:**

**Automatic retries (simplest):**
\`\`\`typescript
export const reliableFunction = inngest.createFunction(
  { 
    id: "my-function",
    retries: 3 // Auto-retry up to 3 times
  },
  { event: "process.data" },
  async ({ event, step }) => {
    // Any thrown error triggers retry
    return await step.run("process", async () => {
      return await riskyApiCall();
    });
  }
);
\`\`\`

**Custom error handling:**
\`\`\`typescript
import { NonRetriableError } from "inngest";

// In your step
if (error.code === 'RATE_LIMITED') {
  throw new NonRetriableError('Skip retries for rate limits');
}
throw error; // Will retry normally
\`\`\``,
        sources: ['https://www.inngest.com/docs/functions/error-handling', 'https://www.inngest.com/docs/functions/retries']
      };
    }
    
    // 3. Steps & Timeouts
    if ((normalizedQuery.includes('step') && (normalizedQuery.includes('timeout') || normalizedQuery.includes('break') || normalizedQuery.includes('split'))) ||
        (normalizedQuery.includes('break') && normalizedQuery.includes('function')) ||
        (normalizedQuery.includes('avoid') && (normalizedQuery.includes('timeout') || normalizedQuery.includes('times out') || normalizedQuery.includes('timed out'))) ||
        (normalizedQuery.includes('timeout') || normalizedQuery.includes('times out') || normalizedQuery.includes('timed out'))) {
      return {
        response: `⏱️ **Break Functions into Steps to Avoid Timeouts:**

**Problem**: Single long-running function times out
**Solution**: Split into steps that run independently

\`\`\`typescript
export const processLargeDataset = inngest.createFunction(
  { id: "process-dataset" },
  { event: "data.process" },
  async ({ event, step }) => {
    // Each step runs independently with its own timeout
    const data = await step.run("fetch-data", async () => {
      return await fetchLargeDataset(event.data.id);
    });
    
    const processed = await step.run("process-data", async () => {
      return await heavyProcessing(data);
    });
    
    await step.run("save-results", async () => {
      return await saveToDatabase(processed);
    });
  }
);
\`\`\`

**Benefits**: Each step gets full timeout, automatic checkpointing`,
        sources: ['https://www.inngest.com/docs/functions/steps']
      };
    }
    
    // 4. Rate Limiting
    if ((normalizedQuery.includes('rate') && (normalizedQuery.includes('limit') || normalizedQuery.includes('limiting') || normalizedQuery.includes('throttle'))) ||
        normalizedQuery.includes('concurrency')) {
      return {
        response: `🚦 **Rate Limiting in Inngest:**

**Built-in concurrency control:**
\`\`\`typescript
export const rateLimitedFunction = inngest.createFunction(
  { 
    id: "api-calls",
    concurrency: {
      limit: 5 // Max 5 concurrent executions
    }
  },
  { event: "api.call" },
  async ({ event, step }) => {
    // Only 5 of these will run simultaneously
    return await step.run("api-call", async () => {
      return await externalApiCall(event.data);
    });
  }
);
\`\`\`

**Custom rate limiting with steps:**
\`\`\`typescript
await step.sleep("rate-limit", { seconds: 1 }); // 1 second delay
\`\`\``,
        sources: ['https://www.inngest.com/docs/functions/concurrency']
      };
    }
    
    // 5. Local Development Setup
    if ((normalizedQuery.includes('local') && (normalizedQuery.includes('development') || normalizedQuery.includes('dev') || normalizedQuery.includes('setup'))) ||
        (normalizedQuery.includes('set up') && normalizedQuery.includes('inngest')) ||
        normalizedQuery.includes('inngest-cli')) {
      return {
        response: `🛠️ **Local Development Setup:**

**1. Install Inngest CLI:**
\`\`\`bash
npm install -g inngest-cli
\`\`\`

**2. Start your Next.js app:**
\`\`\`bash
npm run dev  # Your app on localhost:3000
\`\`\`

**3. Start Inngest Dev Server:**
\`\`\`bash
npx inngest-cli@latest dev
# Opens dashboard at http://localhost:8288
\`\`\`

**4. Test your setup:**
- Visit \`http://localhost:3000/api/inngest\` (should show functions)
- Visit \`http://localhost:8288\` (Inngest dashboard)
- Send test events from the dashboard`,
        sources: ['https://www.inngest.com/docs/local-development', 'https://www.inngest.com/docs/quick-start']
      };
    }
    
    // 6. Vercel Deployment
    if ((normalizedQuery.includes('deploy') && (normalizedQuery.includes('vercel') || normalizedQuery.includes('production') || normalizedQuery.includes('deployment'))) ||
        (normalizedQuery.includes('vercel') && normalizedQuery.includes('inngest'))) {
      return {
        response: `🚀 **Deploy to Vercel:**

**1. Set environment variables in Vercel:**
\`\`\`
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key
\`\`\`

**2. Deploy normally:**
\`\`\`bash
vercel deploy
\`\`\`

**3. Register your deployed endpoint:**
Visit Inngest dashboard → Apps → Add your deployed URL:
\`https://your-app.vercel.app/api/inngest\`

**4. Test with production events**
Your functions will now handle production events automatically!`,
        sources: ['https://www.inngest.com/docs/deploy/vercel', 'https://www.inngest.com/docs/apps/cloud']
      };
    }
    
    // Basic greetings and test queries (original behavior)
    return {
      response: `👋 Hi there! I'm the Inngest documentation assistant.

Ask me specific questions about:
• Functions and workflows
• Event handling and triggers  
• Deployment and scaling
• SDK usage and examples

📖 **Browse the full docs:** https://www.inngest.com/docs
💬 **Join the community:** https://discord.gg/inngest`,
      sources: ['https://www.inngest.com/docs', 'https://discord.gg/inngest']
    };
  }

  private async processRAGQuery(event: RAGQueryEvent): Promise<void> {
    try {
      // 🤖 USE AI TO CLASSIFY QUERY (cheap classification call)
      console.log(`🔍 Classifying query: ${event.id.substring(0, 8)}...`);
      const queryType = await classifyQuery(event.message);
      
      if (queryType === 'generic') {
        console.log(`🔄 Generic query detected: ${event.id.substring(0, 8)}... (skipping expensive AI)`);
        
        const { response, sources } = this.getGenericResponse(event.message);
        
        const quickResponse: RAGResponseEvent = {
          id: event.id,
          userId: event.userId,
          channelId: event.channelId,
          response: response,
          sources: sources,
          success: true,
          timestamp: Date.now()
        };

        await this.redis.publish('rag:response', JSON.stringify(quickResponse));
        console.log(`⚡ Quick response sent: ${event.id.substring(0, 8)}...`);
        return;
      }

      // 💾 CHECK FOR COMMON TECHNICAL QUESTIONS (free cached responses)
      const cachedResponse = this.checkForCachedResponse(event.message);
      if (cachedResponse) {
        console.log(`💰 Cached response found: ${event.id.substring(0, 8)}... (saving AI costs!)`);
        
        const quickResponse: RAGResponseEvent = {
          id: event.id,
          userId: event.userId,
          channelId: event.channelId,
          response: cachedResponse.response,
          sources: cachedResponse.sources,
          success: true,
          timestamp: Date.now()
        };

        await this.redis.publish('rag:response', JSON.stringify(quickResponse));
        console.log(`⚡ Cached response sent: ${event.id.substring(0, 8)}... ($$$ saved)`);
        return;
      }

      // 🎯 USE EXPENSIVE AI FOR UNIQUE TECHNICAL QUESTIONS
      console.log(`🧠 Technical query - full AI processing: ${event.id.substring(0, 8)}...`);
      const { completion, sources } = await generateRAGResponse(
        event.message, 
        event.domain || 'inngest'
      );

      // Convert streaming response to text
      let fullResponse = '';
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
      }

      // Send AI response
      const response: RAGResponseEvent = {
        id: event.id,
        userId: event.userId,
        channelId: event.channelId,
        response: fullResponse,
        sources: sources,
        success: true,
        timestamp: Date.now()
      };

      await this.redis.publish('rag:response', JSON.stringify(response));
      console.log(`✅ AI response completed: ${event.id.substring(0, 8)}...`);

    } catch (error) {
      console.error(`❌ Failed to process query: ${event.id}`, error);

      // Send error response
      const errorResponse: RAGResponseEvent = {
        id: event.id,
        userId: event.userId,
        channelId: event.channelId,
        response: 'I encountered an error processing your request. Please try again.',
        sources: [],
        success: false,
        timestamp: Date.now()
      };

      await this.redis.publish('rag:response', JSON.stringify(errorResponse));
    }
  }

  /**
   * Check if query matches any cached common technical questions
   */
  private checkForCachedResponse(query: string): { response: string; sources: string[] } | null {
    const normalizedQuery = query.toLowerCase();
    
    // 1. Function Not Triggering
    if ((normalizedQuery.includes('function') && (normalizedQuery.includes('not') || normalizedQuery.includes('wont') || normalizedQuery.includes("won't") || normalizedQuery.includes('trigger'))) ||
        (normalizedQuery.includes('missing') && normalizedQuery.includes('serve')) ||
        normalizedQuery.includes('endpoint not found')) {
      return {
        response: `🔧 **Function Not Triggering? Common Fix:**

**Missing \`serve\` export in \`/api/inngest\`:**
\`\`\`typescript
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { myFunction } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [myFunction] // ← Add your function here!
});
\`\`\`

**Check endpoint works:** Visit \`http://localhost:3000/api/inngest\`
Should return: \`{"message": "Inngest endpoint configured correctly"}\``,
        sources: ['https://www.inngest.com/docs/reference/functions/create', 'https://www.inngest.com/docs/quick-start']
      };
    }
    
    // 2. Error Handling & Retries
    if ((normalizedQuery.includes('error') && (normalizedQuery.includes('handling') || normalizedQuery.includes('retry') || normalizedQuery.includes('retries'))) ||
        normalizedQuery.includes('nonretriableerror') ||
        (normalizedQuery.includes('automatic') && normalizedQuery.includes('retry'))) {
      return {
        response: `⚠️ **Error Handling & Retries:**

**Automatic retries (default: 4 attempts):**
\`\`\`typescript
export const myFunction = inngest.createFunction(
  { id: "my-function", retries: 3 }, // Custom retry count
  { event: "my/event" },
  async ({ event, step }) => {
    // This will retry automatically on failure
    return await step.run("api-call", async () => {
      return await externalAPI.call();
    });
  }
);
\`\`\`

**Stop retries with NonRetriableError:**
\`\`\`typescript
import { NonRetriableError } from "inngest";

throw new NonRetriableError("User not found - don't retry");
\`\`\``,
        sources: ['https://www.inngest.com/docs/learn/inngest-functions', 'https://www.inngest.com/docs/reference/functions/create']
      };
    }
    
    // 3. Steps & Timeouts
    if ((normalizedQuery.includes('step') && (normalizedQuery.includes('timeout') || normalizedQuery.includes('time') || normalizedQuery.includes('times out'))) ||
        (normalizedQuery.includes('function') && normalizedQuery.includes('timeout'))) {
      return {
        response: `⏱️ **Steps Prevent Timeouts:**

**Break long functions into steps:**
\`\`\`typescript
export const longProcess = inngest.createFunction(
  { id: "long-process" },
  { event: "process/start" },
  async ({ event, step }) => {
    // Each step gets fresh 5min timeout
    const data = await step.run("fetch-data", async () => {
      return await heavyDataFetch(); // Won't timeout step
    });
    
    const processed = await step.run("process-data", async () => {
      return await processData(data); // Fresh timeout here
    });
    
    return await step.run("save-result", async () => {
      return await saveResult(processed);
    });
  }
);
\`\`\`

**Benefits**: Each step gets full timeout, automatic checkpointing`,
        sources: ['https://www.inngest.com/docs/learn/inngest-functions']
      };
    }
    
    // 4. Rate Limiting
    if ((normalizedQuery.includes('rate') && (normalizedQuery.includes('limit') || normalizedQuery.includes('limiting') || normalizedQuery.includes('throttle'))) ||
        normalizedQuery.includes('concurrency')) {
      return {
        response: `🚦 **Rate Limiting in Inngest:**

**Built-in concurrency control:**
\`\`\`typescript
export const rateLimitedFunction = inngest.createFunction(
  { 
    id: "api-calls",
    concurrency: {
      limit: 5 // Max 5 concurrent executions
    }
  },
  { event: "api.call" },
  async ({ event, step }) => {
    // Only 5 of these will run simultaneously
    return await step.run("api-call", async () => {
      return await externalApiCall(event.data);
    });
  }
);
\`\`\`

**Custom rate limiting with steps:**
\`\`\`typescript
await step.sleep("rate-limit", { seconds: 1 }); // 1 second delay
\`\`\``,
        sources: ['https://www.inngest.com/docs/reference/functions/create']
      };
    }
    
    // 5. Local Development Setup
    if ((normalizedQuery.includes('local') && (normalizedQuery.includes('development') || normalizedQuery.includes('dev') || normalizedQuery.includes('setup'))) ||
        (normalizedQuery.includes('set up') && normalizedQuery.includes('inngest')) ||
        normalizedQuery.includes('inngest-cli')) {
      return {
        response: `🛠️ **Local Development Setup:**

**1. Install Inngest CLI:**
\`\`\`bash
npm install -g inngest-cli
\`\`\`

**2. Start your Next.js app:**
\`\`\`bash
npm run dev  # Your app on localhost:3000
\`\`\`

**3. Start Inngest Dev Server:**
\`\`\`bash
npx inngest-cli@latest dev
# Opens dashboard at http://localhost:8288
\`\`\`

**4. Test your setup:**
- Visit \`http://localhost:3000/api/inngest\` (should show functions)
- Visit \`http://localhost:8288\` (Inngest dashboard)
- Send test events from the dashboard`,
        sources: ['https://www.inngest.com/docs/local-development', 'https://www.inngest.com/docs/quick-start']
      };
    }
    
    // 6. Vercel Deployment
    if ((normalizedQuery.includes('deploy') && (normalizedQuery.includes('vercel') || normalizedQuery.includes('production') || normalizedQuery.includes('deployment'))) ||
        (normalizedQuery.includes('vercel') && normalizedQuery.includes('inngest'))) {
      return {
        response: `🚀 **Deploy to Vercel:**

**1. Set environment variables in Vercel:**
\`\`\`
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key
\`\`\`

**2. Deploy normally:**
\`\`\`bash
vercel deploy
\`\`\`

**3. Register your deployed endpoint:**
Visit Inngest dashboard → Apps → Add your deployed URL:
\`https://your-app.vercel.app/api/inngest\`

**4. Test with production events**
Your functions will now handle production events automatically!`,
        sources: ['https://www.inngest.com/docs/deploy/vercel']
      };
    }
    
    return null; // No cached response found
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping RAG worker...');
    this.isRunning = false;

    await this.subscriber.unsubscribe();
    await this.subscriber.disconnect();
    await this.redis.disconnect();

    console.log('✅ RAG worker stopped');
    process.exit(0);
  }
} 