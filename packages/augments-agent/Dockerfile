# Base image - using full Node.js image for better Prisma compatibility
FROM node:20-bullseye

# Install necessary dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json files first for better caching
COPY ./shared/package*.json ./shared/
COPY ./augments-agent/package*.json ./augments-agent/

# Install dependencies for shared package first
WORKDIR /app/shared
RUN npm install

# Install dependencies for agent package
WORKDIR /app/augments-agent
RUN npm install

# Copy the rest of the source code
WORKDIR /app
COPY ./shared ./shared
COPY ./augments-agent/ ./augments-agent/

WORKDIR /app/augments-agent

# Build the shared package first
RUN npm run build --prefix ../shared

# Build the application using custom build script (includes Prisma generation)
RUN ./build.sh

# Run the application with runtime Prisma generation
CMD ["./start.sh"] 


