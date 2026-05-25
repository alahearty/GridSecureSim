FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY simulation/ ./simulation/
COPY contracts/ ./contracts/

CMD ["node", "simulation/engine.js"]
