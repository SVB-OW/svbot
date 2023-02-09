# V2 Fluid fill (not implemented)

- Filter and sort players by games played
- Iterate every player until everything is filled
- Fill left to right, until role is full
- If next player should go into a full role, iterate players in that role from top to bottom, if they can be moved to a different role until it reaches the newest player
- If noone can be moved including the new player, the player is skipped
- Kick command (not yet implemented) removes ingame role, removes reaction from player, sets playing to false and reduces games played by 1
- Another command would run through this process again and highlight the diff

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 5 |
| B | g | - | - | 5 |
| C | g | g | - | 4 |
| D | - | g | g | 0 |
| E | - | - | g | 0 |

Sorted: [D, E, C, A, B], Required: 2-2-2

Player D
Tank: [], Damage: [D], Support: []

Player E
Tank: [], Damage: [D], Support: [E]

Player C
Tank: [C], Damage: [D], Support: [E]
(If 1-1-1, here we would exit)

Player A
Tank: [C, A], Damage: [D], Support: [E]

Player B
Tank: [C, A, B], Damage: [D], Support: [E] // !
Tank: [A, B], Damage: [D, C], Support: [E]

## Scenario 2

| Name | Tank | DAMAGE | Support | Games Played |
| A | g | g | - | 0 |
| B | g | - | - | 0 |
| C | g | g | - | 4 |
| D | - | g | g | 5 |
| E | - | - | g | 5 |

Sorted: [A, B, C, D, E], Required: 1-1-1

Player A
Tank: [A], Damage: [], Support: []

Player B
Tank: [A, B], Damage: [], Support: []
Tank: [B], Damage: [A], Support: []

Player C
Tank: [B, C], Damage: [A], Support: []
Tank: [B, C], Damage: [A], Support: [] // C cannot be moved and therefore cannot play

Player D
Tank: [B, C], Damage: [A, D], Support: []
Tank: [B, C], Damage: [A], Support: [D] // A cannot be moved, so D is tried to move
(If 1-1-1, here we would exit)
