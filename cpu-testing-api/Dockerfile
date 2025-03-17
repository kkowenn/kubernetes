# Use official Node.js 20 as base image (LTS version as of March 2025)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY server.js ./

# Expose the port (matches the PORT in .env or defaults to 3000)
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Healthcheck to verify the API is running
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/api/cpu/info || exit 1

# Command to run the application
CMD ["node", "server.js"]

# Add metadata
LABEL maintainer="DKS Center"
LABEL version="1.0.0"
LABEL description="CPU Testing RESTful API"