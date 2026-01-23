# Server - dev-friendly Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first 
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 8000

CMD ["npm", "start"]
