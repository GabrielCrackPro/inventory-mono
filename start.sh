#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h db -p 5432 -U postgres; do
  sleep 2
done

echo "Database is ready!"

# Run database migrations
cd /app/backend
npx prisma migrate deploy

# Start backend in background
echo "Starting backend..."
node dist/main.js &

# Start frontend
echo "Starting frontend..."
cd /app/frontend
npm start -- --host 0.0.0.0 --port 4200