
# Use the official Node.js image as the base image
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the source code to the container
COPY . .

# Build the React app
RUN npm run build

# Use the official Nginx image as the base image for serving the React app
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the previous stage to the Nginx default public directory
COPY --from=build /app/dist /usr/share/nginx/html

COPY docker-entrypoint.sh /docker-entrypoint.d/docker-entrypoint.sh

# Expose port 80 for the Nginx server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
