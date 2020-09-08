FROM node:14-alpine as build
ENV HOME "/home/app"
WORKDIR ${HOME}

RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh g++ make python3
# Copy package.json to the working directory

COPY package.json yarn.lock dist/apps/invoicing-graphql ./
COPY config/ ./config/
COPY libs/shared/src/lib/infrastructure/database/knex/migrations/ ./migrations/

# COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production
RUN npm prune --production

# COPY libs/shared/src/lib/infrastructure/database/knex/migrations/ ./migrations/
# COPY config/ ./config/
# COPY dist/apps/invoicing-graphql ./

 FROM node:14.7-alpine as dist
# # Copying the rest of the code to the working directory
 COPY --from=build /home/app /
# Make port 3000 available to the world outside this container
# EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
