import type { Role, TextChannel, VoiceChannel } from 'discord.js'
import { ClientError } from './types'
import type { ICommandInteraction } from './types'

export function getChannel(
	ia: ICommandInteraction,
	channelName: 'bot-commands' | 'matchmaker' | 'signup' | 'player-pings',
): TextChannel {
	const channel = ia.guild.channels.cache.find(channel => channel.name === channelName) as TextChannel
	if (!channel) throw new ClientError(ia, channelName + ' channel does not exist')
	return channel
}

export function getVoiceChannel(ia: ICommandInteraction, channelName: 'waiting lobby'): VoiceChannel {
	const channel = ia.guild.channels.cache.find(channel => channel.name.toLowerCase() === channelName) as VoiceChannel
	if (!channel) throw new ClientError(ia, channelName + ' channel does not exist')
	return channel
}

export function getRole(
	ia: ICommandInteraction,
	roleName:
		| 'INGAME'
		| 'LOBBY HOST'
		| 'GAUNTLET BRONZE'
		| 'GAUNTLET SILVER'
		| 'GAUNTLET GOLD'
		| 'GAUNTLET PLATINUM'
		| 'GAUNTLET DIAMOND'
		| 'GAUNTLET MASTER'
		| 'GAUNTLET GRANDMASTER'
		| 'GAUNTLET CHAMPION',
): Role {
	const role = ia.guild.roles.cache.find(role => role.name.toUpperCase() === roleName) as Role
	if (!role) throw new ClientError(ia, roleName + ' role does not exist')
	return role
}
