ARG BUILD_IMAGE
FROM ${BUILD_IMAGE} as build

FROM node:12-alpine

COPY --from=build /home/app/node_modules ./node_modules

COPY config/ ./config/
COPY dist/apps/reporting-backend .

EXPOSE 3000

CMD ["node", "main.js"]
