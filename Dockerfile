# Stage 1: PHP Base
FROM php:8.4-fpm-alpine AS base

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions && \
    apk add --no-cache libc6-compat gcompat libstdc++

RUN install-php-extensions pdo_pgsql pgsql gd zip bcmath opcache

# Stage 2: PHP Dependencies
FROM base AS php-stage

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --ignore-platform-reqs

# Stage 3: Node Build (FIXED)
FROM node:18-alpine AS node-stage

WORKDIR /var/www

COPY package.json package-lock.json* ./
RUN npm ci

COPY --from=php-stage /var/www /var/www

RUN npm run build

# Stage 4: Final
FROM base

WORKDIR /var/www

COPY --from=php-stage --chown=www-data:www-data /var/www /var/www
COPY --from=node-stage --chown=www-data:www-data /var/www/public/build /var/www/public/build

RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]