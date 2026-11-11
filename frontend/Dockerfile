# Multi-stage Dockerfile for Hashmat Uddin High School Online Admission Frontend (React + Vite)

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
RUN npm ci

# Pass build environment variables for real backend API connection
ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_USE_MOCK_API=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK_API=$VITE_USE_MOCK_API

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx on port 5173
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]

