#!/usr/bin/env tsx

import { searchDocuments } from '../src/lib/ai';
import dotenv from 'dotenv';
dotenv.config();

// Test queries covering major Inngest documentation sections
const testQueries = [
  'Next.js integration',
  'Python SDK', 
  'Steps and workflows',
  'Event triggers',
  'Local development',
  'Deployment to Vercel',
  'Middleware',
  'Error handling and retries',
  'AgentKit AI',
  'Flow control and concurrency',
  'TypeScript SDK',
  'Go SDK',
  'REST API',
  'System events',
  'Cancellation',
  'Versioning',
  'Logging',
  'Rate limiting',
  'Throttling',
  'Batching'
];

async function verifyDocsCoverage() {
  console.log('🔍 Verifying Inngest Documentation Coverage\n');
  console.log('Testing if our RAG system can find content for major doc sections...\n');
  
  let foundCount = 0;
  const results: Array<{ query: string; found: boolean; score?: number }> = [];
  
  for (const query of testQueries) {
    try {
      const searchResults = await searchDocuments(query, 'inngest', 1);
      const hasResults = searchResults.length > 0 && searchResults[0].score > 0.4;
      
      if (hasResults) {
        foundCount++;
        results.push({ 
          query, 
          found: true, 
          score: searchResults[0].score 
        });
        console.log(`✅ ${query}: Found (score: ${searchResults[0].score.toFixed(3)})`);
      } else {
        results.push({ query, found: false });
        console.log(`❌ ${query}: No good results found`);
      }
    } catch (error) {
      results.push({ query, found: false });
      console.log(`❌ ${query}: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log(`\n📊 Coverage Summary:`);
  console.log(`✅ Found good content for: ${foundCount}/${testQueries.length} sections (${Math.round(foundCount/testQueries.length*100)}%)`);
  console.log(`📄 Total chunks stored: 1,444`);
  console.log(`🔗 Source: https://www.inngest.com/llms-full.txt (Official LLM-optimized docs)`);
  
  // Show some sample content to verify quality
  console.log(`\n📋 Sample search result for "create Inngest function":`);
  const sampleResults = await searchDocuments("create Inngest function", 'inngest', 1);
  if (sampleResults.length > 0) {
    console.log(`Score: ${sampleResults[0].score.toFixed(3)}`);
    console.log(`Content preview: ${sampleResults[0].content.substring(0, 200)}...`);
  }
  
  if (foundCount >= testQueries.length * 0.8) {
    console.log(`\n🎉 Excellent coverage! Our docs ingestion appears comprehensive.`);
  } else {
    console.log(`\n⚠️ Coverage could be improved. Consider checking the source URL or ingestion process.`);
  }
}

verifyDocsCoverage().catch(console.error); 