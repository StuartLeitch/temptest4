FROM nginx:alpine

# Add bash
RUN apk add --no-cache bash

COPY dist/apps/invoicing-web /usr/share/nginx/html

CMD envsubst

CMD [ "/bin/bash", "-c", \
      "envsubst < /usr/share/nginx/html/env-template.js > /usr/share/nginx/html/assets/env-config.js && exec nginx -g 'daemon off;'" ]

EXPOSE 80
