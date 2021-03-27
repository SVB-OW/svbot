# SVBot

Discord bot for setting up the ranked gauntlet.

Add to server via this link:
[https://discord.com/oauth2/authorize?client_id=785912791739269130&scope=bot&permissions=8]

Github Actions: [https://github.com/fdendorfer/SVBot/actions]

## ToDo

- [x] announce command parameter for how many player are needed on each role
- [x] announcment doesnt mention players in embed -> make normal message out of
      it
- [x] assign rank roles on confirm
- [x] update command should update by discordId and log profile afterwards
- [x] remove memory db
- [x] announcement doesnt increase gamesPlayed
- [x] btagMessage in announcement can't be embed
- [x] check non found users
- [x] countdown/up update by id instead of tag
- [x] clear last lobby before new announce
- [x] update command should update roles

### Low priority

- [ ] rework matchmaker in announce?
- [ ] another \<role>: outputs the next player from the matchmaking pool for a
      certain role
- [ ] Help command only show commands you're allowed to use and where to use
      them
- [ ] me command
- [ ] aliases for ranks (b,s,g,p,d,m,gm / plat,dia,gm)

### Streamer section

- [ ] leaderboard: shows streamers points
- [ ] countup / -down: adds points to streamers

### Stream interface

- [ ] streamer leaderboard
- [ ] website for selection process
- [ ] stream elements with handicaps
