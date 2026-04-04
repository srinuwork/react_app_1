# --- Stage 1: Build Frontend Assets (Needs PHP for Wayfinder Plugin) ---
FROM php:8.4-fpm-alpine AS node-stage

# Install high-speed PHP extension installer
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Use basic compatibility libraries and Node/NPM
RUN chmod +x /usr/local/bin/install-php-extensions && \
    apk add --no-cache nodejs npm postgresql-dev libc6-compat gcompat libstdc++

# Install ONLY the database driver needed for Wayfinder (much faster with this tool)
RUN install-php-extensions pdo_pgsql pgsql

WORKDIR /app

# SPEED FIX: Copy package files first to CACHE THE INSTALL
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the code ONLY after install is cached
COPY . .

# Build with increased memory and production environment
RUN NODE_OPTIONS=--max-old-space-size=2048 NODE_ENV=production npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build assets into Nginx (MATCHING THE PHP WORKDIR AT /var/www)
WORKDIR /var/www
COPY --from=node-stage /app/public /var/www/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
