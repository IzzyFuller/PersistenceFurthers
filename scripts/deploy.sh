version: '3.8'

services:
  persistence-furthers:
    build: .
    container_name: persistence-furthers
    environment:
      - EVENTSTORE_CONNECTION_STRING=esdb://host.docker.internal:2113?tls=false
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "--version"]
      interval: 30s
      timeout: 10s
      retries: 3