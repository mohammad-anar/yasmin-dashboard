FROM node:22-alpine

# Install libc6-compat for native dependencies compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Set build-time environment variables for Next.js (required for client bundling)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application for production
RUN npm run build

# Set runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

EXPOSE 3000

# Run the production server
CMD ["npm", "run", "start"]
