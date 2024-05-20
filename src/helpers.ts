import type { Rank, Region, Signup } from './types/index.js'

export function sortPlayers(a: Signup, b: Signup, region: Region, rank: Rank) {
	if (a.gamesPlayed > b.gamesPlayed) return 1
	if (a.gamesPlayed < b.gamesPlayed) return -1
	if (a.region === region && b.region !== region) return -1
	if (b.region === region && a.region !== region) return 1
	const aRolesInRank = Object.values(a).filter(v => v === rank).length
	const bRolesInRank = Object.values(b).filter(v => v === rank).length
	if (aRolesInRank > bRolesInRank) return 1
	if (aRolesInRank < bRolesInRank) return -1

	return 0
}
