# Stage 1: Base PHP 8.4 image
FROM php:8.4-fpm-alpine AS base

# Install high-speed PHP extension installer
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install ONLY what is absolutely needed manually (native compat layers)
RUN chmod +x /usr/local/bin/install-php-extensions && \
    apk add --no-cache libc6-compat gcompat libstdc++ nodejs npm

# Install extensions (MUCH FASTER with this script)
RUN install-php-extensions pdo_pgsql pgsql gd zip bcmath opcache

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
WORKDIR /var/www
COPY package.json package-lock.json* ./
RUN npm install
COPY --from=php-stage /var/www /var/www

# Build with optimized memory
RUN NODE_OPTIONS=--max-old-space-size=2048 NODE_ENV=production npm run build

# Stage 4: Final Image
FROM base
WORKDIR /var/www
COPY --from=php-stage --chown=www-data:www-data /var/www /var/www
COPY --from=node-stage --chown=www-data:www-data /var/www/public/build /var/www/public/build
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
