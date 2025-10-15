# Railway Deployment Guide for Augments

## Important Note

Railway deployment for this application is **complex** because it requires multiple services:
- PostgreSQL database
- Desktop container (requires privileged mode)
- Agent service
- UI service

**Railway's standard deployment doesn't support all these requirements**, particularly the privileged desktop container.

## Recommended Deployment Options

### Option 1: Docker Compose (Recommended)

Deploy on any VPS or cloud provider that supports Docker:

```bash
git clone https://github.com/datapilotplus/augments.git
cd augments

# Set your API key
echo "ANTHROPIC_API_KEY=your-key-here" > docker/.env

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Access at http://your-server-ip:9992
```

### Option 2: Railway with Multiple Services

If you want to use Railway, you'll need to deploy each service separately:

#### 1. Deploy PostgreSQL
- Create a new PostgreSQL database in Railway
- Note the connection URL

#### 2. Deploy Agent Service
- Create a new service from `packages/bytebot-agent`
- Set environment variables:
  - `DATABASE_URL`: Your PostgreSQL URL
  - `ANTHROPIC_API_KEY`: Your API key
  - `BYTEBOT_DESKTOP_BASE_URL`: URL of desktop service

#### 3. Deploy UI Service
- Create a new service from `packages/bytebot-ui`
- Set environment variables:
  - `BYTEBOT_AGENT_BASE_URL`: URL of agent service
  - `BYTEBOT_DESKTOP_VNC_URL`: URL of desktop service

#### 4. Desktop Service (Problematic)
The desktop service requires:
- Privileged container mode (not supported on Railway)
- X11/VNC server
- Significant resources

**This service cannot run on Railway's standard infrastructure.**

## Alternative: Deploy UI Only

If you want to use Railway for the UI and host other services elsewhere:

1. Deploy the desktop and agent services on a VPS with Docker
2. Deploy only the UI on Railway
3. Configure environment variables to point to your VPS services

### Railway UI-Only Configuration

Create a `railway.toml` in the root:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd packages/shared && pnpm install && pnpm run build && cd ../bytebot-ui && pnpm install && pnpm run build"

[deploy]
startCommand = "cd packages/bytebot-ui && pnpm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

Environment variables needed:
- `BYTEBOT_AGENT_BASE_URL`: https://your-agent-service.com
- `BYTEBOT_DESKTOP_VNC_URL`: wss://your-desktop-service.com/websockify

## Recommended Full-Stack Deployment Platforms

For a complete deployment, consider:

1. **DigitalOcean App Platform** - Supports Docker Compose
2. **AWS ECS/Fargate** - Full container orchestration
3. **Google Cloud Run** - Container deployment
4. **Self-hosted VPS** - Full control (DigitalOcean, Linode, Vultr)

## Quick VPS Deployment

```bash
# On your VPS (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

git clone https://github.com/datapilotplus/augments.git
cd augments
echo "ANTHROPIC_API_KEY=your-key" > docker/.env
docker-compose -f docker/docker-compose.yml up -d
```

Access your deployment at `http://your-vps-ip:9992`

## Why Railway Doesn't Work Well

1. **No privileged containers** - Desktop service needs this
2. **Complex multi-service architecture** - Better suited for Docker Compose
3. **Resource requirements** - Desktop container needs significant RAM/CPU
4. **Networking complexity** - Services need to communicate internally

## Support

For deployment questions, please open an issue at:
https://github.com/datapilotplus/augments/issues

