FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Install root dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "backend/server.js"] 