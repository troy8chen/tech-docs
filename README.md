# Inngest Expert Chatbot

> 🚀 **AI-powered Developer Success Engineer for Inngest**  
> RAG-enhanced chatbot providing expert-level Inngest implementation guidance, troubleshooting, and architectural advice.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-green)](https://pinecone.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🧠 AI-Powered Expertise
- **RAG Architecture**: Retrieval-Augmented Generation with Pinecone vector database
- **Inngest Knowledge**: Trained on official Inngest documentation (1M+ characters, 1,444+ chunks)
- **Streaming Responses**: Real-time GPT-4 responses with live typing indicators
- **Source Citations**: Every answer includes relevant documentation sources

### 💬 Professional Chat Interface
- **Modern UI**: Shadcn/UI components with Tailwind CSS styling
- **Responsive Design**: Mobile-first approach, works on all devices
- **Copy Functionality**: One-click copy for code snippets and responses
- **Example Questions**: Quick-start prompts for common Inngest scenarios

### 🔧 Technical Excellence
- **Next.js 15**: Latest App Router with React Server Components
- **TypeScript**: Full type safety throughout the application
- **Vector Search**: Cosine similarity with 0.4 threshold for optimal relevance
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized chunking strategy (~1000 characters per chunk)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Pinecone account and API key

### 1. Clone & Install
```bash
git clone https://github.com/troy8chen/tech-docs.git
cd tech-docs
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
OPENAI_API_KEY=sk-...                    # Your OpenAI API key
PINECONE_API_KEY=...                     # Your Pinecone API key  
PINECONE_INDEX_NAME=tech-docs            # Pinecone index name
```

### 3. Initialize Knowledge Base
```bash
# Ingest Inngest documentation
npm run ingest
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start chatting!

## 🏗️ Architecture

### Core Components
```
src/
├── lib/
│   ├── ai.ts          # Pinecone client, embeddings, RAG pipeline
│   ├── docs.ts        # Document ingestion and chunking
│   └── config.ts      # Domain configurations
├── app/api/
│   └── chat/route.ts  # Streaming chat API endpoint
├── components/
│   ├── chat-interface.tsx    # Main chat UI
│   └── message-bubble.tsx    # Individual message display
└── types.ts           # TypeScript interfaces
```

### RAG Pipeline
1. **Query Embedding**: User question → OpenAI text-embedding-3-small
2. **Vector Search**: Pinecone cosine similarity search (top 5 results)
3. **Context Assembly**: Relevant chunks + system prompt
4. **Response Generation**: GPT-4 streaming completion
5. **Source Citation**: Return chunks with relevance scores

### Pinecone Configuration
- **Index**: `tech-docs` (1536 dimensions, cosine metric)
- **Namespace**: `inngest-docs` (isolated domain knowledge)
- **Chunking**: Section-aware splitting preserving context
- **Metadata**: Source references and section identifiers

## 🎯 Usage Examples

### Common Questions
```
🔧 "My Inngest function isn't triggering. How do I debug this?"
⚡ "How do I implement error handling and retries in Inngest?"
🔄 "How do I break my function into steps to avoid timeouts?"
🚀 "What's the best way to rate limit my Inngest functions?"
🏠 "How do I set up local development with Inngest?"
☁️ "How do I deploy Inngest functions to Vercel?"
```

### Response Quality
- **Expert-level guidance** matching Inngest Developer Success Engineer expertise
- **Step-by-step instructions** with code examples
- **Best practices** for production deployments
- **Troubleshooting workflows** for common issues
- **Architectural advice** for complex workflows

## 🛠️ Development

### Key Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint checking
npm run ingest       # Ingest documentation
```

### Adding New Knowledge Domains
1. Update `src/lib/config.ts` with new domain configuration
2. Add ingestion logic in `src/lib/docs.ts`
3. Create dedicated Pinecone namespace
4. Test with domain-specific queries

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=tech-docs

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏆 Performance Metrics

### Knowledge Base Coverage
- **✅ 95% Coverage**: 19/20 major Inngest documentation sections
- **✅ 1,444 Chunks**: Comprehensive knowledge representation
- **✅ Expert Responses**: Production-ready guidance and troubleshooting

### Search Quality
- **Relevance Threshold**: 0.4 (optimized for Inngest domain)
- **Average Response Time**: <2 seconds for complex queries
- **Source Attribution**: 100% of responses include documentation references

## 🔮 Roadmap

### Phase 1 (Complete) ✅
- [x] RAG infrastructure with Pinecone
- [x] Inngest documentation ingestion
- [x] Streaming chat interface
- [x] Professional UI/UX

### Phase 2 (Planned)
- [ ] Document upload API for custom knowledge
- [ ] Multi-domain support (Next.js, React docs)
- [ ] Conversation history persistence
- [ ] Admin dashboard for knowledge management

### Phase 3 (Future)
- [ ] Plugin system for external integrations
- [ ] Advanced analytics and usage metrics
- [ ] Team collaboration features
- [ ] API endpoints for external applications

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
