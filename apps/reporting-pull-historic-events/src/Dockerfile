FROM node:14-alpine as build
RUN apk add --no-cache git \
  && apk add g++ make python \
  && apk add --update --no-cache curl

ENV PHANTOMJS_VERSION 2.1.1
RUN curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/${PHANTOMJS_VERSION}/dockerized-phantomjs.tar.gz" | tar xz -C / \
  && curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 | tar -jxvf - -C / \
  && cp phantomjs-${PHANTOMJS_VERSION}-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs 

ENV HOME "/home/app"

WORKDIR ${HOME}

# Copy package.json to the working directory
COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production

FROM node:14-alpine

COPY --from=build /home/app/node_modules ./node_modules

# Copying the rest of the code to the working directory
COPY config/ ./config/
COPY dist/apps/reporting-pull-historic-events .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
