# Use Node.js 20 LTS Alpine for better compatibility
FROM node:20-alpine

# Install system dependencies for canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    fontconfig-dev \
    ttf-dejavu \
    ttf-liberation

# Set working directory
WORKDIR /app

# Set environment variables for Cairo/Pango
ENV PANGOCAIRO_BACKEND=fontconfig
ENV FONTCONFIG_PATH=/etc/fonts

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
