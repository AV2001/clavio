#!/bin/bash

# Build and push backend image
docker build --no-cache -t clavio-backend:latest .
docker tag clavio-backend:latest registry.digitalocean.com/clavio/clavio-backend
docker push registry.digitalocean.com/clavio/clavio-backend

# Build and push celery image
docker build --no-cache -f Dockerfile.celery -t clavio-backend:celery .
docker tag clavio-backend:celery registry.digitalocean.com/clavio/clavio-backend:celery
docker push registry.digitalocean.com/clavio/clavio-backend:celery
