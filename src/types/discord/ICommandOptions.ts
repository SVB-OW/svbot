import type { Contestant, Lobby, Signup } from '..'
import type { ChatInputCommandInteraction } from 'discord.js'
import type { Collection } from 'mongodb'

export type ICommandOptions = {
	ia: ChatInputCommandInteraction<'cached'>
	mongoSignups: Collection<Signup>
	mongoLobbies: Collection<Lobby>
	mongoContestants: Collection<Contestant>
}
