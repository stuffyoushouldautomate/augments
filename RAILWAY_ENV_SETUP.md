# Railway Environment Variables Setup Guide

## Required Environment Variables for Augments Service

Copy these environment variables to your Railway augments service:

### Database Connection (Auto-populated from PostgreSQL service)
```
DATABASE_URL=postgresql://postgres:RqAYRULHLlEnqsBmyARPEAlXmXzMsWyV@postgres.railway.internal:5432/railway
POSTGRES_USER=postgres
POSTGRES_PASSWORD=RqAYRULHLlEnqsBmyARPEAlXmXzMsWyV
POSTGRES_DB=railway
POSTGRES_HOST=postgres.railway.internal
POSTGRES_PORT=5432
```

### Application Configuration
```
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=*
JWT_SECRET=your_secure_jwt_secret_change_in_production
NODE_OPTIONS=--max-old-space-size=1024
```

### Service URLs (for multi-service setup)
```
AUGMENTS_AGENT_BASE_URL=http://augments-agent:9991
AUGMENTS_DESKTOP_BASE_URL=http://augments-desktop:9990
AUGMENTS_DESKTOP_VNC_URL=http://augments-desktop:9990/websockify
AUGMENTS_UI_BASE_URL=http://augments-ui:9992
AUGMENTS_LLM_PROXY_URL=http://augments-llm-proxy:4000
```

### Required API Keys (Add at least one)
```
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## How to Add Variables in Railway:

1. Go to your Railway project dashboard
2. Click on the "augments" service
3. Go to the "Variables" tab
4. Click "Add Variable" for each environment variable above
5. Copy and paste the values exactly as shown
6. Save and redeploy

## Important Notes:

- The `DATABASE_URL` uses Railway's internal networking (`postgres.railway.internal`)
- Change the `JWT_SECRET` to a secure random string in production
- You only need to add ONE of the API keys (OpenAI or OpenRouter)
- Railway will automatically restart the service after adding variables