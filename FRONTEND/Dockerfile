# Stage 1: Build the React Application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pass the API URL in during the build process
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy our custom Nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the compiled React files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]