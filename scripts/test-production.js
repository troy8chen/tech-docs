const Redis = require('ioredis');

// Test the production RAG worker
async function testProductionWorker() {
  console.log('🔍 Testing Production RAG Worker...\n');
  
  // You'll need to update this with your actual production Redis URL
  const PRODUCTION_REDIS_URL = 'redis://your-production-redis-url-here';
  
  const redis = new Redis(PRODUCTION_REDIS_URL);
  const subscriber = new Redis(PRODUCTION_REDIS_URL);
  
  try {
    // Subscribe to responses
    await subscriber.subscribe('rag:response');
    console.log('📡 Listening for responses...');
    
    // Set up response handler
    subscriber.on('message', (channel, message) => {
      if (channel === 'rag:response') {
        const response = JSON.parse(message);
        console.log('\n✅ Received response:');
        console.log(`📝 Query ID: ${response.id}`);
        console.log(`💬 Response: ${response.response.substring(0, 200)}...`);
        console.log(`📚 Sources: ${response.sources.length} found`);
        console.log(`✨ Success: ${response.success}`);
        
        process.exit(0);
      }
    });
    
    // Send test query
    const testQuery = {
      id: `prod-test-${Date.now()}`,
      userId: 'test-user',
      channelId: 'test-channel',
      message: 'How do I create an Inngest function?',
      domain: 'inngest',
      timestamp: Date.now()
    };
    
    console.log('🚀 Sending test query to production worker...');
    await redis.publish('rag:query', JSON.stringify(testQuery));
    console.log('📤 Query sent! Waiting for response...');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('❌ Test timeout - check worker logs in Render dashboard');
      process.exit(1);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check Redis URL is correct');
    console.log('2. Verify worker is running in Render dashboard');
    console.log('3. Check worker logs for errors');
    process.exit(1);
  }
}

console.log('🧪 Production RAG Worker Test');
console.log('================================');
console.log('Make sure to update PRODUCTION_REDIS_URL first!\n');

testProductionWorker(); 