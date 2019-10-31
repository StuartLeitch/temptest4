FROM nginx:alpine

COPY dist/apps/invoicing-web /usr/share/nginx/html

COPY ./tools/scripts/env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh
RUN /bin/bash -c env.sh
COPY env-config.js /usr/share/nginx/html
