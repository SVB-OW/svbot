import { Collection } from 'mongodb'
import { Contestant, ICommandMessage, Lobby, Signup } from '..'

export type ICommandOptions = {
	msg: ICommandMessage
	args: string[]
	mongoSignups: Collection<Signup>
	mongoLobbies: Collection<Lobby>
	mongoContenstants: Collection<Contestant>
}
