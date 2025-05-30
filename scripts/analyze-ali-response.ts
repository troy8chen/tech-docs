#!/usr/bin/env tsx

import { generateRAGResponse } from '../src/lib/ai';
import dotenv from 'dotenv';
dotenv.config();

async function analyzeAliResponse() {
  const aliQuestion = `I'm trying to set up Inngest with my Next.js app, but no functions show up in my dev server so I can't trigger them. I've followed the docs but something isn't working. Here's the code from my /app/api/inngest/route.ts file:

\`\`\`tsx
import { Inngest } from "inngest";
const inngest = new Inngest({ id: "billpay-app" })
export const helloWorld = inngest.createFunction(
  { name: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", { seconds: 5 });
    return { message: \`Hello \${event.data.name}!\` };
  }
);
\`\`\`

What am I doing wrong?`;

  console.log('🔍 DETAILED ANALYSIS OF ALI RESPONSE');
  console.log('====================================\n');
  
  const { completion, sources } = await generateRAGResponse(aliQuestion, 'inngest');
  
  let response = '';
  for await (const chunk of completion) {
    response += chunk.choices[0]?.delta?.content || '';
  }
  
  console.log('📋 FULL RESPONSE:');
  console.log('-'.repeat(50));
  console.log(response);
  console.log('-'.repeat(50));
  
  // Check specific elements
  const checks = {
    'mentions "serve"': response.toLowerCase().includes('serve'),
    'mentions "functions array"': response.toLowerCase().includes('functions array'),
    'mentions "export default"': response.toLowerCase().includes('export default'),
    'has serve({ code': response.includes('serve({'),
    'has client: inngest': response.includes('client: inngest'),
    'has functions: [': response.includes('functions: ['),
    'has import { serve }': response.includes('import { serve }'),
    'mentions dev server': response.toLowerCase().includes('dev server'),
    'mentions restart': response.toLowerCase().includes('restart'),
    'mentions localhost:8288': response.includes('localhost:8288'),
    'has code blocks': response.includes('```'),
    'mentions route.ts': response.toLowerCase().includes('route.ts')
  };
  
  console.log('\n🔍 ELEMENT ANALYSIS:');
  Object.entries(checks).forEach(([check, found]) => {
    console.log(`${found ? '✅' : '❌'} ${check}`);
  });
  
  console.log(`\n📊 STATISTICS:`);
  console.log(`Response length: ${response.length} characters`);
  console.log(`Code blocks: ${(response.match(/```/g) || []).length / 2}`);
  console.log(`Sources: ${sources.length}`);
  
  // The issue might be our test criteria being too strict
  console.log(`\n💡 INSIGHTS:`);
  console.log(`The response might be accurate but our test criteria might be too specific.`);
  console.log(`For example, it might say "serve function" instead of exact "serve" keyword.`);
}

analyzeAliResponse().catch(console.error); 