import Redis from 'ioredis';
import { generateRAGResponse } from './ai'; // ← Your existing function!

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

  private async processRAGQuery(event: RAGQueryEvent): Promise<void> {
    try {
      // 🎯 USE YOUR EXISTING FUNCTION - NO CHANGES NEEDED!
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

      // Send success response
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
      console.log(`✅ Completed query: ${event.id.substring(0, 8)}...`);

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