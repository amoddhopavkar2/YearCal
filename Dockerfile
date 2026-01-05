# Use Node.js 24 Alpine for smaller image size
FROM node:24-slim

# Install system dependencies for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libcairo2 \
    libpango1.0-dev \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    librsvg2-2 \
    libpixman-1-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm ci --production

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
