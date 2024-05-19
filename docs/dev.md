# Developer documentation

## Setup

Before you run the application, you need to setup a `.env` file with the following vars:
1. DISCORD_TOKEN
    1. This is the Discord token you can get from https://discord.com/developers/applications
1. MONGO_URI
    - This should be a MongoDB URI for database access
1. DISCORD_BOT_ID
    - This is the bots ID also from the developer page above
1. PROD_ERROR_EMAIL
    - This is the email address it will use to send errors to when run in production mode


### Running

1. Install node
1. Enable corepack to use yarn
    - `corepack enable`
1. Install package dependencies
   - `yarn install`
1. Run the bot in dev mode
    - `yarn dev`
1. To run it in production mode, you can use
    - `yarn build && yarn start`
1. Before commiting, run the linter and formatter
    - `yarn lint`
    - `yarn format`
1. You can use the following commands to fix code issues
    - `yarn lint-fix`
    - `yarn format-fix`


## Updating Slash Commands

Once the bot is running for the first time, you'll notice the slash commands aren't available. To fix this, run `node deploy.mjs` which will load the env file, then remove and reregister the slash commands to the bot. It might take a minute or two for Discord to notice!
If you remove or update any new command files, you'll need to rerun this to get the new commands updated. Editing an existing command does not require this to be run.
Sometimes discord caches commands, so if updated commands or props don't work, restart your discord client.
