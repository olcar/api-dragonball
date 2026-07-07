FROM node:20-alpine AS development
WORKDIR /app
COPY --link package*.json ./
RUN npm ci
COPY --link . .
EXPOSE 3000
USER node
CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS build
WORKDIR /app
COPY --link package*.json ./
RUN npm ci
COPY --link . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --link package*.json ./
RUN npm ci --omit=dev
COPY --link --from=build /app/dist ./dist
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api-docs || exit 1
CMD ["node", "dist/main.js"]
