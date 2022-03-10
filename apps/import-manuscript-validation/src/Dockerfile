FROM node:16-slim as build

ENV HOME "/home/app"
WORKDIR ${HOME}

RUN apt-get update && apt-get install -y \
  bash \
  ca-certificates \
  g++ \
  git \
  make \
  libnss3 \
  openssh-server \
  python3

# Copy package.json to the working directory
COPY package.json yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install --frozen-lockfile --production

COPY config/ ./config/
COPY dist/apps/import-manuscript-validation ./

# FROM node:14.7-alpine as dist
# # Copying the rest of the code to the working directory
# COPY --from=build /home/app /
# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run index.js when the container launches
CMD ["node", "--enable-source-maps", "main.js"]
