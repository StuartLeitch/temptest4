FROM node:10-alpine

ENV NODE_ENV production
WORKDIR /

# Install app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Bundle app source
COPY src ./src

# EXPOSE ${PORT:-3000}
# CMD [ "node", "src/main.js" ]
