import { config } from 'dotenv';
import { RAGWorker } from '../src/lib/ragWorker';

// Load environment variables
config();

async function startWorker() {
  // Verify required environment variables
  const requiredVars = ['PINECONE_API_KEY', 'OPENAI_API_KEY', 'PINECONE_INDEX_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  if (!process.env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not set, using default: redis://localhost:6379');
  }

  console.log('✅ All environment variables loaded');

  try {
    const worker = new RAGWorker();
    await worker.start();
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker(); 