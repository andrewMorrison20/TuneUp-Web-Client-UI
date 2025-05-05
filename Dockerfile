FROM node:18-alpine AS builder

# set working directory
WORKDIR /usr/src/app

# copy package manifests and install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy all source files and build
COPY . .
RUN npm run build --configuration=production


FROM nginx:stable-alpine

# remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# copy our built files from builder
COPY --from=builder /usr/src/app/dist/tune-up /usr/share/nginx/html

# optional: copy a custom nginx.conf if you need rewrites, headers, etc.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
