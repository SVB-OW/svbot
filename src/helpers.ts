/**
 * converts command input to db value
 * @param input command argument
 * @returns false, if value is invalid otherwise the value for the database
 */
export function rankResolver(input: string): boolean | string {
	input = input.toUpperCase()

	if (['B', 'BRONZE'].includes(input)) return 'BRONZE'

	if (['S', 'SILVER'].includes(input)) return 'SILVER'

	if (['G', 'GOLD'].includes(input)) return 'GOLD'

	if (['P', 'PLAT', 'PLATINUM'].includes(input)) return 'PLATINUM'

	if (['D', 'DIA', 'DIAMOND'].includes(input)) return 'DIAMOND'

	if (['M', 'MASTER'].includes(input)) return 'MASTER'

	if (['GM', 'GRANDMASTER'].includes(input)) return 'GRANDMASTER'

	// When no rank should be used
	if (input === '-') return '-'

	return false
}