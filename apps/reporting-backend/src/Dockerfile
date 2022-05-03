# syntax=docker/dockerfile:1.4
FROM node:16-alpine as build

RUN apk add --no-cache \
  git \
  g++ \
  make \
  python3 \
  curl

ENV HOME "/home/app"

WORKDIR ${HOME}

# Copy package.json to the working directory
COPY --link node_modules_production ./node_modules


FROM node:16-alpine

COPY --link config/ ./config/
COPY --link dist/apps/reporting-backend .
COPY --link --from=build /home/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "--enable-source-maps", "main.js"]

