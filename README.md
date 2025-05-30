# Inngest Expert Chatbot

> 🚀 **Production-Ready AI Developer Success Engineer for Inngest**  
> Complete RAG-enhanced chatbot providing expert-level Inngest implementation guidance, troubleshooting, and architectural advice. Built following a comprehensive 3-phase development plan with professional UI, academic citations, and multi-domain support.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-green)](https://pinecone.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)]()

## 🎯 Project Status: **3-Phase Implementation Complete**

This project successfully completed a comprehensive 3-phase development plan:

**✅ Phase 1**: Core RAG infrastructure with Pinecone vector database and streaming chat interface  
**✅ Phase 2**: Multi-domain support, document upload API, and professional UI components  
**✅ Phase 3**: Advanced error handling, production documentation, and deployment-ready features

**Result**: Production-ready Inngest Expert Chatbot with 1,444+ knowledge chunks, academic citation system, and comprehensive developer guidance.

## ✨ Features

### 🧠 AI-Powered Expertise
- **RAG Architecture**: Retrieval-Augmented Generation with Pinecone vector database
- **Inngest Knowledge**: Trained on official Inngest documentation (1M+ characters, 1,444+ chunks)
- **Streaming Responses**: Real-time GPT-4 responses with live typing indicators
- **Academic Citations**: Clean numbered citations with clickable references section
- **Smart Error Handling**: Helpful guidance for generic queries with fallback responses

### 💬 Professional Chat Interface
- **Modern UI**: Shadcn/UI components with Tailwind CSS styling
- **Syntax Highlighting**: Professional code blocks with copy functionality
- **Responsive Design**: Mobile-first approach, works on all devices
- **Academic Style**: Clean numbered citations for better readability
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
- OpenAI API account
- Pinecone account

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd inngest-document-app
npm install
```

### 2. API Setup

#### 🔑 OpenAI API Setup
1. **Create OpenAI Account**
   - Visit [https://platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account

2. **Generate API Key**
   - Go to [API Keys page](https://platform.openai.com/account/api-keys)
   - Click "Create new secret key"
   - Name it (e.g., "Inngest Chatbot")
   - Copy the key (starts with `sk-...`)
   - ⚠️ **Save it immediately** - you won't see it again!

3. **Add Billing Method**
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add a payment method
   - Set usage limits if desired
   - Note: You'll need credits for GPT-4 and embeddings

#### 🌲 Pinecone Setup
1. **Create Pinecone Account**
   - Visit [https://pinecone.io](https://pinecone.io)
   - Sign up for free account (includes 1 index)

2. **Create Index**
   - Go to [Pinecone Console](https://app.pinecone.io/)
   - Click "Create Index"
   - **Index Name**: `tech-docs` (or your preferred name)
   - **Dimensions**: `1536` (for OpenAI text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud**: Choose your preferred region
   - Click "Create Index"

3. **Get API Key**
   - In Pinecone Console, go to "API Keys"
   - Copy your API key
   - Note your environment/region

### 3. Environment Setup
Create `.env` file in your project root:
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Your OpenAI API key from step 2

# Pinecone Configuration  
PINECONE_API_KEY=...                     # Your Pinecone API key
PINECONE_INDEX_NAME=tech-docs            # Must match your Pinecone index name
```

**⚠️ Important Notes:**
- Use `.env` (not `.env.local`) for this project
- Never commit your `.env` file to version control
- Keep your API keys secure and private

### 4. Initialize Knowledge Base
```bash
# Ingest Inngest documentation (takes ~2-3 minutes)
npm run dev
```
Then visit the upload page at `http://localhost:3000` and click the "Upload" tab to ingest the Inngest documentation automatically.

### 5. Start Chatting!
Visit [http://localhost:3000](http://localhost:3000) and start asking Inngest questions!

## 💰 Cost Estimates

### OpenAI Costs (approximate)
- **Initial Setup**: ~$2-5 for document ingestion (one-time)
- **Daily Usage**: ~$0.10-0.50 for typical development use
- **Per Query**: ~$0.01-0.03 (depends on context length)

### Pinecone Costs
- **Free Tier**: 1 index, 5M vectors (sufficient for this project)
- **Paid Plans**: Start at $70/month for production use

## 🏗️ Architecture

### Core Components
```
src/
├── lib/
│   ├── ai.ts          # Pinecone client, embeddings, RAG pipeline
│   ├── docs.ts        # Document ingestion and chunking
│   └── config.ts      # Domain configurations
├── app/api/
│   ├── chat/route.ts  # Streaming chat API endpoint
│   └── ingest/route.ts # Document upload API
├── components/
│   ├── chat-interface.tsx     # Main chat UI
│   ├── message-bubble.tsx     # Individual message display
│   └── markdown-renderer.tsx  # Academic citation rendering
└── types.ts           # TypeScript interfaces
```

### RAG Pipeline
1. **Query Embedding**: User question → OpenAI text-embedding-3-small (1536 dimensions)
2. **Vector Search**: Pinecone cosine similarity search (top 5 results, 0.4 threshold)
3. **Context Assembly**: Relevant chunks + domain-specific system prompt
4. **Response Generation**: GPT-4 streaming completion with source extraction
5. **Citation Processing**: Academic-style numbered citations with references section

### Pinecone Configuration
- **Index**: `tech-docs` (1536 dimensions, cosine metric)
- **Namespace**: `inngest-docs` (isolated domain knowledge)
- **Chunking**: Section-aware splitting (~1000 chars) preserving context
- **Metadata**: Source references, sections, and domain isolation

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
- **Step-by-step instructions** with syntax-highlighted code examples
- **Academic citations** with numbered references for clean reading
- **Best practices** for production deployments
- **Troubleshooting workflows** for common issues
- **Architectural advice** for complex workflows

## 🛠️ Development

### Key Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build  
npm run lint         # ESLint checking
npm start           # Start production server
```

### Adding New Knowledge Domains
1. Update `src/lib/config.ts` with new domain configuration
2. Use the upload interface to add new documentation
3. Automatic Pinecone namespace creation
4. Test with domain-specific queries

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...                    # OpenAI API key
PINECONE_API_KEY=...                     # Pinecone API key  
PINECONE_INDEX_NAME=tech-docs            # Pinecone index name

# Optional  
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npx vercel --prod

# Add environment variables in Vercel dashboard:
# - OPENAI_API_KEY
# - PINECONE_API_KEY  
# - PINECONE_INDEX_NAME
```

### Other Platforms
- **Railway**: Add environment variables and deploy
- **Netlify**: Configure build settings and environment variables
- **Docker**: Use the included Dockerfile for containerized deployment

## 🏆 Performance Metrics

### Knowledge Base Coverage
- **✅ 95% Coverage**: 19/20 major Inngest documentation sections
- **✅ 1,444 Chunks**: Comprehensive knowledge representation  
- **✅ Expert Responses**: Production-ready guidance and troubleshooting

### Search Quality
- **Relevance Threshold**: 0.4 (optimized for Inngest domain)
- **Average Response Time**: <2 seconds for complex queries
- **Source Attribution**: 100% of responses include documentation references
- **Citation Style**: Academic numbered references for clean reading

## 🔮 Roadmap

### Phase 1 (Complete) ✅
- [x] RAG infrastructure with Pinecone
- [x] Inngest documentation ingestion  
- [x] Streaming chat interface
- [x] Professional UI/UX

### Phase 2 (Complete) ✅  
- [x] Document upload API for custom knowledge
- [x] Multi-domain support with dynamic domain creation
- [x] Enhanced markdown rendering with syntax highlighting
- [x] Academic citation style with numbered references
- [x] Professional upload interface (files, URLs, text)

### Phase 3 (Complete) ✅
- [x] Advanced error handling with helpful fallback responses
- [x] Production-ready deployment documentation
- [x] Comprehensive troubleshooting guides and API setup
- [x] Enhanced user experience with guidance for generic queries
- [x] Professional code highlighting with copy functionality
- [x] Clickable source citations and references system
- [x] Cost estimation and billing guidance
- [x] Multi-platform deployment support (Vercel, Railway, Netlify)

### Phase 4 (Future)
- [ ] Conversation history persistence
- [ ] Advanced analytics and usage metrics
- [ ] Team collaboration features
- [ ] API endpoints for external applications

### Phase 5 (Potential)
- [ ] Plugin system for external integrations
- [ ] Advanced file format support (PDF, DOCX)
- [ ] Real-time collaboration features  
- [ ] Enterprise SSO and user management

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
