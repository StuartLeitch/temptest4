FROM node:14-alpine as build
ENV HOME "/home/app"
WORKDIR ${HOME}

# Copy package.json to the working directory
COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production

# COPY libs/shared/src/lib/infrastructure/database/knex/migrations/ ./migrations/
# COPY libs/shared/src/lib/infrastructure/database/knex/seeds/ ./seeds/
# COPY config/ ./config/
COPY dist/apps/erp-integration ./

# FROM node:14.7-alpine as dist
# # Copying the rest of the code to the working directory
# COPY --from=build /home/app /
# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
