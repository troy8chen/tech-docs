#!/usr/bin/env tsx

/**
 * Inngest Documentation Ingestion Script
 * 
 * This script downloads and processes the Inngest documentation,
 * then uploads it to your Pinecone vector database.
 * 
 * Usage: npm run ingest
 */

import { config } from 'dotenv';
import { ingestInngestDocs } from '../src/lib/docs';

// Load environment variables
config();

async function main() {
  console.log('🚀 Starting Inngest documentation ingestion...\n');
  
  // Verify environment variables
  const requiredEnvVars = ['OPENAI_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX_NAME'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\nPlease check your .env file and try again.');
    process.exit(1);
  }
  
  try {
    const result = await ingestInngestDocs();
    
    console.log('\n✅ Ingestion completed successfully!');
    console.log(`📊 Processed ${result.chunks} chunks`);
    console.log(`⚡ Ready to answer Inngest questions!\n`);
    
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Start asking Inngest questions!\n');
    
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        console.error('\n💡 This looks like an API key issue. Please check:');
        console.error('   - Your OPENAI_API_KEY is valid and has credits');
        console.error('   - Your PINECONE_API_KEY is correct');
      } else if (error.message.includes('not found')) {
        console.error('\n💡 This looks like a Pinecone index issue. Please:');
        console.error('   - Verify your PINECONE_INDEX_NAME exists');
        console.error('   - Check your Pinecone dashboard');
      }
    }
    
    process.exit(1);
  }
}

main().catch(console.error); 