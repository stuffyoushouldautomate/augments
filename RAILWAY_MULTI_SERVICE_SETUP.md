# Railway Multi-Service Environment Setup Guide

## 🚀 Complete Augments Stack Deployment

This guide sets up all Augments services on Railway with proper networking and environment variables.

## 📦 Services Deployed

1. **augments-ui** - Web interface (port 3000)
2. **augments-agent** - AI agent service (port 9991)
3. **augments-desktop** - Desktop automation (port 9990)
4. **augments-llm-proxy** - LLM API proxy (port 4000)
5. **postgres** - PostgreSQL database

## 🔧 Environment Variables Setup

### For augments-ui Service:
```
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=*
AUGMENTS_AGENT_BASE_URL=https://augments-agent-production.up.railway.app
AUGMENTS_DESKTOP_BASE_URL=https://augments-desktop-production.up.railway.app
AUGMENTS_DESKTOP_VNC_URL=https://augments-desktop-production.up.railway.app/websockify
AUGMENTS_LLM_PROXY_URL=https://augments-llm-proxy-production.up.railway.app
```

### For augments-agent Service:
```
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=${{Postgres.DATABASE_URL}}
AUGMENTS_DESKTOP_BASE_URL=https://augments-desktop-production.up.railway.app
AUGMENTS_LLM_PROXY_URL=https://augments-llm-proxy-production.up.railway.app
JWT_SECRET=your_secure_jwt_secret_change_in_production
NODE_OPTIONS=--max-old-space-size=1024
```

### For augments-desktop Service:
```
NODE_ENV=production
LOG_LEVEL=info
DISPLAY=:0
```

### For augments-llm-proxy Service:
```
NODE_ENV=production
LOG_LEVEL=info
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### For postgres Service:
```
POSTGRES_DB=augmentsdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password_change_in_production
```

## 🚀 Deployment Steps

1. **Connect to Railway**:
   ```bash
   railway login
   railway link
   ```

2. **Deploy All Services**:
   ```bash
   railway up
   ```

3. **Set Environment Variables**:
   - Go to Railway dashboard
   - For each service, add the variables listed above
   - Use your actual API keys for the LLM proxy service

4. **Access Your Application**:
   - Main UI: `https://augments-ui-production.up.railway.app`
   - Agent API: `https://augments-agent-production.up.railway.app`
   - Desktop VNC: `https://augments-desktop-production.up.railway.app`
   - LLM Proxy: `https://augments-llm-proxy-production.up.railway.app`

## 🔗 Service Communication

The services communicate as follows:
- **UI** → **Agent** (for task management)
- **UI** → **Desktop** (for VNC connection)
- **Agent** → **LLM Proxy** (for AI requests)
- **Agent** → **PostgreSQL** (for data storage)
- **Desktop** → **Agent** (for computer control)

## 🎯 Expected Results

After deployment, you'll have:
- ✅ Complete Augments application stack
- ✅ All services properly networked
- ✅ PostgreSQL database for persistence
- ✅ LLM API access through proxy
- ✅ Desktop automation capabilities
- ✅ Web interface for user interaction

## 🔧 Troubleshooting

- **Service not starting**: Check logs in Railway dashboard
- **Database connection issues**: Verify DATABASE_URL is set correctly
- **API key errors**: Ensure LLM proxy has valid API keys
- **Service communication issues**: Check service URLs are correct
