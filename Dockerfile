# Use Node.js 20 with pnpm
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY packages/shared/package*.json ./packages/shared/
COPY packages/augments-ui/package*.json ./packages/augments-ui/

# Install dependencies
RUN cd packages/shared && pnpm install
RUN cd packages/augments-ui && pnpm install

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/augments-ui ./packages/augments-ui

# Build the application
RUN cd packages/shared && pnpm run build
RUN cd packages/augments-ui && pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["cd", "packages/augments-ui", "&&", "pnpm", "start"]
