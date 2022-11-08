# Developer documentation

## Setup

However you run this, you need to setup a `.env` file with the following vars:
1. DISCORD_TOKEN
    1. This is the Discord token you can get from https://discord.com/developers/applications
1. MONGO_URI
    1. This should be a MongoDB URI for database access
1. DISCORD_BOT_ID
    1. This is the bots ID also from the developer page above
1. PROD_ERROR_EMAIL
    1. This is the email address it will use to send errors to when run in production mode


### Running via Node

1. Install node
1. Install package dependencies
    1. `npm up`
1. Compile the code
    1. `npx -p typescript tsc`
1. Run the bot in dev mode
    1. `npm run-script dev`


## Updating Slash Commands

Once the bot is running for the first time, you'll notice the slash commands aren't available. To fix this, run `node deploy.mjs` which will load the env file, then remove and reregister the slash commands to the bot. It might take a minute or two for Discord to notice!
If you remove or update any new command files, you'll need to rerun this to get the new commands updated. Editing an existing command does not require this to be run.
