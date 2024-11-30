#!/bin/bash

# Build and push backend app image
docker build --no-cache -t clavio-backend:app .
docker tag clavio-backend:app registry.digitalocean.com/clavio/clavio-backend:app
docker push registry.digitalocean.com/clavio/clavio-backend:app

# Build and push celery image
docker build --no-cache -f Dockerfile.celery -t clavio-backend:celery .
docker tag clavio-backend:celery registry.digitalocean.com/clavio/clavio-backend:celery
docker push registry.digitalocean.com/clavio/clavio-backend:celery
