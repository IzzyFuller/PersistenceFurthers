#!/bin/bash

set -e

echo "🔨 Building PersistenceFurthers..."

# Build the Docker image
npm run docker:build

echo "🚀 Deploying to Docker network..."

# Deploy using docker-compose
docker-compose up -d persistence-furthers

echo "✅ Deployment complete!"

# Show logs
echo "📋 Showing recent logs..."
docker-compose logs --tail=50 persistence-furthers