# Railway One-Click Deploy Setup Guide

## Quick Start

This guide will help you set up a one-click Railway deployment using your own Docker images.

## Step 1: Build Docker Images

### Automatic Build (Recommended)

1. **Push to GitHub** - The workflow will automatically build images:
   ```bash
   git add .
   git commit -m "Set up Railway deployment"
   git push origin main
   ```

2. **Check GitHub Actions** - Go to your repo → Actions tab to see builds

3. **Verify Images** - Go to your repo → Packages to see built images:
   - `bytebot-agent`
   - `bytebot-desktop`
   - `bytebot-ui`

### Make Images Public

1. Go to GitHub repo → **Packages** (right sidebar)
2. Click each package → **Package settings** → **Change visibility** → **Public**

## Step 2: Create Railway Project

### Using Railway Dashboard

1. **Go to Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select your repository**

## Step 3: Add Services

### Service 1: Postgres (Database)

1. Click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-creates this - no configuration needed
3. Note the service name (usually `postgres`)

### Service 2: bytebot-desktop

1. Click **"New"** → **"Empty Service"**
2. Name: `bytebot-desktop`
3. **Settings** → **Source**:
   - Select **"Docker Image"**
   - Image: `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-desktop:latest`
   - Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username
4. **Variables** tab:
   ```
   DISPLAY=:0
   ```
5. **Deploy** tab:
   - Start Command: `/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n`

### Service 3: bytebot-agent

1. Click **"New"** → **"Empty Service"**
2. Name: `bytebot-agent`
3. **Settings** → **Source**:
   - Select **"Docker Image"**
   - Image: `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-agent:latest`
4. **Variables** tab:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop.railway.internal:9990
   PORT=9991
   ANTHROPIC_API_KEY=sk-ant-... (your key)
   ```
   - Add at least one AI API key (Anthropic, OpenAI, or Google)
5. **Deploy** tab:
   - Start Command: `npm run start:prod`

### Service 4: bytebot-ui

1. Click **"New"** → **"Empty Service"**
2. Name: `bytebot-ui`
3. **Settings** → **Source**:
   - Select **"Docker Image"**
   - Image: `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-ui:latest`
4. **Variables** tab:
   ```
   NODE_ENV=production
   BYTEBOT_AGENT_BASE_URL=http://bytebot-agent.railway.internal:9991
   BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop.railway.internal:9990/websockify
   PORT=9992
   ```
5. **Deploy** tab:
   - Start Command: `npm run start`
6. **Settings** → **Networking**:
   - Click **"Generate Domain"** to make it publicly accessible

## Step 4: Deploy

1. **Deploy all services** - Click deploy on each service
2. **Wait for startup** - Desktop takes 1-2 minutes
3. **Access UI** - Use the Railway-generated domain for bytebot-ui

## Current Railway Configuration

Based on your current Railway project, here are the settings you need:

### Environment Variables Reference

**bytebot-agent:**
- `DATABASE_URL` - Use Railway's variable reference: `${{Postgres.DATABASE_URL}}`
- `BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop.railway.internal:9990`
- `PORT=9991`
- `ANTHROPIC_API_KEY` - Your API key (you already have this set)
- `OPENAI_API_KEY` - Optional (you already have this set)

**bytebot-ui:**
- `BYTEBOT_AGENT_BASE_URL=http://bytebot-agent.railway.internal:9991`
- `BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop.railway.internal:9990/websockify`
- `NODE_ENV=production`

**bytebot-desktop:**
- `DISPLAY=:0`

## Updating Images

When you push code changes:

1. **GitHub Actions builds new images** automatically
2. **Redeploy in Railway**:
   - Go to each service
   - Click **"Redeploy"**
   - Or set up auto-deploy in service settings

## Troubleshooting

### Images Not Found
- Verify images are built: GitHub repo → Packages
- Make images public or add Railway access token
- Check image name matches exactly (case-sensitive)

### Services Can't Connect
- Verify service names match exactly: `bytebot-agent`, `bytebot-desktop`, `postgres`
- Check Railway private networking (`.railway.internal` domains)
- Verify environment variables are set correctly

### Desktop Not Starting
- Check logs: Service → Logs tab
- Desktop takes 1-2 minutes to fully start
- Verify supervisor is running

## Next Steps

- Set up custom domain for UI
- Configure authentication
- Monitor resource usage
- Set up alerts

