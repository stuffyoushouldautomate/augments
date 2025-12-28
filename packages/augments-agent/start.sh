#!/bin/bash

# Force regenerate Prisma client at runtime
echo "Force regenerating Prisma client..."
rm -rf node_modules/@prisma/client
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
npm run start:prod

