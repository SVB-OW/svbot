FROM node:18 as base

LABEL description="SVBot-JS"
LABEL version="1.2"

ENV DISCORD_TOKEN ${DISCORD_TOKEN}
ENV MONGO_URI ${MONGO_URI}
ENV DISCORD_BOT_ID ${DISCORD_BOT_ID}
ENV DISCORD_BOT_ID ${DISCORD_BOT_ID}
ENV PROD_ERROR_EMAIL ${PROD_ERROR_EMAIL}

WORKDIR /home/node/app

COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy files into container
COPY . .

# Dont ask me.. https://dev.to/dariansampare/setting-up-docker-typescript-node-hot-reloading-code-changes-in-a-running-container-2b2f
FROM base as production

ENV NODE_PATH=./build

# Build it
RUN yarn build

#CMD [ "yarn", "start" ]
