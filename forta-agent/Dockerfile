FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY forta-agent/ ./forta-agent/
COPY contracts/ ./contracts/

CMD ["node", "forta-agent/agent.js"]
