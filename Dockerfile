##################
### base image ###
FROM node:11.9-alpine as base

ARG USER_ID
ARG GROUP_ID

## User & group `node` with custom ids
RUN deluser node && \
    addgroup -g ${GROUP_ID} node && \
    adduser -u ${USER_ID} -D node -G node

# Create app directory
RUN mkdir -p /usr/app && chown -R node:node /usr/app

WORKDIR /usr/app

USER node

# Install app dependencies
COPY --chown=node:node package.json package-lock.json ./


#########################
### builder/dev image ###
FROM base as txio_dev
RUN npm ci
COPY --chown=node:node . .
RUN npm run build
CMD ["npm", "run", "start-dev"]


########################
### production image ###
FROM base as txio_prod
RUN npm ci --only=prod
COPY --from=dev /usr/app/dist ./dist
CMD ["npm", "start"]

