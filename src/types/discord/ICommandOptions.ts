import { CacheType, ChatInputCommandInteraction } from 'discord.js'
import { Collection } from 'mongodb'
import { Contestant, Lobby, Signup } from '..'

export type ICommandOptions = {
	ia: ChatInputCommandInteraction<CacheType>
	mongoSignups: Collection<Signup>
	mongoLobbies: Collection<Lobby>
	mongoContestants: Collection<Contestant>
}
