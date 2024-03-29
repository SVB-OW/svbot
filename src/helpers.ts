import type { Rank, Region, Signup } from './types'

/**
 * converts command input to db value
 * @param input command argument
 * @returns false, if value is invalid otherwise the value for the database
 */
export function rankResolver(input: string): boolean | string {
	if (typeof input !== 'string') return false

	input = input.toUpperCase()

	if (['B', 'BRONZE'].includes(input)) return 'BRONZE'

	if (['S', 'SILVER'].includes(input)) return 'SILVER'

	if (['G', 'GOLD'].includes(input)) return 'GOLD'

	if (['P', 'PLAT', 'PLATINUM'].includes(input)) return 'PLATINUM'

	if (['D', 'DIA', 'DIAMOND'].includes(input)) return 'DIAMOND'

	if (['M', 'MASTER'].includes(input)) return 'MASTER'

	if (['GM', 'GRANDMASTER'].includes(input)) return 'GRANDMASTER'

	if (['C', 'CHAMPION'].includes(input)) return 'CHAMPION'
	// When no rank should be used
	if (input === '-') return '-'

	return false
}

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
