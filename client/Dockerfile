# Client (Create React App) - dev-friendly Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps 
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# CRA dev server
EXPOSE 3000

# Helps hot reload in Docker (esp. on Windows/WSL)
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

CMD ["npm", "start"]
