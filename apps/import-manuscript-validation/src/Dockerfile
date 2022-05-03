# syntax=docker/dockerfile:1.4
FROM node:16-slim as build

ENV HOME "/home/app"
WORKDIR ${HOME}

RUN apt-get update && apt-get install -y \
  bash \
  ca-certificates \
  chromium \
  g++ \
  git \
  make \
  libnss3 \
  python3

COPY --link package.json yarn.lock ./
COPY --link node_modules_production ./node_modules
RUN yarn install --frozen-lockfile --production
RUN npm rebuild
COPY --link config/ ./config/
COPY --link dist/apps/import-manuscript-validation ./



# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "--enable-source-maps", "main.js"]
