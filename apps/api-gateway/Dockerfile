# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /workspace

# Install root deps
COPY package*.json ./
RUN npm ci

# Copy sources
COPY . .

# Build just this app (production build)
RUN npx nx build api-gateway

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app

# Copy only the built app and its root node_modules
COPY --from=build /workspace/dist/apps/api-gateway ./dist
COPY --from=build /workspace/package*.json ./
COPY --from=build /workspace/node_modules ./node_modules

# (optional) drop dev deps
RUN npm prune --omit=dev

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
