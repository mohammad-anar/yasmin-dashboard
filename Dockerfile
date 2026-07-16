FROM node:22-alpine

# Install libc6-compat for native dependencies compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Set environment variables
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

EXPOSE 5000

# Run in development mode
CMD ["npm", "run", "dev"]
