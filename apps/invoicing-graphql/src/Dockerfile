ARG BUILD_IMAGE
FROM ${BUILD_IMAGE} as build

FROM node:12-alpine

COPY --from=build /home/app/node_modules ./node_modules
COPY --from=build /usr/local/bin/phantomjs /usr/local/bin/phantomjs

# Copying the rest of the code to the working directory
COPY config/ ./config/
COPY dist/apps/invoicing-graphql .
COPY libs/shared/src/lib/infrastructure/database/knex/migrations/ ./migrations/

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
