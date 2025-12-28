# Base image - using Debian instead of Alpine for better compatibility
FROM node:20-slim

# Declare build arguments
ARG AUGMENTS_AGENT_BASE_URL
ARG AUGMENTS_DESKTOP_VNC_URL

# Set environment variables for the build process
ENV AUGMENTS_AGENT_BASE_URL=${AUGMENTS_AGENT_BASE_URL}
ENV AUGMENTS_DESKTOP_VNC_URL=${AUGMENTS_DESKTOP_VNC_URL}

# Create app directory
WORKDIR /app

# Copy package.json files first for better caching
COPY ./shared/package*.json ./shared/
COPY ./augments-ui/package*.json ./augments-ui/

# Install dependencies for shared package first
WORKDIR /app/shared
RUN npm install

# Install dependencies for UI package
WORKDIR /app/augments-ui
RUN npm install

# Copy the rest of the source code
WORKDIR /app
COPY ./shared ./shared
COPY ./augments-ui/ ./augments-ui

# Build the shared package first
WORKDIR /app/shared
RUN npm run build

# Now build the UI application
WORKDIR /app/augments-ui
RUN npm run build

# Run the application
CMD ["npm", "run", "start"] 


