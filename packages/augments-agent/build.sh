#!/bin/bash

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Build shared package
echo "Building shared package..."
npm run build --prefix ../shared

# Build the application
echo "Building application..."
./node_modules/.bin/nest build
