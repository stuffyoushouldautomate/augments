# Railway Deployment Guide for Augments

## 🚀 One-Click Railway Deployment

Deploy Augments to Railway with PostgreSQL and all services in just a few clicks!

### Prerequisites

- Railway account (free tier available)
- At least one API key from: Anthropic, OpenAI, OpenRouter, or Google Gemini

### Quick Start (5 minutes)

1. **Fork this repository** to your GitHub account
2. **Connect to Railway**:
   - Go to [Railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your forked `augments` repository
   - Railway will automatically detect the `railway.toml` configuration

3. **Configure API Keys**:
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add your API key(s):
     ```
     ANTHROPIC_API_KEY=your_key_here
     # OR
     OPENAI_API_KEY=your_key_here
     # OR  
     OPENROUTER_API_KEY=your_key_here
     # OR
     GEMINI_API_KEY=your_key_here
     ```

4. **Deploy**:
   - Railway will automatically:
     - Provision PostgreSQL database
     - Deploy all services (UI, Agent, Desktop, LLM Proxy)
     - Configure networking between services
     - Set up production-ready environment

5. **Access your app**:
   - Railway will provide a public URL
   - Your Augments app will be live and ready to use!

### What Gets Deployed

Railway automatically deploys:

- ✅ **PostgreSQL Database** - Persistent data storage
- ✅ **Augments UI** - Web interface (port 9992)
- ✅ **Augments Agent** - Core AI agent service (port 9991)  
- ✅ **Augments Desktop** - Desktop automation service (port 9990)
- ✅ **LLM Proxy** - API key management (port 4000)
- ✅ **Automatic networking** - Services communicate seamlessly
- ✅ **Production configuration** - Optimized for Railway's infrastructure

### Environment Configuration

The deployment uses production-ready defaults. You only need to configure:

**Required:**
- At least one LLM API key (Anthropic, OpenAI, OpenRouter, or Gemini)

**Optional:**
- `JWT_SECRET` - For enhanced security (auto-generated if not provided)

All other settings are automatically configured for Railway deployment.

### Local Development

For local development, use Docker Compose:

```bash
git clone https://github.com/datapilotplus/augments.git
cd augments

# Copy environment template
cp .env.template docker/.env

# Edit docker/.env and add your API keys
# Then start all services
docker-compose -f docker/docker-compose.yml up -d

# Access at http://localhost:9992
```

### Production Features

- **Automatic scaling** - Railway handles traffic spikes
- **Zero-downtime deployments** - Updates without service interruption  
- **Built-in monitoring** - Logs and metrics in Railway dashboard
- **Secure by default** - HTTPS, environment isolation, secure networking
- **Cost-effective** - Pay only for what you use

### Troubleshooting

**Service not starting?**
- Check Railway logs in the dashboard
- Verify your API keys are correctly set
- Ensure you have at least one valid LLM API key

**Database connection issues?**
- Railway automatically provides `DATABASE_URL`
- No manual database configuration needed

**Desktop service issues?**
- Railway's infrastructure supports the desktop service
- If you encounter issues, check the logs for specific errors

### Support

- **Documentation**: Check this repository's README
- **Issues**: Open an issue on GitHub
- **Railway Support**: Use Railway's built-in support system

### Alternative Deployment Options

If Railway doesn't meet your needs:

1. **DigitalOcean App Platform** - Docker Compose support
2. **AWS ECS/Fargate** - Full container orchestration  
3. **Google Cloud Run** - Serverless containers
4. **Self-hosted VPS** - Full control with Docker Compose

For VPS deployment:
```bash
# On Ubuntu/Debian VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

git clone https://github.com/datapilotplus/augments.git
cd augments
cp .env.template docker/.env
# Edit docker/.env with your API keys
docker-compose -f docker/docker-compose.yml up -d
```

Access at `http://your-vps-ip:9992`

