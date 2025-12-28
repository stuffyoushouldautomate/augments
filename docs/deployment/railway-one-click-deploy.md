# One-Click Railway Deploy for ByteBot

This guide explains how to set up a one-click Railway deployment using your own Docker images.

## Overview

This setup builds Docker images on your GitHub account and deploys all 4 services (Desktop, Agent, UI, and Postgres) to Railway with a single click.

## Prerequisites

1. GitHub repository (this repo)
2. Railway account
3. GitHub Container Registry access (automatic with GitHub)

## Step 1: Build Docker Images

### Automatic Build (Recommended)

The GitHub Actions workflow (`.github/workflows/docker-build.yml`) automatically builds and pushes images when you push to main/master.

**To trigger a build:**
```bash
git push origin main
```

Images will be pushed to:
- `ghcr.io/YOUR_USERNAME/bytebot-agent:latest`
- `ghcr.io/YOUR_USERNAME/bytebot-desktop:latest`
- `ghcr.io/YOUR_USERNAME/bytebot-ui:latest`

### Manual Build

You can also trigger builds manually:
1. Go to your GitHub repo → Actions
2. Select "Build and Push Docker Images"
3. Click "Run workflow"
4. Optionally specify a custom tag

## Step 2: Set Up Railway Template

### Option A: Use Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Services**:

   **Service 1: Postgres**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-create this

   **Service 2: bytebot-desktop**
   - Click "New" → "Empty Service"
   - Name: `bytebot-desktop`
   - Go to Settings → Source
   - Select "Docker Image"
   - Image: `ghcr.io/YOUR_USERNAME/bytebot-desktop:latest`
   - Make image public or add Railway's access token
   - Environment Variables:
     - `DISPLAY=:0`
   - Deploy Settings:
     - Start Command: `/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n`

   **Service 3: bytebot-agent**
   - Click "New" → "Empty Service"
   - Name: `bytebot-agent`
   - Go to Settings → Source
   - Select "Docker Image"
   - Image: `ghcr.io/YOUR_USERNAME/bytebot-agent:latest`
   - Environment Variables:
     - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (use Railway's variable reference)
     - `BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop.railway.internal:9990`
     - `PORT=9991`
     - `ANTHROPIC_API_KEY=sk-ant-...` (your API key)
     - `OPENAI_API_KEY=sk-...` (optional)
     - `GEMINI_API_KEY=...` (optional)
   - Deploy Settings:
     - Start Command: `npm run start:prod`

   **Service 4: bytebot-ui**
   - Click "New" → "Empty Service"
   - Name: `bytebot-ui`
   - Go to Settings → Source
   - Select "Docker Image"
   - Image: `ghcr.io/YOUR_USERNAME/bytebot-ui:latest`
   - Environment Variables:
     - `NODE_ENV=production`
     - `BYTEBOT_AGENT_BASE_URL=http://bytebot-agent.railway.internal:9991`
     - `BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop.railway.internal:9990/websockify`
     - `PORT=9992`
   - Deploy Settings:
     - Start Command: `npm run start`
   - **Make this service public** (Settings → Networking → Generate Domain)

### Option B: Use Railway CLI

```bash
# Install Railway CLI if not already installed
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Add Postgres
railway add postgres

# Add Desktop service
railway add --service bytebot-desktop --image ghcr.io/YOUR_USERNAME/bytebot-desktop:latest

# Add Agent service
railway add --service bytebot-agent --image ghcr.io/YOUR_USERNAME/bytebot-agent:latest

# Add UI service
railway add --service bytebot-ui --image ghcr.io/YOUR_USERNAME/bytebot-ui:latest

# Set environment variables (see below)
```

## Step 3: Configure Environment Variables

### For bytebot-agent:

```bash
railway variables set DATABASE_URL="${{Postgres.DATABASE_URL}}"
railway variables set BYTEBOT_DESKTOP_BASE_URL="http://bytebot-desktop.railway.internal:9990"
railway variables set PORT="9991"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."  # Your API key
# Optional:
railway variables set OPENAI_API_KEY="sk-..."
railway variables set GEMINI_API_KEY="..."
```

### For bytebot-ui:

```bash
railway variables set NODE_ENV="production"
railway variables set BYTEBOT_AGENT_BASE_URL="http://bytebot-agent.railway.internal:9991"
railway variables set BYTEBOT_DESKTOP_VNC_URL="http://bytebot-desktop.railway.internal:9990/websockify"
railway variables set PORT="9992"
```

### For bytebot-desktop:

```bash
railway variables set DISPLAY=":0"
```

## Step 4: Make Images Accessible

If your GitHub Container Registry images are private, you need to make them accessible to Railway:

### Option 1: Make Images Public (Easiest)

1. Go to your GitHub repo
2. Click "Packages" on the right sidebar
3. Click on each package (bytebot-agent, bytebot-desktop, bytebot-ui)
4. Go to "Package settings"
5. Change visibility to "Public"

### Option 2: Use GitHub Token

1. Create a GitHub Personal Access Token with `read:packages` permission
2. In Railway, add as environment variable:
   - Variable: `GITHUB_TOKEN`
   - Value: Your token
3. Railway will use this to pull private images

## Step 5: Deploy

Once all services are configured:

1. **Deploy all services** from Railway dashboard
2. **Wait for services to start** (Desktop takes 1-2 minutes)
3. **Access the UI** via the generated Railway domain

## Service Dependencies

```
bytebot-ui (Public)
  ├── depends on: bytebot-agent
  └── depends on: bytebot-desktop (for VNC)

bytebot-agent (Private)
  ├── depends on: postgres
  └── depends on: bytebot-desktop

bytebot-desktop (Private)
  └── standalone

postgres (Private)
  └── standalone
```

## Updating Images

When you push changes to your repository:

1. **GitHub Actions** will automatically build new images
2. **Railway** will detect new images (if using `:latest` tag)
3. **Redeploy services** manually or set up auto-deploy

To use specific versions:
- Build with tag: `ghcr.io/YOUR_USERNAME/bytebot-agent:v1.0.0`
- Update Railway service to use that tag

## Troubleshooting

### Images not found
- Verify images are built and pushed to GHCR
- Check image visibility (public or Railway has access)
- Verify image name matches exactly

### Services can't connect
- Check Railway private networking is working
- Verify service names match (case-sensitive)
- Check environment variables are set correctly

### Desktop not starting
- Desktop service takes 1-2 minutes to fully start
- Check logs for supervisor/X11 errors
- Verify privileged mode is enabled (if required)

## Next Steps

- Set up custom domain for UI
- Configure authentication
- Monitor resource usage
- Set up auto-scaling if needed

