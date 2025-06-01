# Inngest Expert RAG System

> 🚀 **Dual-Mode AI Developer Success Engineer for Inngest**  
> Complete RAG system with **web interface** and **external integration** capabilities. Provides expert-level Inngest guidance through both direct chat and Redis-based worker for Discord bots, Slack apps, and other external platforms.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-green)](https://pinecone.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
[![Redis](https://img.shields.io/badge/Redis-Message_Queue-red)](https://redis.io/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)]()

## 🎯 Dual Architecture Overview

This system provides **two powerful ways** to access expert Inngest knowledge:

### 🌐 **Mode 1: Web Chat Interface**
- **Direct Access**: Beautiful web UI for interactive Inngest guidance  
- **Real-time Streaming**: Live GPT-4 responses with academic citations
- **Document Upload**: Add custom knowledge bases via web interface
- **Perfect for**: Direct development, documentation, team training

### 🤖 **Mode 2: RAG Worker (External Integrations)**
- **Redis-Based**: Message queue worker for external platform integration
- **Discord Ready**: Powers Discord bots with same expert knowledge
- **API-First**: JSON event-driven architecture for any platform
- **Perfect for**: Discord bots, Slack apps, CLI tools, external systems

## ✨ Core Features

### 🧠 AI-Powered Expertise
- **RAG Architecture**: Retrieval-Augmented Generation with Pinecone vector database
- **Inngest Knowledge**: Trained on official Inngest documentation (1M+ characters, 1,444+ chunks)
- **Expert-Level Responses**: Production-ready guidance with concrete configurations
- **Academic Citations**: Clean numbered citations with clickable references

### 💬 Web Interface Features
- **Streaming Responses**: Real-time GPT-4 responses with live typing
- **Modern UI**: Shadcn/UI components with professional styling
- **Syntax Highlighting**: Code blocks with copy functionality
- **Mobile Responsive**: Works perfectly on all devices
- **Example Questions**: Quick-start prompts for common scenarios

### 🔧 RAG Worker Features  
- **Redis Integration**: Pub/Sub message queue for external systems
- **Event-Driven**: JSON-based query/response architecture
- **Error Handling**: Comprehensive error responses with fallbacks
- **Multi-Domain**: Support for different knowledge domains
- **Production Ready**: Graceful shutdown, logging, monitoring

## 🏗️ Architecture

### System Components
```
🌐 Web Interface (Mode 1)          🤖 External Integrations (Mode 2)
┌─────────────────────┐           ┌─────────────────────┐
│  Next.js Web App    │           │   Discord Bot       │
│  ├── Chat UI        │           │   ├── Discord API   │
│  ├── Upload UI      │           │   └── Redis Client  │
│  └── API Routes     │           └─────────────────────┘
└─────────────────────┘                      │
           │                                 │
           ▼                                 ▼
┌─────────────────────────────────────────────────────────┐
│                 Core RAG Engine                         │
│  ├── src/lib/ai.ts          # Shared RAG pipeline       │
│  ├── src/lib/ragWorker.ts   # Redis worker             │
│  ├── Pinecone Vector DB     # Knowledge storage        │
│  └── OpenAI GPT-4          # Response generation       │
└─────────────────────────────────────────────────────────┘
```

### Dual Access Patterns
```
Mode 1: Direct Web Access
User → Web UI → API Route → RAG Engine → Streaming Response

Mode 2: External Integration  
Discord User → Discord Bot → Redis → RAG Worker → Redis → Discord Bot
```

### File Structure
```
src/
├── lib/
│   ├── ai.ts              # Core RAG pipeline (shared)
│   ├── ragWorker.ts       # Redis worker for external integrations
│   ├── docs.ts            # Document ingestion and chunking
│   ├── config.ts          # Domain configurations
│   └── utils.ts           # Utility functions
├── app/api/
│   ├── chat/route.ts      # Web interface streaming API
│   └── ingest/route.ts    # Document upload API
├── components/
│   ├── chat-interface.tsx # Web chat UI (includes upload functionality)
│   ├── message-bubble.tsx # Message display component
│   ├── markdown-renderer.tsx # Markdown rendering with syntax highlighting
│   └── ui/                # Shadcn UI components
└── scripts/
    ├── rag-worker.ts      # RAG worker startup script
    ├── ingest-docs.ts     # Bulk documentation ingestion
    ├── check-docs-freshness.ts # Documentation monitoring
    ├── test-common-responses.ts # Response quality testing
    └── git-workflow.sh    # GitFlow workflow helper
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API account
- Pinecone account
- Redis server (for RAG worker mode)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd inngest-document-app
npm install
```

### 2. Environment Setup
Create `.env` file:
```bash
# Core RAG Configuration
OPENAI_API_KEY=sk-...                    # OpenAI API key
PINECONE_API_KEY=...                     # Pinecone API key  
PINECONE_INDEX_NAME=tech-docs            # Pinecone index name

# RAG Worker Configuration (optional)
REDIS_URL=redis://localhost:6379         # Redis server for worker mode
```

### 3. Setup Knowledge Base
```bash
# Start web interface and upload docs
npm run dev
# Visit http://localhost:3000 → Upload tab → Ingest documentation
```

## 🌐 Mode 1: Web Interface

### Start Web Interface
```bash
npm run dev
# Visit http://localhost:3000
```

### Features
- **Real-time Chat**: Ask Inngest questions with streaming responses
- **Document Upload**: Add custom knowledge via integrated web UI
- **Academic Citations**: Numbered references with clickable links
- **Code Highlighting**: Professional syntax highlighting with copy buttons

### Example Questions
```
🔧 "My Inngest function isn't triggering. How do I debug this?"
⚡ "How do I implement error handling and retries in Inngest?"
🔄 "How do I break my function into steps to avoid timeouts?"
🚀 "What's the best way to rate limit my Inngest functions?"
```

## 🤖 Mode 2: RAG Worker (External Integrations)

### Setup Redis Infrastructure
```bash
# Option 1: Docker (Recommended)
docker run -d --name inngest-redis -p 6379:6379 redis:7-alpine

# Option 2: Local installation
brew install redis
redis-server
```

### Start RAG Worker
```bash
npm run rag-worker
```

Expected output:
```
✅ All environment variables loaded
✅ Redis connected  
🤖 RAG worker started, listening for queries...
```

### Integration Event Schema

#### Query Event (Send to `rag:query` channel)
```typescript
interface RAGQueryEvent {
  id: string;           // UUID for tracking
  userId: string;       // User identifier (Discord ID, etc.)
  channelId: string;    // Channel identifier
  message: string;      // User question
  domain: string;       // Knowledge domain (default: 'inngest')
  timestamp: number;    // Unix timestamp
}
```

#### Response Event (Received from `rag:response` channel)
```typescript
interface RAGResponseEvent {
  id: string;           // Same as query ID
  userId: string;       // Same as query
  channelId: string;    // Same as query
  response: string;     // AI response text
  sources: string[];    // Source URLs/references
  success: boolean;     // Process success flag
  timestamp: number;    // Response timestamp
}
```

### Testing RAG Worker
```bash
# Send test query
docker exec inngest-redis redis-cli PUBLISH rag:query '{"id":"test-123","userId":"test-user","channelId":"test-channel","message":"How does Inngest work?","domain":"inngest","timestamp":1234567890}'

# Listen for response  
docker exec inngest-redis redis-cli SUBSCRIBE rag:response
```

### Discord Bot Integration
The RAG worker is designed to work with Discord bots built in **separate repositories**:

```bash
# In your Discord bot repository
npm install ioredis discord.js

# Connect to same Redis instance
# Send queries to rag:query channel  
# Listen for responses on rag:response channel
```

See the [Discord Bot Integration Guide](./docs/DISCORD_INTEGRATION.md) for complete setup instructions.

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start web interface (Mode 1)
npm run rag-worker   # Start RAG worker (Mode 2) 
npm run build        # Production build
npm run lint         # ESLint checking
npm run ingest       # Bulk documentation ingestion
npm run check-docs   # Check documentation freshness
npm run test-responses # Test response quality
npm run workflow     # GitFlow workflow helper
```

### Development Workflow

#### For Web Interface Development
```bash
npm run dev
# Develop web UI, test chat functionality
```

#### For External Integration Development  
```bash
# Terminal 1: Start Redis
docker start inngest-redis

# Terminal 2: Start RAG Worker
npm run rag-worker

# Terminal 3: Develop external integration
# (Discord bot, CLI tool, etc.)
```

### Environment Variables
```bash
# Required for both modes
OPENAI_API_KEY=sk-...                    # OpenAI API key
PINECONE_API_KEY=...                     # Pinecone API key  
PINECONE_INDEX_NAME=tech-docs            # Pinecone index name

# Required for RAG Worker mode only
REDIS_URL=redis://localhost:6379         # Redis connection string

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Web interface URL
```

## 🚀 Deployment

### Web Interface Deployment
```bash
# Deploy to Vercel (recommended for web interface)
npx vercel --prod

# Set environment variables in Vercel dashboard:
# - OPENAI_API_KEY
# - PINECONE_API_KEY  
# - PINECONE_INDEX_NAME
```

### RAG Worker Deployment
```bash
# Deploy worker as separate service (Docker recommended)
docker build -t inngest-rag-worker .
docker run -d -e OPENAI_API_KEY=... -e PINECONE_API_KEY=... -e REDIS_URL=... inngest-rag-worker

# Or use cloud platforms:
# - Railway: Deploy worker as separate service
# - Render: Background worker deployment
# - DigitalOcean: Container deployment
```

### Redis Infrastructure
- **Development**: Docker container (`redis:7-alpine`)
- **Production**: Redis Cloud, AWS ElastiCache, or DigitalOcean Redis

## 📚 Documentation

### 📖 Comprehensive Guides
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Deep dive into dual-mode system design
- **[Discord Integration Guide](./docs/DISCORD_INTEGRATION.md)** - Complete Discord bot implementation
- **[API Reference](./README.md#-integration-event-schema)** - Event schemas and interfaces

### 🔧 Technical Details
- **[RAG Pipeline](./docs/ARCHITECTURE.md#-data-flow-patterns)** - How AI processing works
- **[Scaling Guide](./docs/ARCHITECTURE.md#-scaling-considerations)** - Production scaling patterns
- **[Security Guide](./docs/ARCHITECTURE.md#-security-considerations)** - Security best practices

### 🚀 Quick Start Guides
- **[Web Interface Setup](./README.md#-mode-1-web-interface)** - Get web UI running
- **[RAG Worker Setup](./README.md#-mode-2-rag-worker-external-integrations)** - External integration setup
- **[Redis Setup](./README.md#setup-redis-infrastructure)** - Infrastructure configuration

## 📊 Performance & Costs

### Knowledge Base Metrics
- **Coverage**: 95% of major Inngest documentation sections
- **Chunks**: 1,444 knowledge chunks  
- **Response Time**: <2 seconds for complex queries
- **Relevance**: 0.4 threshold for optimal accuracy

### Cost Estimates
- **Initial Setup**: ~$2-5 for documentation ingestion (one-time)
- **Web Interface**: ~$0.10-0.50/day for typical development use
- **RAG Worker**: ~$0.01-0.03 per external query
- **Redis**: Free tier sufficient for development, ~$15-50/month production

## 🎯 Use Cases

### Web Interface (Mode 1)
- ✅ **Developer Documentation**: Interactive Inngest guidance
- ✅ **Team Training**: Onboarding new developers
- ✅ **Custom Knowledge**: Upload team-specific documentation
- ✅ **Research & Learning**: Academic-style citations and references

### RAG Worker (Mode 2)  
- ✅ **Discord Bots**: Community support automation
- ✅ **Slack Apps**: Internal team knowledge sharing
- ✅ **CLI Tools**: Command-line Inngest assistance
- ✅ **API Integrations**: Embed in existing developer tools
- ✅ **Documentation Sites**: Real-time help widgets
- ✅ **VS Code Extensions**: IDE-integrated assistance

## 🔮 Roadmap

### Phase 1-3 (Complete) ✅
- [x] Core RAG infrastructure with Pinecone
- [x] Web interface with streaming chat
- [x] Document upload and multi-domain support
- [x] Redis-based RAG worker for external integrations
- [x] Production-ready error handling and monitoring

### Phase 4 (Current)
- [ ] Discord bot reference implementation
- [ ] Enhanced Redis worker monitoring
- [ ] Worker auto-scaling documentation
- [ ] Multi-language SDK examples

### Phase 5 (Future)
- [ ] Conversation history persistence  
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Plugin system for custom integrations

## 🔧 Troubleshooting

### Common Issues

#### "OpenAI API Error"
- Check your API key is correct and has credits
- Verify billing is set up in OpenAI dashboard
- Ensure you have access to GPT-4 (may require usage history)

#### "Pinecone Connection Failed"
- Verify your Pinecone API key and index name
- Check index dimensions are set to 1536
- Ensure index uses cosine metric

#### "No Knowledge Base Found"
- Run the ingestion process via the upload interface
- Check that documents were successfully stored in Pinecone
- Verify namespace `inngest-docs` exists in your index

#### "Build Errors"
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inngest Team** for comprehensive documentation and LLM-optimized content
- **Pinecone** for powerful vector database infrastructure
- **OpenAI** for GPT-4 and embedding models
- **Vercel** for Next.js framework and deployment platform

---

**Built with ❤️ for the Inngest Developer Community**
