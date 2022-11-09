# Matchmaker

The announcement command is responsible for putting together players who reacted to the next game ping.

This document describes the matchmaker's responsibilities and how it works. It also contains the thoughts and comparisons to alternative approaches.

## V1

The first version of the matchmaker does the following steps:

- Get all players who reacted to the next game ping
- Loop through through the users who also have signed up
- For each check if they're confirmed and still member of the server
  - Sort role pools, by which has the least players already
  - If the player has the correct rank on the most needed role, then put them in that pool
  - Same for second and third most needed role
- Players in each pool get sorted by games played and streamer region
- Each role pool gets sliced to the correct amount of players given via parameters
- Updates games played, gives them @ingame and announces them in matchmaker and lobbby channels

## Problems

- We don't need the same amount of players on each role
- Players with 2 roles in the correct rank only get put into one role pool

## Example

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 5 |
| B | g | - | - | 0 |

Want 1 of each role

tankPlayers: [A]
damagePlayers: []

tankPlayers: [B, A]
damagePlayers: [B]

tankPlayers: B
damagePlayers: B

## V2 Lock player in role (WIP)

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 5 |
| B | g | - | - | 5 |
| C | g | g | - | 0 |
| D | - | g | g | 0 |
| E | - | - | g | 0 |
Required: 2-2-2

- Get all players who reacted to the next game ping and put them into the role pools
- Sort role pools, by which has the least players already
  rolePools: [support, damage, tank]
- For each role pool

  - Support: sort
    possibleSupportPlayers: [D, E]
    lockedSupport: [D, E]

  - DAMAGE: sort // D, E are eliminated
    possibleDAMAGEPlayers: [C, A]
    lockedDAMAGEPlayers: [C, A]

  - Tank: sort // C, A are eliminated
    possibleTankPlayers: [B]
    lockedTankPlayers: [B]

## V2 Shuffle (not implemented)

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 0 |
| B | g | - | - | 5 |

playerPool: [A, B]

tank: [A]
damage: []

A tank -> damage
B tank
