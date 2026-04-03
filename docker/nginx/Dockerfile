# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS node-stage
WORKDIR /app
COPY . .
RUN npm install && npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the built assets and the public folder into Nginx
# This ensures Nginx actually has the new React code to show people!
WORKDIR /var/www/html
COPY --from=node-stage /app/public /var/www/html/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
