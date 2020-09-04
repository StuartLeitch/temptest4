FROM node:14-alpine as build
RUN apk add --no-cache git \
  && apk add g++ make python \
  && apk add --update --no-cache curl

ENV HOME "/home/app"

WORKDIR ${HOME}

# Copy package.json to the working directory
COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production

FROM node:14-alpine

COPY --from=build /home/app/node_modules ./node_modules
COPY package.json .
COPY config/ ./config/
COPY dist/apps/reporting-backend .

EXPOSE 3000

CMD ["node", "main.js"]
