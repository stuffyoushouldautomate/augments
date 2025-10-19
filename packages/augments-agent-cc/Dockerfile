# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy app source
COPY ./shared ./shared
COPY ./augments-agent-cc/ ./augments-agent-cc/

WORKDIR /app/augments-agent-cc

# Install dependencies
RUN npm install


RUN npm run build

# Run the application
CMD ["npm", "run", "start:prod"] 


