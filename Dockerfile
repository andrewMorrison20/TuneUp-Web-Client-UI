# Only for development: containerized ng serve on :4200
FROM node:18-alpine
WORKDIR /usr/src/app

# Install everything (including devDependencies)
COPY package.json package-lock.json ./
RUN npm ci

# Copy your entire source
COPY . .

# Expose the Angular dev server port
EXPOSE 4200

# Start the dev server and listen on all interfaces
CMD ["npx","ng","serve","--host","0.0.0.0","--port","4200"]

