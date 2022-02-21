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
COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production

FROM node:16-alpine

COPY --from=build /home/app/node_modules ./node_modules
COPY package.json .
COPY config/ ./config/
COPY dist/apps/reporting-backend .

EXPOSE 3000

CMD ["node", "--enable-source-maps", "main.js"]

