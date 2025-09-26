# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /workspace

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build users-service

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app
    
COPY --from=build /workspace/dist/apps/users-service ./dist
COPY --from=build /workspace/package*.json ./
COPY --from=build /workspace/node_modules ./node_modules
RUN npm prune --omit=dev
    
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
    