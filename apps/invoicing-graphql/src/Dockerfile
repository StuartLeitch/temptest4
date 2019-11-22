# Use an official Node runtime as a parent image
FROM node:12.7.0-alpine

# Copy package.json to the working directory
COPY package.json .
COPY package-lock.json .

# Install any needed packages specified in package.json
RUN npm ci --only=production

# Copying the rest of the code to the working directory
COPY config/ ./config/
COPY dist/apps/invoicing-graphql .
COPY libs/shared/src/lib/infrastructure/database/knex/migrations/ ./migrations/

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
