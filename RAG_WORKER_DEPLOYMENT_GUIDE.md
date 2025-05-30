# 🚀 RAG Worker Deployment Guide
## Complete Production Deployment Instructions

### **🎯 When to Deploy RAG Worker**

## **Keep Local If:**
- ✅ **Personal/development use** only
- ✅ **Your computer runs 24/7** or during usage hours
- ✅ **Small team** with predictable usage patterns
- ✅ **Cost-sensitive** development phase
- ✅ **Learning and testing** the system

## **Deploy to Production If:**
- 🚀 **24/7 availability** required
- 🚀 **Multiple users** across time zones
- 🚀 **Team/community** relying on the bot
- 🚀 **Professional reliability** needed
- 🚀 **Your laptop isn't always available**
- 🚀 **Scaling beyond development**

---

## **📊 Current Architecture**

### **Current (Local RAG Worker):**.
Discord Users → Discord Bot (Railway) → Redis Cloud ← RAG Worker (Your Laptop)
↓
Pinecone + OpenAI


### **Target (Fully Deployed):**
Discord Users → Discord Bot (Railway) → Redis Cloud ← RAG Worker (Cloud)
↓
Pinecone + OpenAI


---

## **🏗️ Deployment Options**

### **Option 1: Railway (Recommended) ⭐**
**Cost:** $5-10/month
- ✅ Same platform as Discord bot (consistency)
- ✅ Simple GitHub integration
- ✅ Built-in environment management
- ✅ Automatic deployments
- ✅ Redis connectivity optimized

### **Option 2: Heroku**
**Cost:** Free tier or $7+/month
- ✅ Popular and well-documented
- ✅ Free tier available (limited hours)
- ✅ Easy scaling options
- ✅ Add-ons ecosystem

### **Option 3: Render**
**Cost:** Free tier or $7+/month
- ✅ Modern platform
- ✅ Free tier available
- ✅ Simple deployment
- ✅ Good performance

### **Option 4: DigitalOcean App Platform**
**Cost:** $5+/month
- ✅ Professional infrastructure
- ✅ Predictable pricing
- ✅ Good performance
- ✅ Easy scaling

---

## **🚀 Railway Deployment (Step-by-Step)**

### **Prerequisites**
- tech-docs repository with RAG worker code
- Railway account
- Redis Cloud URL (already configured)
- OpenAI API key
- Pinecone API key

### **Step 1: Prepare Repository**

#### **1.1 Add Railway Configuration**
Create `railway.json` in tech-docs repo root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run rag-worker",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  },
  "environments": {
    "production": {
      "startCommand": "npm run rag-worker"
    }
  }
}
```

#### **1.2 Add Railway.toml (Optional)**
Create `railway.toml` for advanced configuration:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run rag-worker"
restartPolicyType = "ON_FAILURE"

[environments.production.variables]
NODE_ENV = "production"
LOG_LEVEL = "info"
```

#### **1.3 Update package.json Scripts**
Ensure your tech-docs `package.json` has:

```json
{
  "scripts": {
    "rag-worker": "tsx scripts/rag-worker.ts",
    "discord-worker": "tsx scripts/rag-worker.ts",
    "start": "npm run rag-worker",
    "build": "tsc",
    "dev": "tsx watch scripts/rag-worker.ts"
  }
}
```

### **Step 2: Railway Setup**

#### **2.1 Connect Repository**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `tech-docs` repository
6. Select the main branch

#### **2.2 Configure Environment Variables**
In Railway dashboard, go to **Variables** tab and add:

```bash
# Redis Configuration (Required)
REDIS_URL=redis://default:your_password@redis-10923.c285.us-west-2-2.ec2.redns.redis-cloud.com:10923

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration (Required)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_pinecone_environment

# Application Configuration (Optional)
NODE_ENV=production
LOG_LEVEL=info
WORKER_CONCURRENCY=1
RESPONSE_TIMEOUT=30000
```

#### **2.3 Deploy**
1. Railway auto-detects settings from `railway.json`
2. Click **"Deploy"**
3. Wait for build to complete
4. Check deployment logs

### **Step 3: Verification**

#### **3.1 Check Deployment Logs**
In Railway dashboard:
- Go to **"Deployments"** tab
- Check recent deployment logs
- Look for:
  ```
  ✅ All environment variables loaded
  ✅ Redis connected  
  🤖 RAG worker started, listening for queries...
  ```

#### **3.2 Test End-to-End**
1. **Stop local RAG worker** (important!)
2. **Test Discord bot**: `@DocsAI test deployed worker`
3. **Expected behavior**:
   - ✅ Bot responds normally
   - ✅ Response time similar to local
   - ✅ No timeout errors

#### **3.3 Monitor Performance**
Check Railway metrics:
- CPU usage (should be low when idle)
- Memory usage (typically 100-500MB)
- Network activity (spikes during queries)

---

## **🔧 Heroku Deployment (Alternative)**

### **Step 1: Prepare Repository**

#### **1.1 Add Procfile**
Create `Procfile` in tech-docs repo root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run rag-worker",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  },
  "environments": {
    "production": {
      "startCommand": "npm run rag-worker"
    }
  }
}
```

#### **1.2 Add Railway.toml (Optional)**
Create `railway.toml` for advanced configuration:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run rag-worker"
restartPolicyType = "ON_FAILURE"

[environments.production.variables]
NODE_ENV = "production"
LOG_LEVEL = "info"
```

#### **1.3 Update package.json Scripts**
Ensure your tech-docs `package.json` has:

```json
{
  "scripts": {
    "rag-worker": "tsx scripts/rag-worker.ts",
    "discord-worker": "tsx scripts/rag-worker.ts",
    "start": "npm run rag-worker",
    "build": "tsc",
    "dev": "tsx watch scripts/rag-worker.ts"
  }
}
```

### **Step 2: Railway Setup**

#### **2.1 Connect Repository**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `tech-docs` repository
6. Select the main branch

#### **2.2 Configure Environment Variables**
In Railway dashboard, go to **Variables** tab and add:

```bash
# Redis Configuration (Required)
REDIS_URL=redis://default:your_password@redis-10923.c285.us-west-2-2.ec2.redns.redis-cloud.com:10923

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration (Required)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=your_pinecone_environment

# Application Configuration (Optional)
NODE_ENV=production
LOG_LEVEL=info
WORKER_CONCURRENCY=1
RESPONSE_TIMEOUT=30000
```

#### **2.3 Deploy**
1. Railway auto-detects settings from `railway.json`
2. Click **"Deploy"**
3. Wait for build to complete
4. Check deployment logs

### **Step 3: Verification**

#### **3.1 Check Deployment Logs**
In Railway dashboard:
- Go to **"Deployments"** tab
- Check recent deployment logs
- Look for:
  ```
  ✅ All environment variables loaded
  ✅ Redis connected  
  🤖 RAG worker started, listening for queries...
  ```

#### **3.2 Test End-to-End**
1. **Stop local RAG worker** (important!)
2. **Test Discord bot**: `@DocsAI test deployed worker`
3. **Expected behavior**:
   - ✅ Bot responds normally
   - ✅ Response time similar to local
   - ✅ No timeout errors

#### **3.3 Monitor Performance**
Check Railway metrics:
- CPU usage (should be low when idle)
- Memory usage (typically 100-500MB)
- Network activity (spikes during queries)

---

## **🔧 Heroku Deployment (Alternative)**

### **Step 1: Prepare Repository**

#### **1.1 Add Procfile**
Create `Procfile` in tech-docs repo root:

worker: npm run rag-worker


#### **1.2 Add app.json (Optional)**
```json
{
  "name": "RAG Worker",
  "description": "AI-powered document assistant worker",
  "keywords": ["rag", "ai", "worker", "redis"],
  "env": {
    "REDIS_URL": {
      "description": "Redis Cloud connection URL"
    },
    "OPENAI_API_KEY": {
      "description": "OpenAI API key"
    },
    "PINECONE_API_KEY": {
      "description": "Pinecone API key"
    }
  }
}
```

### **Step 2: Deploy to Heroku**

#### **2.1 Install Heroku CLI**
```bash
# macOS
brew install heroku/brew/heroku

# Or download from heroku.com
```

#### **2.2 Deploy Commands**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-rag-worker-app

# Set environment variables
heroku config:set REDIS_URL="redis://default:password@host:port"
heroku config:set OPENAI_API_KEY="your_key"
heroku config:set PINECONE_API_KEY="your_key"
heroku config:set PINECONE_INDEX_NAME="your_index"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Scale worker
heroku ps:scale worker=1
```

### **Step 3: Monitor**
```bash
# Check logs
heroku logs --tail

# Check status
heroku ps

# Restart if needed
heroku restart
```

---

## **⚙️ Environment Variables Reference**

### **Required Variables**
```bash
# Redis (Message Queue)
REDIS_URL=redis://default:password@host:port

# OpenAI (AI Processing)
OPENAI_API_KEY=sk-...

# Pinecone (Vector Database)
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_ENVIRONMENT=us-west1-gcp  # or your environment
```

### **Optional Variables**
```bash
# Application Settings
NODE_ENV=production
LOG_LEVEL=info
WORKER_CONCURRENCY=1

# Performance Tuning
RESPONSE_TIMEOUT=30000
MAX_RETRIES=3
QUERY_BATCH_SIZE=1

# Redis Settings (usually automatic)
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

---

## **🔍 Testing Deployment**

### **Pre-Deployment Checklist**
- [ ] All environment variables configured
- [ ] Redis Cloud connection tested
- [ ] OpenAI API key valid
- [ ] Pinecone API key and index verified
- [ ] Deployment scripts working locally

### **Post-Deployment Tests**

#### **Test 1: Basic Connection**
```bash
# Check deployment logs for:
✅ All environment variables loaded
✅ Redis connected
🤖 RAG worker started, listening for queries...
```

#### **Test 2: Discord Integration**
1. Stop local RAG worker
2. Test in Discord: `@DocsAI hello from deployed worker`
3. Expected: Normal response within 30 seconds

#### **Test 3: Performance Test**
1. Test complex query: `@DocsAI explain Inngest functions with code examples`
2. Monitor deployment logs
3. Check response time and quality

#### **Test 4: Error Handling**
1. Test invalid query: `@DocsAI xyzabc123nonsense`
2. Expected: Graceful "I don't have information" response

---

## **📊 Monitoring & Maintenance**

### **Railway Monitoring**
- **Dashboard Metrics**: CPU, Memory, Network
- **Deployment Logs**: Real-time log streaming
- **Alerts**: Set up for downtime/errors
- **Usage Analytics**: Track resource consumption

### **Health Checks**
Add health endpoint to your RAG worker:

```typescript
// In your rag-worker.ts
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    redis: 'connected',  // Check actual Redis status
    services: ['openai', 'pinecone']
  });
});

app.listen(PORT, () => {
  console.log(`Health server running on port ${PORT}`);
});
```

### **Log Monitoring**
Monitor for these log patterns:

**Healthy Logs:**
✅ Redis connected
🤖 RAG worker started
📥 Processing query: abc123...
✅ Completed query: abc123...


**Error Logs to Watch:**
❌ Redis connection failed
❌ OpenAI API error
❌ Pinecone query failed
⚠️ High memory usage


---

## **💰 Cost Analysis**

### **Railway Pricing**
Starter Plan: $5/month
512MB RAM
0.5 vCPU
$0.000463/GB-hour for usage above
Pro Plan: $20/month
8GB RAM
8 vCPU
Better for high usage



### **Monthly Cost Estimates**
Light Usage (Personal): $5-10/month
RAG Worker: $5 (Railway)
Redis Cloud: $0 (free tier)
Total: ~$5/month
Medium Usage (Team): $15-25/month
RAG Worker: $10-15 (Railway)
Redis Cloud: $5-10 (paid tier)
Total: ~$20/month
Heavy Usage (Production): $30-50/month
RAG Worker: $20-30 (upgraded plan)
Redis Cloud: $10-20 (pro tier)


---

## **🔧 Troubleshooting**

### **Common Issues**

#### **"Worker Not Responding"**
```bash
# Check deployment logs
railway logs

# Verify environment variables
railway variables

# Restart service
railway redeploy
```

#### **"Redis Connection Failed"**
```bash
# Test Redis URL format
redis-cli -u "$REDIS_URL" ping

# Check Redis Cloud status
# Verify firewall/network access
```

#### **"OpenAI API Errors"**
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check usage limits
# Verify billing status
```

#### **"High Memory Usage"**
```bash
# Check for memory leaks
# Monitor vector search batch sizes
# Consider upgrading plan
```

### **Emergency Rollback**
If deployed worker fails:

1. **Immediate**: Start local RAG worker
2. **Fix**: Debug deployment issues
3. **Redeploy**: When issues resolved

---

## **🚀 Migration Checklist**

### **From Local to Deployed**

#### **Phase 1: Preparation**
- [ ] Test local worker with Redis Cloud
- [ ] Prepare deployment configuration
- [ ] Set up monitoring

#### **Phase 2: Deploy**
- [ ] Deploy RAG worker to chosen platform
- [ ] Configure environment variables
- [ ] Verify deployment success

#### **Phase 3: Testing**
- [ ] Stop local worker
- [ ] Test Discord bot functionality
- [ ] Monitor performance for 24 hours

#### **Phase 4: Production**
- [ ] Update documentation
- [ ] Set up alerts and monitoring
- [ ] Plan scaling strategy

---

## **📚 Additional Resources**

### **Platform Documentation**
- [Railway Docs](https://docs.railway.app/)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Render Deployment Guide](https://render.com/docs)

### **Monitoring Tools**
- Railway built-in metrics
- [Heroku Logs](https://devcenter.heroku.com/articles/logging)
- [Datadog](https://www.datadoghq.com/) for advanced monitoring

### **Cost Optimization**
- Monitor actual usage patterns
- Use auto-scaling features
- Consider spot instances for batch processing

---

**🎯 This guide provides everything needed to deploy the RAG Worker when you're ready to scale from local development to production infrastructure.**

**Perfect for future reference when you want 24/7 Discord bot availability!** 🌟
