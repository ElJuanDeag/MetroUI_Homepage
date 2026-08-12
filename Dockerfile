FROM node:22-alpine AS metro-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS metro-build
WORKDIR /app
COPY --from=metro-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS metro-runtime
COPY ops/nginx/metro.conf /etc/nginx/conf.d/default.conf
COPY --from=metro-build /app/dist /usr/share/nginx/html
EXPOSE 80

FROM node:22-alpine AS cabo-deps
WORKDIR /app
COPY cabo/package.json cabo/package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS cabo-build
WORKDIR /app
COPY --from=cabo-deps /app/node_modules ./node_modules
COPY cabo/ ./
RUN npm run build

FROM node:22-alpine AS cabo-runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
COPY cabo/package.json cabo/package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=cabo-build /app/dist-client ./dist-client
COPY --from=cabo-build /app/dist-server ./dist-server
EXPOSE 3002
CMD ["npm", "run", "start"]
