FROM node:18-alpine

WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy forta-agent source code
COPY forta-agent/ ./forta-agent/

# Expose port
EXPOSE 3000

# Start forta agent
CMD ["node", "forta-agent/agent.js"]
