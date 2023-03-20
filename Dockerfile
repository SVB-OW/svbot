FROM node:18

LABEL description="SVBot-JS"
LABEL version="1.2"

ENV DISCORD_TOKEN ${DISCORD_TOKEN}
ENV MONGO_URI ${MONGO_URI}
ENV DISCORD_BOT_ID ${DISCORD_BOT_ID}
ENV DISCORD_BOT_ID ${DISCORD_BOT_ID}
ENV PROD_ERROR_EMAIL ${PROD_ERROR_EMAIL}

WORKDIR /svbot

COPY package*.json ./

# Install dependencies
RUN yarn install

# Build it
RUN yarn build

# Send the commands
RUN yarn deploy

# Copy files into container
COPY . .

CMD [ "yarn", "dev" ]
