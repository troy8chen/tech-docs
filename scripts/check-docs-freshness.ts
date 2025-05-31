#!/usr/bin/env tsx

/**
 * Check if Inngest documentation has been updated
 * Compares current ETag with last known ETag
 */

interface DocStatus {
  url: string;
  etag: string;
  lastChecked: string;
  size: number;
}

const DOCS_URL = 'https://www.inngest.com/llms-full.txt';
const STATUS_FILE = '.docs-status.json';

async function checkDocsFreshness() {
  try {
    console.log('🔍 Checking Inngest docs freshness...');
    
    // Fetch current headers
    const response = await fetch(DOCS_URL, { method: 'HEAD' });
    const currentETag = response.headers.get('etag');
    const contentLength = response.headers.get('content-length');
    
    if (!currentETag) {
      console.warn('⚠️  No ETag found in response');
      return;
    }

    // Read previous status
    let previousStatus: DocStatus | null = null;
    try {
      const fs = await import('fs/promises');
      const statusData = await fs.readFile(STATUS_FILE, 'utf-8');
      previousStatus = JSON.parse(statusData);
    } catch {
      // File doesn't exist, first run
    }

    // Current status
    const currentStatus: DocStatus = {
      url: DOCS_URL,
      etag: currentETag,
      lastChecked: new Date().toISOString(),
      size: parseInt(contentLength || '0')
    };

    // Compare with previous
    if (previousStatus) {
      if (previousStatus.etag === currentETag) {
        console.log('✅ Documentation is up-to-date');
        console.log(`   Last checked: ${previousStatus.lastChecked}`);
        console.log(`   ETag: ${currentETag}`);
      } else {
        console.log('🆕 DOCUMENTATION HAS BEEN UPDATED!');
        console.log(`   Previous ETag: ${previousStatus.etag}`);
        console.log(`   Current ETag:  ${currentETag}`);
        console.log(`   Size change: ${previousStatus.size} → ${currentStatus.size}`);
        console.log('');
        console.log('💡 Consider re-ingesting with:');
        console.log('   curl -X POST http://localhost:3000/api/ingest -F "domain=inngest" -F "url=https://www.inngest.com/llms-full.txt"');
      }
    } else {
      console.log('📋 First check recorded');
      console.log(`   ETag: ${currentETag}`);
      console.log(`   Size: ${currentStatus.size} bytes`);
    }

    // Save current status
    const fs = await import('fs/promises');
    await fs.writeFile(STATUS_FILE, JSON.stringify(currentStatus, null, 2));

  } catch (error) {
    console.error('❌ Error checking docs freshness:', error);
  }
}

checkDocsFreshness(); 