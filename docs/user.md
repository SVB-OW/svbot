# User documentation

## OW Roles

The SVBot needs each player to have a rank in each role of Overwatch. The roles are

- Tank
- DAMAGE
- Support

## Ranks

The possible ranks are

| Full name   | Short   |
| ----------- | ------- |
| Bronze      | B       |
| Silver      | S       |
| Gold        | G       |
| Platinum    | P, Plat |
| Diamond     | D, Dia  |
| Master      | M       |
| Grandmaster | GM      |

## Requirements

In order to use the bot your Discord server needs the following things. All names are case-insensitive.

### Roles

- "Ingame"
- "Lobby Host"
- "Gauntlet"
- "Gauntlet \<rank>" for the full name of each [rank](#ranks)

### Text channels

- "matchmaker"
- "player-pings"
- "signup"

### Voice channels

- "Waiting Lobby"

## Deployment

Add the server via this [link](https://discord.com/oauth2/authorize?client_id=785912791739269130&scope=bot&permissions=8)

Make sure you give the event mods the `Manage Events` permission.

## Workflow

### Signup

Players can use the `/signup` command to submit their battletag, region and a screenshot showing their ranking in the current competitive season. So far possible regions are

- EU
- NA

The battletag is in the format `name#number`.

### Checking and accepting signups

Moderators can use the `/getunconfirmed` command to get a list of all currently unconfirmed signups. This list will contain their Discord IDs, the battletags submitted and the link to the screenshot.

In order to accept a signup the `/confirm` command must be used. It takes the Discord ID, and the rank for each role. In case a player is not ranked in a certain role you can use "-" instead of the rank name.

If the signup is not valid you can use the `/reject` command instead. It will delete the signup.

### Changing ranks of a confirmed user

If the ranks of a player have to be updated moderators can use the `/update` command. The first argument describes the property you want to update. Currently this can be one of the following:

- tankRank
- damageRank
- supportRank

For the second argument put in the [new rank](#ranks).

### Retrieving information about players

Event mods can always get the infos about already signed up players by using the `/stats` command.

### Preparing a round

In order to start round signups for a lobby with a certain rank event mods can use the `/ping` command. Once the round is about to start the `/announce` command can be used.

### Within the round

If a player needs to be switched in/out after the announcement event mods can adjust the number of games played for the players with the `/countup` and `/countdown` commands. You can automatically get the replacement player with the `/another` command.

### After the round

Once around is finished the lobby can be cleaned up via the `/clear` command. This will remove the `@Ingame` role from the players and remove them from the voice chat on discord.

## Command overview

| Name           | Arguments                                                                                                        | Function                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| announce       | `tank_players_count`: number, `damage_players_count`: number, `support_players_count`: number                    | Prepares a lobby for a round with the given number of tanks, DAMAGE and supports                                                               |
| another        | `role`: [role](#ow-roles)                                                                                        | Gets another player for the chosen role                                                                                                        |
| clear          | -                                                                                                                | Kicks all players with the `@Ingame` role from voice chat and removes the role from them                                                       |
| confirm        | `discord_id`: number, `tank_rank`: [rank](#ranks), `damage_rank`: [rank](#ranks), `support_rank`: [rank](#ranks) | Confirms a signup entry                                                                                                                        |
| countdown      | `discord_id`: number                                                                                             | Decrements the number of games played for the given player                                                                                     |
| countup        | `discord_id`: number                                                                                             | Increments the number of games played for the given player                                                                                     |
| echo           | anything                                                                                                         | Replies with the same params you have given                                                                                                    |
| env            | -                                                                                                                | Outputs the content of the NODE_ENV variable                                                                                                   |
| getunconfirmed | `count`                                                                                                          | Outputs the information of the `count` newest unconfirmed signups. **NOTE: CURRENTLY THE COMMAND DOES NOT WORK IF GIVEN THE `count` ARGUMENT** |
| latency        | -                                                                                                                | Outputs the bots latency                                                                                                                       |
| log            | `discord_id`: number                                                                                             | Displays a specific players entry by discord ID                                                                                                |
| ping           | `rank`: [rank](#ranks), `region`: [region](#signup), `streamer`: string                                          | Ping players with a certain rank for a lobby with the streamer and region in #player-pings                                                     |
| purge          | `number`: number                                                                                                 | Deletes `number`, but at most 100, previous messages in the channel                                                                            |
| reject         | `discord_id`: number                                                                                             | Removes the players signup                                                                                                                     |
| signup         | `battle_tag`: [battle tag](#signup), `region`: [region](#signup), `profile_screenshot`: attachment               | Sign up with btag, region and profile screenshot                                                                                               |
| stats          | -                                                                                                                | Display some stats for the event                                                                                                               |
| update         | `property`: [property](#changing-ranks-of-a-confirmed-user), `value`: [rank](#ranks), `discord_id`: number       | Updates the rank of a signed up player                                                                                                         |
