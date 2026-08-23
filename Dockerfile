# --- STAGE 1: BUILD FRONTEND ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Build frontend static files
RUN npm run build

# --- STAGE 2: BUILD BACKEND & UNIFY ---
FROM python:3.11-slim
WORKDIR /app

# Install Nginx and clean up apt caches
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy built frontend assets to Nginx html directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Copy backend source code
COPY backend/ /app/backend/

# Expose port 80 (Nginx port which proxies both frontend and backend)
EXPOSE 80

# Run script to start both Uvicorn and Nginx
WORKDIR /app/backend
CMD service nginx start && uvicorn main:app --host 127.0.0.1 --port 8000
