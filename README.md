# SVBot

Discord bot to organize the ranked gauntlet.

Add to server via this link:
[https://discord.com/oauth2/authorize?client_id=785912791739269130&scope=bot&permissions=8]

Github Actions: [https://github.com/SVB-OW/SVBot/actions]

## Developer documentation

[Setup](docs/dev.md)

## Requirements

Names are case-insensitive

- Roles: 'Ingame', 'Lobby Host', 'Gauntlet', 'Gauntlet \<rank>'
- Channels: 'matchmaker', 'player-pings', 'signup'
- Voice Channels: 'Waiting Lobby'

## Features

- Allow discord users to register for the gauntlet by using the /signup command
- Registered players can be viewed by staff with the "Manage Events" permission (Event Mods) using the /log command
- Event Mods can view the registrations and 'confirm' them to assign them their rank roles using the /confirm command
- To change some detail about a player after the confirmation, Event Mods can use the /update command
- Event Mods can get info about the all the registered players using the /stats command
- Once the streamer has chosen a rank they want to challenge an Event mod can start the round signups using the /ping command
- When it's time to start the game and Event Mod can announce the team formations using the /announce command
- If someone is brought in or switched out after the announcement an Event Mod can adjust their gamesPlayed using the /countup or /countdown commands
- After the game is done an Event Mod can kick players out of the voice chat and remove their @Ingame role using the /clear command

### Low priority

- [ ] automated testing and client mocking
- [ ] another \<role> should skip, if given user already has @ingame role
- [ ] rework matchmaker in announce?
