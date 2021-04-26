FROM nginx:alpine

# Add bash
RUN apk add --no-cache bash

RUN rm /etc/nginx/conf.d/default.conf
COPY dist/apps/invoicing-admin/nginx.conf /etc/nginx/conf.d
COPY dist/apps/invoicing-admin /usr/share/nginx/html

# Delete nginx.conf file from public directory
RUN rm -f /usr/share/nginx/html/nginx.conf

EXPOSE 80 443 3000

CMD [ "/bin/bash", "-c", \
  "envsubst < /usr/share/nginx/html/env-template.js > /usr/share/nginx/html/assets/env-config.js && nginx -g 'daemon off;'" ]
