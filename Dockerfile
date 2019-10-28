# Purpose - Leverage Docker multi-stage layers to cache node_modules and achieve faster build times

# STAGE 1 - Create cached node_modules.
# Only rebuild layer if package.json has changed
FROM node:10-alpine as node_cache

ENV NODE_ENV production
WORKDIR /cache/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .
# Uncomment below if you're using .npmrc
# COPY .npmrc .

RUN npm prune
RUN npm ci --only=production

# Bundle app source
COPY apps ./apps
COPY libs ./libs

# EXPOSE ${PORT:-3000}
# CMD [ "node", "src/main.js" ]
