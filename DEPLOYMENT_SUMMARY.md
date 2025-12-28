# ByteBot Railway Deployment - Complete Setup

## What Was Created

I've set up a complete one-click Railway deployment system for ByteBot with the following components:

### 1. GitHub Actions Workflow (`.github/workflows/docker-build.yml`)

Automatically builds and pushes Docker images to GitHub Container Registry when you push code:
- **bytebot-agent** image
- **bytebot-desktop** image  
- **bytebot-ui** image

**Features:**
- Builds on push to main/master
- Supports manual workflow dispatch
- Uses GitHub Actions cache for faster builds
- Tags images with branch name, SHA, and `latest`

### 2. Railway Configuration Files

- **`railway.json`** - Basic Railway configuration
- **`railway.template.json`** - Template for multi-service deployment (reference)

### 3. Documentation

- **`RAILWAY_ONE_CLICK_SETUP.md`** - Quick start guide
- **`docs/deployment/railway-one-click-deploy.md`** - Comprehensive deployment guide

## Quick Start

### 1. Build Images

```bash
# Push to GitHub - images will build automatically
git add .
git commit -m "Set up Railway deployment"
git push origin main
```

### 2. Make Images Public

1. Go to GitHub repo → **Packages**
2. For each package (bytebot-agent, bytebot-desktop, bytebot-ui):
   - Click package → **Package settings** → **Change visibility** → **Public**

### 3. Deploy to Railway

Follow the guide in **`RAILWAY_ONE_CLICK_SETUP.md`** to:
1. Create Railway project
2. Add 4 services (Postgres, Desktop, Agent, UI)
3. Configure environment variables
4. Deploy

## Service Architecture

```
┌─────────────┐
│  bytebot-ui │ (Port 9992) - Public
└──────┬──────┘
       │
       ├──► ┌──────────────┐
       │    │bytebot-agent │ (Port 9991) - Private
       │    └──────┬───────┘
       │           │
       │           ├──► ┌──────────┐
       │           │    │ postgres │ (Port 5432) - Private
       │           │    └──────────┘
       │           │
       │           └──► ┌──────────────┐
       │                │bytebot-desktop│ (Port 9990) - Private
       └────────────────┘                └──────────────┘
```

## Image Locations

After building, images will be at:
- `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-agent:latest`
- `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-desktop:latest`
- `ghcr.io/YOUR_GITHUB_USERNAME/bytebot-ui:latest`

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username/organization.

## Environment Variables

### bytebot-agent
- `DATABASE_URL=${{Postgres.DATABASE_URL}}` (Railway variable reference)
- `BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop.railway.internal:9990`
- `PORT=9991`
- `ANTHROPIC_API_KEY` (required - at least one AI key)
- `OPENAI_API_KEY` (optional)
- `GEMINI_API_KEY` (optional)

### bytebot-ui
- `NODE_ENV=production`
- `BYTEBOT_AGENT_BASE_URL=http://bytebot-agent.railway.internal:9991`
- `BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop.railway.internal:9990/websockify`
- `PORT=9992`

### bytebot-desktop
- `DISPLAY=:0`

## Next Steps

1. **Push code to trigger image builds**
2. **Make images public** in GitHub Packages
3. **Follow `RAILWAY_ONE_CLICK_SETUP.md`** to deploy
4. **Update images** by pushing code changes (auto-builds)

## Files Created

- `.github/workflows/docker-build.yml` - Build workflow
- `railway.json` - Railway config
- `railway.template.json` - Template reference
- `RAILWAY_ONE_CLICK_SETUP.md` - Quick start guide
- `docs/deployment/railway-one-click-deploy.md` - Full guide
- `DEPLOYMENT_SUMMARY.md` - This file

## Notes

- Images build automatically on push to main/master
- Railway uses private networking (`.railway.internal` domains)
- Desktop service takes 1-2 minutes to fully start
- Only UI service should be publicly exposed

