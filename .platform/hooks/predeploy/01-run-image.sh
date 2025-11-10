#!/bin/bash
set -e

echo "Pulling Docker image: amitlaxman/india-forecaster:${TAG}"

docker pull amitlaxman/india-forecaster:${TAG}
docker stop app || true
docker rm app || true

docker run -d \
  --name app \
  -p 8080:8080 \
  -e NODE_ENV=production \
  amitlaxman/india-forecaster:${TAG}
