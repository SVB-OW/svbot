import type { ICommandInteraction, Rank } from './types'
import type { Role, TextChannel } from 'discord.js'
import { ClientError } from './types'

export function getSignupChannel(ia: ICommandInteraction) {
	const signupChannel = ia.guild.channels.cache.find(c => c.name === 'signup') as TextChannel
	if (!signupChannel) throw new ClientError(ia, 'Signup channel does not exist')
	return signupChannel
}

export function getRankRoles(ia: ICommandInteraction): Record<string, Role> {
	const o = {
		BRONZE: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET BRONZE') as Role,
		SILVER: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET SILVER') as Role,
		GOLD: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET GOLD') as Role,
		PLATINUM: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET PLATINUM') as Role,
		DIAMOND: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET DIAMOND') as Role,
		MASTER: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET MASTER') as Role,
		GRANDMASTER: ia.guild.roles.cache.find(r => r.name.toUpperCase() === 'GAUNTLET GRANDMASTER') as Role,
	}

	Object.keys(o).forEach(v => {
		if (!o[v as keyof typeof o]) throw new ClientError(ia, `Role Gauntlet ${v} not found`)
	})

	return o
}
