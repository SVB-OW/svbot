import type { CacheType, ChatInputCommandInteraction } from 'discord.js'
import type { Contestant, Lobby, Signup } from '..'
import type { Collection } from 'mongodb'

export type ICommandOptions = {
	ia: ChatInputCommandInteraction<CacheType>
	mongoSignups: Collection<Signup>
	mongoLobbies: Collection<Lobby>
	mongoContestants: Collection<Contestant>
}
