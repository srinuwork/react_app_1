# Stage 1: Base PHP 8.4 image
FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev

# Install extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    bcmath \
    gd \
    zip \
    opcache

# Stage 2: PHP Dependencies
FROM base AS php-stage
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --ignore-platform-reqs

# Stage 3: Node.js Build
FROM base AS node-stage
RUN apk add --no-cache nodejs npm
WORKDIR /var/www
COPY package.json package-lock.json* ./
RUN npm install
COPY --from=php-stage /var/www /var/www

# MEMORY FIX: Set max-old-space-size for production build
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build

# Stage 4: Final Image
FROM base
WORKDIR /var/www
COPY --from=php-stage --chown=www-data:www-data /var/www /var/www
COPY --from=node-stage --chown=www-data:www-data /var/www/public/build /var/www/public/build
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
