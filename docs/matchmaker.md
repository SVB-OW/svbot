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

Required: 1-1-1

List of players who reacted to the next game ping

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 5 |
| B | g | - | - | 5 |
| C | g | g | - | 4 |
| D | - | g | g | 0 |
| E | - | - | g | 0 |

// Filled into the role pools
tankPlayers: [A, B, C]
damagePlayers: [A, C, D]
supportPlayers: [D, E]

// Sort by games played and specialists
possibleTankPlayers: [C, B, A]
possibleDamagePlayers: [D, C, A]
possibleSupportPlayers: [E, D]

// Result
lockedSupportPlayers: [E]
lockedTankPlayers: [C]
lockedDamagePlayers: [D]

## Rank up enemies

| Name | Tank | DAMAGE | Support | Games Played |
| A | b | b | s | 5 |
| B | b | s | s | 5 |
| C | b | b | s | 4 |
| D | s | b | b | 0 |
| E | s | s | b | 0 |

Required: T1: bronze 1-1-1, T2: silver 1-1-1

// Filled into the role pools
tankPlayersT1: [A, B, C]
damagePlayersT1: [A, C, D]
supportPlayersT1: [D, E]
tankPlayersT2: [D, E]
damagePlayersT2: [B, E]
supportPlayersT2: [A, B, C]

// Sort by games played and specialists
possibleTankPlayersT1: [C, B, A]
possibleDamagePlayersT1: [D, C, A]
possibleSupportPlayersT1: [E, D]
possibleTankPlayersT2: [D, E]
possibleDamagePlayersT2: [E, B]
possibleSupportPlayersT2: [C, A, B]

// Result
lockedSupportPlayersT1: [E]
lockedTankPlayersT2: [D]
lockedDamagePlayersT2: [B]
lockedTankPlayersT1: [C]
lockedDamagePlayersT1: [A]
lockedSupportPlayersT2: []

## V2 Fluid fill (not implemented)

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 0 |
| B | g | - | - | 5 |

playerPool: [A, B]

tank: [A]
damage: []

A tank -> damage
B tank
