# --- Stage 1: Build Frontend Assets (Needs PHP for Wayfinder Plugin) ---
FROM php:8.4-fpm-alpine AS node-stage

# Install Node.js and system dependencies for PHP extensions
RUN apk add --no-cache nodejs npm libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev postgresql-dev oniguruma-dev

# Install required PHP extensions so the Vite plugin can run artisan commands
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql pgsql gd zip

WORKDIR /app

# SPEED FIX: Copy package files first to CACHE THE INSTALL
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the code ONLY after install is cached
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build assets into Nginx (MATCHING THE PHP WORKDIR AT /var/www)
WORKDIR /var/www
COPY --from=node-stage /app/public /var/www/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
