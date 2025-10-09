# Stage 1: Build Vue app
FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production-state

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Replace default config.js with template
COPY public/config.js /usr/share/nginx/html/config.js

ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
