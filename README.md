# SVBot

Discord bot for setting up the ranked gauntlet.

Add to server via this link:
[https://discord.com/oauth2/authorize?client_id=785912791739269130&scope=bot&permissions=8]

## Running

### Requirements

- Node.js: [https://nodejs.org/en/]

### Setup

- npm install

### Start

#### Normal run

```bash
npm start
```

#### Run with watch on save

```bash
npm run watch
```

## ToDo

- Help command. Optional command parameter for more detailed info to one
  specific command: .help \<command?>
- Translate matchmaking function
- Status (banned, left, allowed) // check if still on server before sending
  announcement
- Allow per channel/role which commands are allowed
- DB connection to mongo db

### Low priority

- command confirmedBy: shows who and when a message was confirmed
- Update command: .update <@DiscordTag> \<property> \<value>
- anotherOne: outputs the next player from the matchmaking pool for a certain
  role

### Streamer section

- leaderboard: shows streamers points
- countup / -down: adds points to streamers
