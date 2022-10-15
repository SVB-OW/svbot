import type { CacheType, ChatInputCommandInteraction } from 'discord.js'

export class ClientError extends Error {
	ia: ChatInputCommandInteraction<CacheType>

	constructor(ia: ChatInputCommandInteraction<CacheType>, ...params: any[]) {
		super(...params)
		this.name = 'ClientError'
		this.ia = ia
	}
}
