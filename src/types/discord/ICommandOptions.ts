import type { Contestant, ICommandInteraction, Lobby, Signup } from '../index.js'
import type { Collection } from 'mongodb'

export type ICommandOptions = {
	ia: ICommandInteraction
	mongoSignups: Collection<Signup>
	mongoLobbies: Collection<Lobby>
	mongoContestants: Collection<Contestant>
}
