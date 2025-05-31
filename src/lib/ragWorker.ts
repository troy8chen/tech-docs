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
   * Returns a standard response for generic queries
   */
  private getGenericResponse(): { response: string; sources: string[] } {
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
        
        const { response, sources } = this.getGenericResponse();
        
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

      // 🎯 USE EXPENSIVE AI FOR SPECIFIC TECHNICAL QUESTIONS
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