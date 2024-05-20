const players = [
	{ name: 'A', tankRank: 'BRONZE', damageRank: 'BRONZE', supportRank: 'SILVER', gamesPlayed: 5 },
	{ name: 'B', tankRank: 'BRONZE', damageRank: 'SILVER', supportRank: 'SILVER', gamesPlayed: 5 },
	{ name: 'C', tankRank: 'BRONZE', damageRank: 'BRONZE', supportRank: 'SILVER', gamesPlayed: 4 },
	{ name: 'D', tankRank: 'SILVER', damageRank: 'BRONZE', supportRank: 'BRONZE', gamesPlayed: 0 },
	{ name: 'E', tankRank: 'SILVER', damageRank: 'SILVER', supportRank: 'BRONZE', gamesPlayed: 0 },
]
const team1 = {
	rank: 'BRONZE',
	requiredTank: 1,
	requiredDamage: 1,
	requiredSupport: 1,
}
const team2 = {
	rank: 'SILVER',
	requiredTank: 1,
	requiredDamage: 1,
	requiredSupport: 1,
}

function sortPlayers(a, b, { rank }, sortByRolesInRank = false) {
	if (a.gamesPlayed > b.gamesPlayed) return 1
	if (a.gamesPlayed < b.gamesPlayed) return -1
	// Enable next 4 lines only in lockMethod
	if (sortByRolesInRank) {
		const aRolesInRank = Object.values(a).filter(v => v === rank).length
		const bRolesInRank = Object.values(b).filter(v => v === rank).length
		if (aRolesInRank > bRolesInRank) return 1
		if (aRolesInRank < bRolesInRank) return -1
	}

	return 0
}

function lockMethod() {
	const tankPlayersT1 = []
	const damagePlayersT1 = []
	const supportPlayersT1 = []
	const tankPlayersT2 = []
	const damagePlayersT2 = []
	const supportPlayersT2 = []

	for (const player of players) {
		if (player.tankRank === team1.rank) tankPlayersT1.push(player)
		if (player.damageRank === team1.rank) damagePlayersT1.push(player)
		if (player.supportRank === team1.rank) supportPlayersT1.push(player)
		if (player.tankRank === team2.rank) tankPlayersT2.push(player)
		if (player.damageRank === team2.rank) damagePlayersT2.push(player)
		if (player.supportRank === team2.rank) supportPlayersT2.push(player)
	}

	// Sort roles by which has the least players already
	const rolePools = Object.fromEntries(
		Object.entries({
			tankT1: { arr: tankPlayersT1, possibleArr: [], lockedArr: [], rank: team1.rank, required: team1.requiredTank },
			damageT1: {
				arr: damagePlayersT1,
				possibleArr: [],
				lockedArr: [],
				rank: team1.rank,
				required: team1.requiredDamage,
			},
			supportT1: {
				arr: supportPlayersT1,
				possibleArr: [],
				lockedArr: [],
				rank: team1.rank,
				required: team1.requiredSupport,
			},
			tankT2: { arr: tankPlayersT2, possibleArr: [], lockedArr: [], rank: team2.rank, required: team1.requiredTank },
			damageT2: {
				arr: damagePlayersT2,
				possibleArr: [],
				lockedArr: [],
				rank: team2.rank,
				required: team1.requiredDamage,
			},
			supportT2: {
				arr: supportPlayersT2,
				possibleArr: [],
				lockedArr: [],
				rank: team2.rank,
				required: team1.requiredSupport,
			},
		}).sort((a, b) => {
			if (a[1].arr.length < b[1].arr.length) return -1
			if (a[1].arr.length > b[1].arr.length) return 1

			return 0
		}),
	)

	Object.entries(rolePools).forEach(([name, rolePool]) => {
		// Sort players in pool by games played, region and amount of roles in correct rank
		rolePool.arr.sort((a, b) => sortPlayers(a, b, { rank: rolePool.rank }, true))
		// Filter out players who were locked in a previous role
		rolePool.possibleArr = rolePool.arr.filter(signup => !signup.playing)
		// Lock desired amount of players
		rolePool.lockedArr = rolePool.possibleArr.slice(0, rolePool.required)
		// Mark locked players as playing
		rolePool.lockedArr.forEach(signup => (signup.playing = true))

		// Add ingame roles and update db of all locked players
	})

	return rolePools
}

console.log(
	'lockMethod',
	Object.entries(lockMethod()).map(
		([n, p]) => `${n}: ${JSON.stringify(p.lockedArr[0], null, 2)}, ${JSON.stringify(p.lockedArr[1], null, 2)}`,
	),
)

function fluidMethod() {
	const pool = players.sort((a, b) => sortPlayers(a, b, { rank: lobbyRank }))

	const rolePools = {
		tank: [],
		damage: [],
		support: [],
	}

	for (const player of pool) {
		if (player.tankRank === lobbyRank) {
			rolePools.tank.push(player)
		} else if (player.damageRank === lobbyRank) {
			rolePools.damage.push(player)
		} else if (player.supportRank === lobbyRank) {
			rolePools.support.push(player)
		}

		if (rolePools.tank.length > counts.tank) {
			rolePools.tank.forEach((p, i) => {
				if (p.damageRank === lobbyRank && rolePools.damage.length < counts.damage) {
					rolePools.damage.push(p)
					rolePools.tank.splice(i, 1)
				} else if (p.supportRank === lobbyRank && rolePools.support.length < counts.support) {
					rolePools.support.push(p)
					rolePools.tank.splice(i, 1)
				}
			})
		}

		if (rolePools.damage.length > counts.damage) {
			rolePools.damage.forEach((p, i) => {
				if (p.tankRank === lobbyRank && rolePools.tank.length < counts.tank) {
					rolePools.tank.push(p)
					rolePools.damage.splice(i, 1)
				} else if (p.supportRank === lobbyRank && rolePools.support.length < counts.support) {
					rolePools.support.push(p)
					rolePools.damage.splice(i, 1)
				}
			})
		}

		if (rolePools.support.length > counts.support) {
			rolePools.support.forEach((p, i) => {
				if (p.dmg === lobbyRank && rolePools.damage.length < counts.damage) {
					rolePools.damage.push(p)
					rolePools.support.splice(i, 1)
				} else if (p.tankRank === lobbyRank && rolePools.tank.length < counts.tank) {
					rolePools.tank.push(p)
					rolePools.support.splice(i, 1)
				}
			})
		}
	}

	return rolePools
}

// console.log(
// 	'fluidMethod',
// 	Object.entries(fluidMethod()).map(([n, arr]) => `${n}: ${arr[0]?.battleTag}, ${arr[1]?.battleTag}`),
// )
