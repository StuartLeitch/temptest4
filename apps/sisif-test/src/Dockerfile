# Use an official Node runtime as a parent image
FROM node:12.14.0-alpine

RUN apk add --no-cache git

ENV PHANTOMJS_VERSION 2.1.1

RUN apk add g++ make python
RUN apk add --update --no-cache curl
RUN curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/${PHANTOMJS_VERSION}/dockerized-phantomjs.tar.gz" | tar xz -C / && \
  curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 | tar -jxvf - -C /
RUN cp phantomjs-${PHANTOMJS_VERSION}-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
RUN rm -fR phantomjs-${PHANTOMJS_VERSION}-linux-x86_64

# Copy package.json to the working directory
COPY package.json .
COPY yarn.lock .

# Install any needed packages specified in package.json
RUN yarn install --production

# Copying the rest of the code to the working directory
COPY config/ ./config/
COPY dist/apps/sisif-test .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "main.js"]
