# Purpose - Leverage Docker multi-stage layers to cache node_modules and achieve faster build times

# STAGE 1 - Create cached node_modules.
# Only rebuild layer if package.json has changed
FROM node:10-alpine as node_cache

ENV NODE_ENV production
WORKDIR /cache/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /cache/
# Uncomment below if you're using .npmrc
# COPY .npmrc .

RUN npm prune
RUN npm ci --only=production

# STAGE 2 - Builder
FROM node:10-alpine
WORKDIR /root/

COPY --from=node_cache /cache/ .

# Bundle app source (copy source file, and possibly invalidate so we have to rebuild)
COPY apps ./apps
COPY libs ./libs

# EXPOSE ${PORT:-3000}
# CMD [ "node", "src/main.js" ]
