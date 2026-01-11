FROM node:18-alpine AS frontend-build
WORKDIR /workspace

# Install frontend deps and build
COPY frontend/package*.json frontend/
COPY frontend/ ./frontend/
WORKDIR /workspace/frontend
RUN npm install
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Copy backend package files and install
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy frontend build into backend public folder
COPY --from=frontend-build /workspace/frontend/dist ./public

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]
