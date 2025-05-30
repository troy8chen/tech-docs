# Discord Bot Integration Guide

> 🤖 **Complete guide for integrating Discord bots with the Inngest RAG Worker**  
> Build Discord bots that provide expert Inngest knowledge using the shared Redis-based RAG infrastructure.

## 🎯 Architecture Overview

```
Discord User → Discord Bot → Redis → RAG Worker → Redis → Discord Bot → Discord User
                (your repo)          (inngest-document-app)
```

### Repository Structure
- **`inngest-document-app`** - RAG Worker (this repository)
- **`discord-rag-bot`** - Discord Bot (separate repository)
- **Redis** - Message queue (shared infrastructure)

## 🏗️ Prerequisites

### 1. RAG Worker Setup (inngest-document-app)
Ensure the RAG worker is running:
```bash
# In inngest-document-app directory
npm run rag-worker
```

Expected output:
```
✅ All environment variables loaded
✅ Redis connected  
🤖 RAG worker started, listening for queries...
```

### 2. Redis Infrastructure
```bash
# Start Redis container
docker run -d --name inngest-redis -p 6379:6379 redis:7-alpine

# Verify Redis is running
docker ps | grep redis
```

### 3. Discord Bot Setup
- Discord Developer Portal account
- Bot token and permissions
- Node.js 18+ environment

## 🤖 Discord Bot Implementation

### Package Dependencies
```json
{
  "dependencies": {
    "discord.js": "^14.14.1",
    "ioredis": "^5.6.1",
    "uuid": "^9.0.1",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.7",
    "typescript": "^5.0.0",
    "tsx": "^4.19.4"
  }
}
```

### Environment Variables (.env)
```bash
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here

# Redis Configuration (same as RAG worker)
REDIS_URL=redis://localhost:6379

# Optional: Customize behavior
RESPONSE_TIMEOUT=30000                    # 30 seconds
MAX_MESSAGE_LENGTH=2000                   # Discord limit
```

### Core Bot Implementation

#### `src/bot.ts`
```typescript
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { RAGClient } from './rag-client';
import { config } from 'dotenv';

config();

class DiscordBot {
  private client: Client;
  private ragClient: RAGClient;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.ragClient = new RAGClient();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      console.log(`✅ Discord bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      await this.handleMessage(message);
    });

    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  private async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages and messages not mentioning the bot
    if (message.author.bot) return;
    if (!message.mentions.has(this.client.user!)) return;

    // Extract question (remove bot mention)
    const question = message.content
      .replace(/<@!?\d+>/g, '')
      .trim();

    if (!question) {
      await message.reply('Hi! Ask me anything about Inngest implementation, troubleshooting, or best practices.');
      return;
    }

    // Show typing indicator
    await message.channel.sendTyping();

    try {
      // Send query to RAG worker
      const response = await this.ragClient.query({
        id: `discord-${Date.now()}`,
        userId: message.author.id,
        channelId: message.channel.id,
        message: question,
        domain: 'inngest',
        timestamp: Date.now(),
      });

      if (response.success) {
        // Split long responses for Discord's 2000 character limit
        const messages = this.splitMessage(response.response);
        
        for (const [index, msgContent] of messages.entries()) {
          if (index === 0) {
            await message.reply(msgContent);
          } else {
            await message.channel.send(msgContent);
          }
        }

        // Add sources if available
        if (response.sources.length > 0) {
          const sourcesText = this.formatSources(response.sources);
          await message.channel.send(sourcesText);
        }
      } else {
        await message.reply('Sorry, I encountered an error processing your question. Please try again.');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await message.reply('I\'m having trouble connecting to my knowledge base. Please try again in a moment.');
    }
  }

  private splitMessage(content: string, maxLength: number = 1900): string[] {
    if (content.length <= maxLength) {
      return [content];
    }

    const messages: string[] = [];
    let current = '';

    const lines = content.split('\n');
    
    for (const line of lines) {
      if ((current + line + '\n').length > maxLength) {
        if (current) {
          messages.push(current.trim());
          current = '';
        }
        
        // Handle very long lines
        if (line.length > maxLength) {
          const chunks = line.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
          messages.push(...chunks);
        } else {
          current = line + '\n';
        }
      } else {
        current += line + '\n';
      }
    }

    if (current.trim()) {
      messages.push(current.trim());
    }

    return messages;
  }

  private formatSources(sources: string[]): string {
    const uniqueSources = [...new Set(sources)].slice(0, 5); // Limit to 5 sources
    const formatted = uniqueSources
      .map((source, index) => `${index + 1}. ${source}`)
      .join('\n');
    
    return `📚 **Sources:**\n${formatted}`;
  }

  async start(): Promise<void> {
    await this.ragClient.connect();
    await this.client.login(process.env.DISCORD_TOKEN);
  }

  private async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Discord bot...');
    await this.ragClient.disconnect();
    this.client.destroy();
    process.exit(0);
  }
}

// Start the bot
const bot = new DiscordBot();
bot.start().catch(console.error);
```

#### `src/rag-client.ts`
```typescript
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface RAGQueryEvent {
  id: string;
  userId: string;
  channelId: string;
  message: string;
  domain: string;
  timestamp: number;
}

export interface RAGResponseEvent {
  id: string;
  userId: string;
  channelId: string;
  response: string;
  sources: string[];
  success: boolean;
  timestamp: number;
}

export class RAGClient {
  private redis: Redis;
  private subscriber: Redis;
  private pendingQueries: Map<string, {
    resolve: (response: RAGResponseEvent) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async connect(): Promise<void> {
    try {
      await this.redis.ping();
      console.log('✅ Redis connected');

      // Subscribe to responses
      await this.subscriber.subscribe('rag:response');
      this.subscriber.on('message', this.handleResponse.bind(this));

      console.log('🎧 Listening for RAG responses...');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Clear pending queries
    for (const [id, { reject, timeout }] of this.pendingQueries) {
      clearTimeout(timeout);
      reject(new Error('Client disconnecting'));
    }
    this.pendingQueries.clear();

    await this.subscriber.unsubscribe();
    await this.subscriber.disconnect();
    await this.redis.disconnect();
    console.log('✅ Redis disconnected');
  }

  async query(queryEvent: RAGQueryEvent): Promise<RAGResponseEvent> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingQueries.delete(queryEvent.id);
        reject(new Error('Query timeout'));
      }, parseInt(process.env.RESPONSE_TIMEOUT || '30000'));

      this.pendingQueries.set(queryEvent.id, { resolve, reject, timeout });

      // Send query to RAG worker
      this.redis.publish('rag:query', JSON.stringify(queryEvent))
        .catch((error) => {
          this.pendingQueries.delete(queryEvent.id);
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private handleResponse(channel: string, message: string): void {
    if (channel !== 'rag:response') return;

    try {
      const response: RAGResponseEvent = JSON.parse(message);
      const pending = this.pendingQueries.get(response.id);

      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingQueries.delete(response.id);
        pending.resolve(response);
      }
    } catch (error) {
      console.error('❌ Error handling response:', error);
    }
  }
}
```

## 🚀 Deployment

### Development
```bash
# Terminal 1: RAG Worker (inngest-document-app)
npm run rag-worker

# Terminal 2: Discord Bot (discord-rag-bot)  
npm run dev
```

### Production

#### Option 1: Separate Services
```bash
# Deploy RAG worker
# (Railway, Render, DigitalOcean, etc.)

# Deploy Discord bot
# (Railway, Render, DigitalOcean, etc.)

# Use managed Redis
# (Redis Cloud, AWS ElastiCache, etc.)
```

#### Option 2: Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  rag-worker:
    build: ./inngest-document-app
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - PINECONE_INDEX_NAME=${PINECONE_INDEX_NAME}
    command: npm run rag-worker
    
  discord-bot:
    build: ./discord-rag-bot
    depends_on:
      - redis
      - rag-worker
    environment:
      - REDIS_URL=redis://redis:6379
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    command: npm start
```

## 🧪 Testing

### Manual Testing
```bash
# Test Redis communication
docker exec inngest-redis redis-cli PUBLISH rag:query '{"id":"test-123","userId":"test","channelId":"test","message":"How does Inngest work?","domain":"inngest","timestamp":1234567890}'

# Listen for responses
docker exec inngest-redis redis-cli SUBSCRIBE rag:response
```

### Discord Testing
1. **Invite bot to server** with message permissions
2. **Mention the bot** with a question: `@YourBot How do I create an Inngest function?`
3. **Verify response** includes expert guidance and sources

### Load Testing
```typescript
// test-load.ts
import { RAGClient } from './src/rag-client';

async function loadTest() {
  const client = new RAGClient();
  await client.connect();

  const promises = Array.from({ length: 10 }, async (_, i) => {
    return client.query({
      id: `load-test-${i}`,
      userId: 'test-user',
      channelId: 'test-channel',
      message: 'How do I implement error handling in Inngest?',
      domain: 'inngest',
      timestamp: Date.now(),
    });
  });

  const results = await Promise.allSettled(promises);
  console.log(`✅ ${results.filter(r => r.status === 'fulfilled').length}/10 queries succeeded`);
  
  await client.disconnect();
}
```

## 🔧 Advanced Features

### Rate Limiting
```typescript
class RateLimiter {
  private userLimits = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 5;
  private readonly windowMs = 60000; // 1 minute

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.userLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.userLimits.set(userId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (userLimit.count >= this.maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  }
}
```

### Conversation Context
```typescript
class ConversationManager {
  private contexts = new Map<string, string[]>();
  private readonly maxHistory = 3;

  addMessage(channelId: string, message: string): void {
    const history = this.contexts.get(channelId) || [];
    history.push(message);
    
    if (history.length > this.maxHistory) {
      history.shift();
    }
    
    this.contexts.set(channelId, history);
  }

  getContext(channelId: string): string {
    const history = this.contexts.get(channelId) || [];
    return history.join('\n---\n');
  }
}
```

### Admin Commands
```typescript
// Add to bot.ts handleMessage method
if (message.content.startsWith('!admin') && this.isAdmin(message.author.id)) {
  const command = message.content.split(' ')[1];
  
  switch (command) {
    case 'stats':
      const stats = await this.ragClient.getStats();
      await message.reply(`📊 **Stats:**\nQueries: ${stats.totalQueries}\nActive: ${stats.activeConnections}`);
      break;
      
    case 'health':
      const health = await this.ragClient.healthCheck();
      await message.reply(`🏥 **Health:** ${health.status}`);
      break;
  }
}
```

## 🔍 Monitoring & Logging

### Structured Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'discord-bot.log' }),
    new winston.transports.Console()
  ],
});

// Usage
logger.info('Query processed', {
  userId: message.author.id,
  query: question,
  responseTime: Date.now() - startTime,
  success: true
});
```

### Health Checks
```typescript
// health.ts
export class HealthChecker {
  async check(): Promise<{ status: string; details: any }> {
    const checks = await Promise.allSettled([
      this.checkRedis(),
      this.checkRAGWorker(),
      this.checkDiscord()
    ]);

    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      details: {
        redis: checks[0].status,
        ragWorker: checks[1].status, 
        discord: checks[2].status
      }
    };
  }
}
```

## 🔗 Related Resources

- **[RAG Worker Documentation](../README.md#-mode-2-rag-worker-external-integrations)** - Core RAG system docs
- **[Discord.js Guide](https://discordjs.guide/)** - Official Discord.js documentation
- **[Redis Pub/Sub](https://redis.io/topics/pubsub)** - Redis messaging patterns
- **[Inngest Documentation](https://www.inngest.com/docs)** - Knowledge base content

## 🚨 Troubleshooting

### Common Issues

#### Bot not responding
```bash
# Check Discord permissions
# Verify bot has "Send Messages" and "Read Message History"

# Check Redis connection
docker exec inngest-redis redis-cli ping

# Check RAG worker
curl http://localhost:3000/api/health
```

#### Redis connection failures
```bash
# Verify Redis is running
docker ps | grep redis

# Check Redis logs
docker logs inngest-redis

# Test Redis connectivity
redis-cli -h localhost -p 6379 ping
```

#### Missing responses
```bash
# Check RAG worker logs
# Look for processing errors in worker terminal

# Verify event schema
# Ensure Discord bot sends correct JSON format
```

### Debug Mode
```typescript
// Enable debug logging
const client = new RAGClient({ debug: true });

// Log all Redis messages
subscriber.on('message', (channel, message) => {
  console.log(`[DEBUG] ${channel}: ${message}`);
});
```

---

**🎯 Your Discord bot is now ready to provide expert Inngest knowledge powered by the RAG worker!** 