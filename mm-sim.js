const players = require('./assets/signups_20230129.json')
const lobbyRank = 'GOLD'
const counts = {
	tank: 2,
	damage: 2,
	support: 2,
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
	const tankPlayers = []
	const damagePlayers = []
	const supportPlayers = []

	for (const player of players) {
		if (player.tankRank === lobbyRank) tankPlayers.push(player)
		if (player.damageRank === lobbyRank) damagePlayers.push(player)
		if (player.supportRank === lobbyRank) supportPlayers.push(player)
	}

	// Sort roles by which has the least players already
	const rolePools = Object.fromEntries(
		Object.entries({
			tank: { arr: tankPlayers, possibleArr: [], lockedArr: [] },
			damage: { arr: damagePlayers, possibleArr: [], lockedArr: [] },
			support: { arr: supportPlayers, possibleArr: [], lockedArr: [] },
		}).sort((a, b) => {
			if (a[1].arr.length < b[1].arr.length) return -1
			if (a[1].arr.length > b[1].arr.length) return 1

			return 0
		}),
	)

	Object.entries(rolePools).forEach(([name, rolePool]) => {
		// Sort players in pool by games played, region and amount of roles in correct rank
		rolePool.arr.sort((a, b) => sortPlayers(a, b, { rank: lobbyRank }, true))
		// Filter out players who were locked in a previous role
		rolePool.possibleArr = rolePool.arr.filter(signup => !signup.playing)
		// Lock desired amount of players
		rolePool.lockedArr = rolePool.possibleArr.slice(0, counts[name])
		// Mark locked players as playing
		rolePool.lockedArr.forEach(signup => (signup.playing = true))

		// Add ingame roles and update db of all locked players
	})

	return rolePools
}

console.log(
	'lockMethod',
	Object.entries(lockMethod()).map(([n, p]) => `${n}: ${p.lockedArr[0]?.battleTag}, ${p.lockedArr[1]?.battleTag}`),
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

console.log(
	'fluidMethod',
	Object.entries(fluidMethod()).map(([n, arr]) => `${n}: ${arr[0]?.battleTag}, ${arr[1]?.battleTag}`),
)
