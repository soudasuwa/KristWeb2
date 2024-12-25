# Build app
FROM node:20-alpine AS build

RUN apk update && apk add git gzip

WORKDIR /build

COPY ["yarn.lock", "./"]
RUN yarn global add rimraf@4.4.1 @craco/craco@^6.1.1

COPY ["package.json", "./"]
RUN yarn install

COPY . .

ENV NODE_ENV=production

ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_TOKEN
ARG SENTRY_URL
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_TOKEN=$SENTRY_TOKEN
ENV SENTRY_URL=$SENTRY_URL

RUN yarn run build
RUN yarn run optimise

FROM node:20-alpine

WORKDIR /build
COPY --from=build /build/build ./build

RUN yarn global add serve
CMD serve -s build
