FROM node:15.9-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn install
COPY . /usr/src/app

ARG NODE_ENV

ENV NODE_ENV="${NODE_ENV}"

RUN yarn run build

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
