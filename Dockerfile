# Use a specific Node.js version for consistency
FROM node:20-slim

# Install dependencies for Playwright
RUN apt-get update && \
    apt-get install -y \
    # Required for Playwright browsers
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libgtk-3-0 \
    # Additional dependencies
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnss3-dev \
    libgdk-pixbuf2.0-0 \
    libgconf-2-4 \
    libgbm-dev \
    libgtk-3-0 \
    libnotify-dev \
    libxss1 \
    libasound2 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install chromium

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Create output directory
RUN mkdir -p /output

# Create a script to wrap the CLI with better error handling
RUN echo '#!/bin/sh\nexec node /app/dist/index.js "$@"' > /usr/local/bin/screenshotter && \
    chmod +x /usr/local/bin/screenshotter

# Set the entrypoint to our wrapper script
ENTRYPOINT ["screenshotter"]

# Default command shows help
CMD ["--help"]