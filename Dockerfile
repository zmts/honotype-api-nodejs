FROM node:22.13.1-alpine3.21

RUN apk update && apk upgrade

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

CMD npm run start:prod:api-main



