FROM nginx:alpine

COPY dist/apps/invoicing-web /usr/share/nginx/html

COPY ./tools/scripts/env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh
RUN ./env.sh
RUN cp env-config.js /usr/share/nginx/html

EXPOSE 80
